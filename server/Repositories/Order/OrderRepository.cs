using BookNook.Data;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Repositories.Order
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Entities.Order> CreateAsync(Entities.Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<Entities.Order?> GetByIdAsync(int orderId, long? userId = null, bool allowAnyUser = false)
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

        public async Task<List<Entities.Order>> GetAllByUserIdAsync(long userId)
        {
            Console.WriteLine($"[OrderRepository] Fetching orders for userId: {userId}");
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderHistory)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            Console.WriteLine($"[OrderRepository] Orders fetched: {orders.Count}");
            foreach (var order in orders)
            {
                if (order.OrderHistory == null)
                {
                    Console.WriteLine($"[OrderRepository] OrderId {order.OrderId} is missing OrderHistory!");
                }
                if (order.OrderItems == null || order.OrderItems.Count == 0)
                {
                    Console.WriteLine($"[OrderRepository] OrderId {order.OrderId} has no OrderItems!");
                }
            }
            return orders;
        }

        public async Task<List<Entities.Order>> GetAllWithSearchAsync(string? searchTerm = null)
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

        public async Task<bool> UpdateStatusAsync(int orderId, string status, string notes)
        {
            var order = await _context.Orders
                .Include(o => o.OrderHistory)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
                
            if (order == null)
                return false;
                
            order.Status = status;
            
            if (order.OrderHistory != null)
            {
                order.OrderHistory.Status = status;
                order.OrderHistory.StatusDate = DateTime.UtcNow;
                order.OrderHistory.Notes = notes;
            }
            else
            {
                order.OrderHistory = new OrderHistory
                {
                    Status = status,
                    StatusDate = DateTime.UtcNow,
                    Notes = notes
                };
            }
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> UserExistsAsync(long userId)
        {
            return await _context.Users.AnyAsync(u => u.Id == userId);
        }
        
        public async Task<User?> GetUserAsync(long userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
} 