using BookNook.Entities;

namespace BookNook.Repositories
{
    public interface IInventoryRepository
    {
        Task<Inventory> CreateAsync(Inventory inventory);
        Task<Inventory?> GetByBookIdAsync(int bookId);
        Task<List<Inventory>> GetAllAsync();
        Task<Inventory> UpdateAsync(Inventory inventory);
        Task<bool> DeleteAsync(int inventoryId);
        Task<Inventory?> GetByIdAsync(int inventoryId);
    }
} 