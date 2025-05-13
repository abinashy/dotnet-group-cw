using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.Entities;

namespace BookNook.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context;

        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Book> CreateAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<Book?> GetByIdAsync(int id, bool includeRelated = true)
        {
            IQueryable<Book> query = _context.Books;

            if (includeRelated)
            {
                query = query
                    .Include(b => b.Publisher)
                    .Include(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Inventory)
                    .Include(b => b.Discounts)
                    .Include(b => b.DiscountHistory)
                    .Include(b => b.Reviews);
            }

            return await query.FirstOrDefaultAsync(b => b.BookId == id);
        }

        public async Task<List<Book>> GetAllAsync(bool includeRelated = true)
        {
            IQueryable<Book> query = _context.Books;

            if (includeRelated)
            {
                query = query
                    .Include(b => b.Publisher)
                    .Include(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Reviews);
            }

            return await query.ToListAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Book> UpdateAsync(Book book)
        {
            _context.Entry(book).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Books.AnyAsync(b => b.BookId == id);
        }

        public async Task<bool> IsbnExistsAsync(string isbn, int? excludeBookId = null)
        {
            return await _context.Books
                .AnyAsync(b => b.ISBN == isbn && (!excludeBookId.HasValue || b.BookId != excludeBookId));
        }
    }
} 