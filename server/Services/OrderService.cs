using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace BookNook.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(long userId, CreateOrderDto orderDto);
        Task<Order> GetOrderByIdAsync(int orderId, long userId);
        Task CancelOrderAsync(int orderId, long userId);
        Task<List<Order>> GetOrderHistoryAsync(long userId);
    }

    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public OrderService(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<Order> CreateOrderAsync(long userId, CreateOrderDto orderDto)
        {
            // No navigation property for Orders on User, so query directly
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            // Calculate total amount and apply discounts
            decimal totalAmount = 0;
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

                var orderItem = new OrderItem
                {
                    BookId = book.BookId,
                    Quantity = item.Quantity,
                    UnitPrice = book.Price
                };

                orderItems.Add(orderItem);
                totalAmount += book.Price * item.Quantity;

                // Update book stock
                book.Inventory.Quantity -= item.Quantity;
            }

            decimal discountAmount = 0;

            // Apply 5% discount for 5+ books
            if (orderItems.Sum(i => i.Quantity) >= 5)
            {
                discountAmount = totalAmount * 0.05m;
            }

            // Apply 10% stackable discount if eligible (10+ successful orders)
            var successfulOrders = await _context.Orders
                .CountAsync(o => o.UserId == userId && o.Status == "Completed");
            if (successfulOrders >= 10)
            {
                discountAmount += totalAmount * 0.10m;
            }

            // Before creating the Order, add:
            if (string.IsNullOrWhiteSpace("Pending"))
                throw new Exception("Order status cannot be null or empty.");

            // Generate claim code
            var claimCode = GenerateClaimCode();
            if (string.IsNullOrWhiteSpace(claimCode))
                throw new Exception("Claim code cannot be null or empty.");

            var order = new Order
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

            return order;
        }

        public async Task<Order> GetOrderByIdAsync(int orderId, long userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.OrderHistory)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);
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
                if (book?.Inventory != null)
                {
                    book.Inventory.Quantity += item.Quantity;
                }
            }

            order.Status = "Cancelled";
            order.OrderHistory.Status = "Cancelled";
            order.OrderHistory.StatusDate = DateTime.UtcNow;
            order.OrderHistory.Notes = "Order cancelled by user";

            await _context.SaveChangesAsync();
        }

        public async Task<List<Order>> GetOrderHistoryAsync(long userId)
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
    }
} 