using BookNook.DTOs.Inventory;

namespace BookNook.Services.Inventory
{
    public interface IInventoryService
    {
        Task<InventoryResponseDTO> CreateInventoryAsync(CreateInventoryDTO createInventoryDTO);
        Task<InventoryResponseDTO?> GetInventoryByBookIdAsync(int bookId);
        Task<List<InventoryResponseDTO>> GetAllInventoriesAsync();
        Task<InventoryResponseDTO> UpdateInventoryAsync(int inventoryId, UpdateInventoryDTO updateInventoryDTO);
        Task<bool> DeleteInventoryAsync(int inventoryId);
    }
} 