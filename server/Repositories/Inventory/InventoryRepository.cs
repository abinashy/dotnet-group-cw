using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.Entities;

namespace BookNook.Repositories.Inventory
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Entities.Inventory> CreateAsync(Entities.Inventory inventory)
        {
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<Entities.Inventory?> GetByBookIdAsync(int bookId)
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .FirstOrDefaultAsync(i => i.BookId == bookId);
        }

        public async Task<List<Entities.Inventory>> GetAllAsync()
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .ToListAsync();
        }

        public async Task<Entities.Inventory> UpdateAsync(Entities.Inventory inventory)
        {
            _context.Entry(inventory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<bool> DeleteAsync(int inventoryId)
        {
            var inventory = await _context.Inventories.FindAsync(inventoryId);
            if (inventory == null) return false;

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Entities.Inventory?> GetByIdAsync(int inventoryId)
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .FirstOrDefaultAsync(i => i.InventoryId == inventoryId);
        }
    }
} 