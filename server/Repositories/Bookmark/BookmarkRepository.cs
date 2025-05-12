using BookNook.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookNook.Repositories.Bookmark
{
    public class BookmarkRepository : IBookmarkRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookmarkRepository> _logger;

        public BookmarkRepository(ApplicationDbContext context, ILogger<BookmarkRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Entities.Bookmark> AddBookmarkAsync(string userId, int bookId)
        {
            try
            {
                var bookmark = new Entities.Bookmark
                {
                    UserId = userId,
                    BookId = bookId,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Bookmarks.AddAsync(bookmark);
                await _context.SaveChangesAsync();
                return bookmark;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bookmark for user {UserId} and book {BookId}", userId, bookId);
                throw;
            }
        }

        public async Task<Entities.Bookmark?> GetBookmarkAsync(string userId, int bookId)
        {
            return await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);
        }

        public async Task<IEnumerable<Entities.Bookmark>> GetUserBookmarksAsync(string userId)
        {
            return await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .Include(b => b.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsBookmarkedAsync(string userId, int bookId)
        {
            return await _context.Bookmarks
                .AnyAsync(b => b.UserId == userId && b.BookId == bookId);
        }

        public async Task RemoveBookmarkAsync(string userId, int bookId)
        {
            try
            {
                var bookmark = await GetBookmarkAsync(userId, bookId);
                if (bookmark != null)
                {
                    _context.Bookmarks.Remove(bookmark);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing bookmark for user {UserId} and book {BookId}", userId, bookId);
                throw;
            }
        }
    }
} 