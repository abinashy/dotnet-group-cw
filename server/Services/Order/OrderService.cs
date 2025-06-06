using BookNook.Data;
using BookNook.DTOs;
using BookNook.DTOs.Order;
using BookNook.Entities;
using BookNook.Hubs;
using BookNook.Repositories.Order;
using BookNook.Services.Email;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace BookNook.Services.Order
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IHubContext<OrderNotificationHub> _orderHubContext;

        public OrderService(
            IOrderRepository orderRepository,
            ApplicationDbContext context, 
            IEmailService emailService,
            IHubContext<OrderNotificationHub> orderHubContext)
        {
            _orderRepository = orderRepository;
            _context = context;
            _emailService = emailService;
            _orderHubContext = orderHubContext;
        }

        public async Task<Entities.Order> CreateOrderAsync(long userId, CreateOrderDto orderDto)
        {
            // No navigation property for Orders on User, so query directly
            var user = await _orderRepository.GetUserAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            // Calculate total amount and apply discounts
            decimal totalAmount = 0; // sum of original prices
            decimal perBookDiscountAmount = 0; // sum of all per-book discounts
            decimal member5PercentDiscount = 0;
            decimal member10PercentDiscount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in orderDto.Items)
            {
                var book = await _context.Books
                    .Include(b => b.Inventory)
                    .FirstOrDefaultAsync(b => b.BookId == item.BookId);
                if (book == null)
                    throw new Exception($"Book with ID {item.BookId} not found");

                if (book.Inventory == null)
                    throw new Exception($"Inventory not found for book: {book.Title}");

                if (book.Inventory.Quantity < item.Quantity)
                    throw new Exception($"Insufficient stock for book: {book.Title}");

                // Check for active discount
                var now = DateTime.UtcNow;
                var discount = await _context.Discounts
                    .Where(d => d.BookId == book.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                    .OrderByDescending(d => d.DiscountPercentage)
                    .FirstOrDefaultAsync();
                decimal unitPrice = book.Price;
                decimal itemDiscount = 0;
                if (discount != null)
                {
                    unitPrice = book.Price * (1 - discount.DiscountPercentage / 100);
                    itemDiscount = (book.Price - unitPrice) * item.Quantity;
                }

                var orderItem = new OrderItem
                {
                    BookId = book.BookId,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice
                };

                orderItems.Add(orderItem);
                totalAmount += book.Price * item.Quantity; // original price
                perBookDiscountAmount += itemDiscount;

                // Update book stock
                book.Inventory.Quantity -= item.Quantity;
            }

            decimal discountAmount = perBookDiscountAmount;

            // 5% discount for 5+ books
            if (orderItems.Sum(i => i.Quantity) >= 5)
            {
                member5PercentDiscount = totalAmount * 0.05m;
                discountAmount += member5PercentDiscount;
            }

            // 10% stackable member discount (from MemberDiscount table)
            var memberDiscount = await _context.MemberDiscounts
                .Where(md => md.UserId == userId && !md.IsUsed && md.ExpiryDate > DateTime.UtcNow && md.DiscountPercentage == 10)
                .OrderBy(md => md.ExpiryDate)
                .FirstOrDefaultAsync();
            if (memberDiscount != null)
            {
                member10PercentDiscount = totalAmount * 0.10m;
                discountAmount += member10PercentDiscount;
                memberDiscount.IsUsed = true;
                await _context.SaveChangesAsync();
            }

            // Before creating the Order, add:
            if (string.IsNullOrWhiteSpace("Pending"))
                throw new Exception("Order status cannot be null or empty.");

            // Generate claim code
            var claimCode = GenerateClaimCode();
            if (string.IsNullOrWhiteSpace(claimCode))
                throw new Exception("Claim code cannot be null or empty.");

            var order = new Entities.Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                DiscountAmount = discountAmount,
                FinalAmount = totalAmount - discountAmount,
                Status = "Pending",
                ClaimCode = claimCode,
                IsClaimed = false,
                OrderItems = orderItems,
                OrderHistory = new OrderHistory
                {
                    Status = "Pending",
                    StatusDate = DateTime.UtcNow,
                    Notes = "Order created"
                }
            };

            // Create order using repository
            await _orderRepository.CreateAsync(order);

            // Notify staff about new order via email
            await _emailService.SendOrderNotificationToStaffAsync(order);

            // Send real-time notification to staff
            var confirmationDto = new OrderConfirmationDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                TotalAmount = order.TotalAmount,
                FinalAmount = order.FinalAmount,
                DiscountAmount = order.DiscountAmount,
                OrderDate = order.OrderDate,
                Status = order.Status,
                OrderItems = order.OrderItems.Select(oi => new OrderItemConfirmationDto
                {
                    BookId = oi.BookId,
                    BookTitle = oi.Book?.Title ?? "Unknown Book",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            };
            
            try 
            {
                Console.WriteLine($"Sending real-time notification to staff group for order {order.OrderId}");
                
                // Multiple attempts to ensure delivery
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        // Only send to staff group, not to all clients
                        await _orderHubContext.Clients.Group("staff").SendAsync("ReceiveNewOrder", confirmationDto);
                        
                        Console.WriteLine($"Notification sent successfully to staff group (attempt {attempt})");
                        break; // Success, exit the retry loop
                    }
                    catch (Exception retryEx)
                    {
                        Console.WriteLine($"Attempt {attempt} failed: {retryEx.Message}");
                        if (attempt == 3) throw; // Rethrow on last attempt
                        await Task.Delay(500); // Wait before retrying
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending staff notification: {ex.Message}");
                // Log but don't rethrow, as this should not fail the order creation
            }

            return order;
        }

        public async Task<Entities.Order?> GetOrderByIdAsync(int orderId, long? userId = null, bool allowAnyUser = false)
        {
            return await _orderRepository.GetByIdAsync(orderId, userId, allowAnyUser);
        }

        public async Task CancelOrderAsync(int orderId, long userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.OrderHistory)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                throw new Exception("Order not found");

            if (order.Status != "Pending")
                throw new Exception("Only pending orders can be cancelled");

            // Restore book quantities
            foreach (var item in order.OrderItems)
            {
                var book = await _context.Books
                    .Include(b => b.Inventory)
                    .FirstOrDefaultAsync(b => b.BookId == item.BookId);
                if (book != null && book.Inventory != null)
                {
                    book.Inventory.Quantity += item.Quantity;
                }
            }

            // Update status through repository
            await _orderRepository.UpdateStatusAsync(orderId, "Cancelled", "Order cancelled by user");

            // Send order cancellation notification
            var confirmationDto = new OrderConfirmationDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                TotalAmount = order.TotalAmount,
                FinalAmount = order.FinalAmount,
                DiscountAmount = order.DiscountAmount,
                OrderDate = order.OrderDate,
                Status = "Cancelled",
                OrderItems = order.OrderItems.Select(oi => new OrderItemConfirmationDto
                {
                    BookId = oi.BookId,
                    BookTitle = oi.Book?.Title ?? "Unknown Book",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            };
            
            try
            {
                Console.WriteLine($"Sending order cancellation notification to staff for order {order.OrderId}");
                
                // Multiple attempts to ensure delivery
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        // Only send to staff group, not to all clients
                        await _orderHubContext.Clients.Group("staff").SendAsync("ReceiveOrderCancelled", confirmationDto);
                        
                        Console.WriteLine($"Cancellation notification sent successfully to staff group (attempt {attempt})");
                        break; // Success, exit the retry loop
                    }
                    catch (Exception retryEx)
                    {
                        Console.WriteLine($"Attempt {attempt} failed: {retryEx.Message}");
                        if (attempt == 3) throw; // Rethrow on last attempt
                        await Task.Delay(500); // Wait before retrying
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending cancellation notification: {ex.Message}");
                // Log but don't rethrow, as this should not fail the order cancellation
            }

            // Send email notification to staff
            await _emailService.SendOrderCancellationToStaffAsync(order);
        }

        public async Task<List<Entities.Order>> GetOrderHistoryAsync(long userId)
        {
            return await _orderRepository.GetAllByUserIdAsync(userId);
        }

        public async Task<List<Entities.Order>> GetAllOrdersAsync(string? searchTerm = null)
        {
            return await _orderRepository.GetAllWithSearchAsync(searchTerm);
        }

        public async Task SaveChangesAsync()
        {
            await _orderRepository.SaveChangesAsync();
        }

        private string GenerateClaimCode()
        {
            // Use RandomNumberGenerator instead of obsolete RNGCryptoServiceProvider
            var bytes = new byte[4];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return BitConverter.ToString(bytes).Replace("-", "").Substring(0, 8);
        }

        public async Task CompleteOrderAsync(int orderId, string claimCode)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.OrderHistory)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new Exception("Order not found");

            if (order.Status == "Completed")
                throw new Exception("Order is already completed");

            if (!string.Equals(order.ClaimCode?.Trim(), claimCode?.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new Exception("Invalid claim code");

            // Update order status using repository
            await _orderRepository.UpdateStatusAsync(orderId, "Completed", "Order marked as completed by staff");
            
            // Update IsClaimed and ClaimedDate directly
            order.IsClaimed = true;
            order.ClaimedDate = DateTime.UtcNow;
            
            // Grant 10% member discount after every 10th completed order
            Console.WriteLine($"[OrderService] Checking if order #{orderId} for user {order.UserId} is a 10th completed order");
            var completedOrdersBefore = await _context.Orders
                .CountAsync(o => o.UserId == order.UserId && o.Status == "Completed");
            
            Console.WriteLine($"[OrderService] User has {completedOrdersBefore} completed orders (including this one)");
            
            if ((completedOrdersBefore - 1) % 10 == 9) // This is the 10th, 20th, etc. order (9 completed before, this is the 10th)
            {
                Console.WriteLine($"[OrderService] This is the user's {completedOrdersBefore}th order - creating 10% discount");
                
                // Clean up expired discounts first
                var expiredDiscounts = await _context.MemberDiscounts
                    .Where(md => md.UserId == order.UserId && md.ExpiryDate <= DateTime.UtcNow)
                    .ToListAsync();
                    
                if (expiredDiscounts.Any())
                {
                    Console.WriteLine($"[OrderService] Removing {expiredDiscounts.Count} expired discounts");
                    _context.MemberDiscounts.RemoveRange(expiredDiscounts);
                    await _context.SaveChangesAsync();
                }

                var hasUnused = await _context.MemberDiscounts
                    .AnyAsync(md => md.UserId == order.UserId && !md.IsUsed && md.DiscountPercentage == 10 && md.ExpiryDate > DateTime.UtcNow);
                    
                if (!hasUnused)
                {
                    Console.WriteLine($"[OrderService] Creating new 10% discount for user {order.UserId}");
                    _context.MemberDiscounts.Add(new Entities.MemberDiscount
                    {
                        UserId = order.UserId,
                        DiscountPercentage = 10,
                        IsUsed = false,
                        ExpiryDate = DateTime.UtcNow.AddMonths(3),
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    Console.WriteLine($"[OrderService] User already has an unused 10% discount");
                }
            }
            
            await _context.SaveChangesAsync();

            // Send real-time notification to the user
            var confirmationDto = new OrderConfirmationDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                TotalAmount = order.TotalAmount,
                FinalAmount = order.FinalAmount,
                DiscountAmount = order.DiscountAmount,
                OrderDate = order.OrderDate,
                Status = "Completed",
                OrderItems = order.OrderItems.Select(oi => new OrderItemConfirmationDto
                {
                    BookId = oi.BookId,
                    BookTitle = oi.Book?.Title ?? "Unknown Book", 
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            };
            
            try
            {
                Console.WriteLine($"Sending order completion notification to user {order.UserId} for order {order.OrderId}");
                
                // Multiple attempts to ensure delivery to the user
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        await _orderHubContext.Clients.Group(order.UserId.ToString()).SendAsync("ReceiveOrderCompleted", confirmationDto);
                        Console.WriteLine($"Order completion notification sent successfully to user {order.UserId} (attempt {attempt})");
                        break; // Success, exit the retry loop
                    }
                    catch (Exception retryEx)
                    {
                        Console.WriteLine($"Attempt {attempt} failed: {retryEx.Message}");
                        if (attempt == 3) throw; // Rethrow on last attempt
                        await Task.Delay(500); // Wait before retrying
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending order completion notification: {ex.Message}");
                // Log but don't rethrow as this shouldn't fail the order completion
            }
        }
    }
} 