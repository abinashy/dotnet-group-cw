using BookNook.Entities;

namespace BookNook.Repositories.Inventory
{
    public interface IInventoryRepository
    {
        Task<Entities.Inventory> CreateAsync(Entities.Inventory inventory);
        Task<Entities.Inventory?> GetByBookIdAsync(int bookId);
        Task<List<Entities.Inventory>> GetAllAsync();
        Task<Entities.Inventory> UpdateAsync(Entities.Inventory inventory);
        Task<bool> DeleteAsync(int inventoryId);
        Task<Entities.Inventory?> GetByIdAsync(int inventoryId);
    }
} 