using BookNook.DTOs.Order;
using BookNook.Entities;

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
} 