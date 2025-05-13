using BookNook.Data;
using BookNook.DTOs;
using BookNook.DTOs.Order;
using BookNook.Entities;
using BookNook.Hubs;
using BookNook.Services.Email;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace BookNook.Services.Order
{
    public interface IOrderService
    {
        Task<Entities.Order> CreateOrderAsync(long userId, CreateOrderDto orderDto);
        Task<Entities.Order?> GetOrderByIdAsync(int orderId, long? userId = null, bool allowAnyUser = false);
        Task CancelOrderAsync(int orderId, long userId);
        Task<List<Entities.Order>> GetOrderHistoryAsync(long userId);
        Task<List<Entities.Order>> GetAllOrdersAsync(string? searchTerm = null);
        Task SaveChangesAsync();
        Task CompleteOrderAsync(int orderId, string claimCode);
    }

    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IHubContext<OrderNotificationHub> _orderHubContext;

        public OrderService(
            ApplicationDbContext context, 
            IEmailService emailService,
            IHubContext<OrderNotificationHub> orderHubContext)
        {
            _context = context;
            _emailService = emailService;
            _orderHubContext = orderHubContext;
        }

        public async Task<Entities.Order> CreateOrderAsync(long userId, CreateOrderDto orderDto)
        {
            // No navigation property for Orders on User, so query directly
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
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

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

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
                        await _orderHubContext.Clients.Group("staff").SendAsync("ReceiveNewOrder", confirmationDto);
                        
                        // Also send directly to all clients to ensure delivery
                        await _orderHubContext.Clients.All.SendAsync("ReceiveNewOrder", confirmationDto);
                        
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
            if (allowAnyUser)
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Book)
                    .Include(o => o.OrderHistory)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
            }
            else if (userId.HasValue)
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Book)
                    .Include(o => o.OrderHistory)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);
            }
            return null;
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

            order.Status = "Cancelled";
            if (order.OrderHistory != null)
            {
                order.OrderHistory.Status = "Cancelled";
                order.OrderHistory.StatusDate = DateTime.UtcNow;
                order.OrderHistory.Notes = "Order cancelled by user";
            }
            else
            {
                order.OrderHistory = new OrderHistory
                {
                    Status = "Cancelled",
                    StatusDate = DateTime.UtcNow,
                    Notes = "Order cancelled by user"
                };
            }

            await _context.SaveChangesAsync();

            // Notify staff about order cancellation via email
            await _emailService.SendOrderCancellationToStaffAsync(order);
            
            // Send real-time notification to staff about cancellation
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
                Console.WriteLine($"Sending order cancellation notification to staff for order {order.OrderId}");
                
                // Multiple attempts to ensure delivery
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        await _orderHubContext.Clients.Group("staff").SendAsync("ReceiveOrderCancelled", confirmationDto);
                        
                        // Also try sending to all clients as a backup
                        await _orderHubContext.Clients.All.SendAsync("ReceiveOrderCancelled", confirmationDto);
                        
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
        }

        public async Task<List<Entities.Order>> GetOrderHistoryAsync(long userId)
        {
            Console.WriteLine($"[OrderService] Fetching orders for userId: {userId}");
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderHistory)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            Console.WriteLine($"[OrderService] Orders fetched: {orders.Count}");
            foreach (var order in orders)
            {
                if (order.OrderHistory == null)
                {
                    Console.WriteLine($"[OrderService] OrderId {order.OrderId} is missing OrderHistory!");
                }
                if (order.OrderItems == null || order.OrderItems.Count == 0)
                {
                    Console.WriteLine($"[OrderService] OrderId {order.OrderId} has no OrderItems!");
                }
            }
            return orders;
        }

        public async Task<List<Entities.Order>> GetAllOrdersAsync(string? searchTerm = null)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.OrderHistory)
                .OrderByDescending(o => o.OrderDate)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                // Get user IDs that match search term (either by ID or name)
                var matchingUserIds = await _context.Users
                    .Where(u => u.Id.ToString().Contains(searchTerm) || 
                               (u.FirstName + " " + u.LastName).Contains(searchTerm) ||
                               u.Email.Contains(searchTerm))
                    .Select(u => u.Id)
                    .ToListAsync();

                // Filter orders by those user IDs
                query = query.Where(o => matchingUserIds.Contains(o.UserId));
            }

            return await query.ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
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

            order.Status = "Completed";
            order.OrderHistory.Status = "Completed";
            order.OrderHistory.StatusDate = DateTime.UtcNow;
            order.OrderHistory.Notes = "Order marked as completed by staff";
            
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
                Console.WriteLine($"Sending order completion notification to user {order.UserId} for order {order.OrderId}");
                await _orderHubContext.Clients.Group(order.UserId.ToString()).SendAsync("ReceiveOrderCompleted", confirmationDto);
                Console.WriteLine($"Order completion notification sent successfully to user {order.UserId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending order completion notification: {ex.Message}");
                // Log but don't rethrow as this shouldn't fail the order completion
            }
        }
    }
} 