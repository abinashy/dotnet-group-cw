using BookNook.DTOs.Inventory;
using BookNook.Entities;
using BookNook.Repositories.Books;
using BookNook.Repositories.Inventory;

namespace BookNook.Services.Inventory
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IBookRepository _bookRepository;

        public InventoryService(IInventoryRepository inventoryRepository, IBookRepository bookRepository)
        {
            _inventoryRepository = inventoryRepository;
            _bookRepository = bookRepository;
        }

        public async Task<InventoryResponseDTO> CreateInventoryAsync(CreateInventoryDTO createInventoryDTO)
        {
            var book = await _bookRepository.GetByIdAsync(createInventoryDTO.BookId)
                ?? throw new Exception("Book not found");

            var inventory = new Entities.Inventory
            {
                BookId = createInventoryDTO.BookId,
                Quantity = createInventoryDTO.Quantity,
                LastUpdated = DateTime.UtcNow
            };

            var createdInventory = await _inventoryRepository.CreateAsync(inventory);
            return MapToInventoryResponseDTO(createdInventory);
        }

        public async Task<InventoryResponseDTO?> GetInventoryByBookIdAsync(int bookId)
        {
            var inventory = await _inventoryRepository.GetByBookIdAsync(bookId);
            return inventory == null ? null : MapToInventoryResponseDTO(inventory);
        }

        public async Task<List<InventoryResponseDTO>> GetAllInventoriesAsync()
        {
            var inventories = await _inventoryRepository.GetAllAsync();
            return inventories.Select(MapToInventoryResponseDTO).ToList();
        }

        public async Task<InventoryResponseDTO> UpdateInventoryAsync(int inventoryId, UpdateInventoryDTO updateInventoryDTO)
        {
            var inventory = await _inventoryRepository.GetByIdAsync(inventoryId)
                ?? throw new Exception("Inventory not found");

            inventory.Quantity = updateInventoryDTO.Quantity;
            inventory.LastUpdated = DateTime.UtcNow;

            var updatedInventory = await _inventoryRepository.UpdateAsync(inventory);
            return MapToInventoryResponseDTO(updatedInventory);
        }

        public async Task<bool> DeleteInventoryAsync(int inventoryId)
        {
            return await _inventoryRepository.DeleteAsync(inventoryId);
        }

        private static InventoryResponseDTO MapToInventoryResponseDTO(Entities.Inventory inventory)
        {
            return new InventoryResponseDTO
            {
                InventoryId = inventory.InventoryId,
                BookId = inventory.BookId,
                BookTitle = inventory.Book?.Title ?? string.Empty,
                ISBN = inventory.Book?.ISBN ?? string.Empty,
                PublisherName = inventory.Book?.Publisher?.Name ?? string.Empty,
                Quantity = inventory.Quantity,
                LastUpdated = inventory.LastUpdated
            };
        }
    }
} 