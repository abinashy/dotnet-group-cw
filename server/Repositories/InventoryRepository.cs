using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.Entities;

namespace BookNook.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Inventory> CreateAsync(Inventory inventory)
        {
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<Inventory?> GetByBookIdAsync(int bookId)
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .FirstOrDefaultAsync(i => i.BookId == bookId);
        }

        public async Task<List<Inventory>> GetAllAsync()
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .ToListAsync();
        }

        public async Task<Inventory> UpdateAsync(Inventory inventory)
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

        public async Task<Inventory?> GetByIdAsync(int inventoryId)
        {
            return await _context.Inventories
                .Include(i => i.Book)
                .FirstOrDefaultAsync(i => i.InventoryId == inventoryId);
        }
    }
} 