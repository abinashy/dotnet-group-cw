using BookNook.Entities;

namespace BookNook.Repositories.Order
{
    public interface IOrderRepository
    {
        Task<Entities.Order> CreateAsync(Entities.Order order);
        Task<Entities.Order?> GetByIdAsync(int orderId, long? userId = null, bool allowAnyUser = false);
        Task<List<Entities.Order>> GetAllByUserIdAsync(long userId);
        Task<List<Entities.Order>> GetAllWithSearchAsync(string? searchTerm = null);
        Task<bool> UpdateStatusAsync(int orderId, string status, string notes);
        Task<bool> SaveChangesAsync();
        Task<bool> UserExistsAsync(long userId);
        Task<User?> GetUserAsync(long userId);
    }
} 