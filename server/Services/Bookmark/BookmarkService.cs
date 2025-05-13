using BookNook.DTOs.Bookmark;
using BookNook.Entities;
using BookNook.Repositories.Bookmark;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookNook.Services.Bookmark
{
    public class BookmarkService : IBookmarkService
    {
        private readonly IBookmarkRepository _bookmarkRepository;
        private readonly ILogger<BookmarkService> _logger;

        public BookmarkService(IBookmarkRepository bookmarkRepository, ILogger<BookmarkService> logger)
        {
            _bookmarkRepository = bookmarkRepository;
            _logger = logger;
        }

        public async Task<BookmarkDTO> AddBookmarkAsync(string userId, int bookId)
        {
            try
            {
                // Check if already bookmarked
                if (await _bookmarkRepository.IsBookmarkedAsync(userId, bookId))
                {
                    throw new InvalidOperationException($"Book {bookId} is already in user's wishlist");
                }

                var bookmark = await _bookmarkRepository.AddBookmarkAsync(userId, bookId);
                
                // Ensure the bookmark includes the book
                var bookmarkWithDetails = await _bookmarkRepository.GetBookmarkAsync(userId, bookId);
                
                // Map to DTO
                return new BookmarkDTO
                {
                    BookmarkId = bookmark.BookmarkId,
                    BookId = bookmark.BookId,
                    UserId = bookmark.UserId,
                    CreatedAt = bookmark.CreatedAt,
                    BookTitle = bookmarkWithDetails?.Book?.Title ?? string.Empty,
                    Price = bookmarkWithDetails?.Book?.Price ?? 0,
                    CoverImageUrl = bookmarkWithDetails?.Book?.CoverImageUrl ?? string.Empty,
                    AuthorName = GetAuthorNameFromBook(bookmarkWithDetails?.Book),
                    Availability = bookmarkWithDetails?.Book?.Inventory?.Quantity ?? 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bookmark for user {UserId} and book {BookId}", userId, bookId);
                throw;
            }
        }

        public async Task<IEnumerable<BookmarkDTO>> GetUserBookmarksAsync(string userId)
        {
            try
            {
                var bookmarks = await _bookmarkRepository.GetUserBookmarksAsync(userId);
                
                return bookmarks.Select(b => new BookmarkDTO
                {
                    BookmarkId = b.BookmarkId,
                    BookId = b.BookId,
                    UserId = b.UserId,
                    CreatedAt = b.CreatedAt,
                    BookTitle = b.Book?.Title ?? string.Empty,
                    Price = b.Book?.Price ?? 0,
                    CoverImageUrl = b.Book?.CoverImageUrl ?? string.Empty,
                    AuthorName = GetAuthorNameFromBook(b.Book),
                    Availability = b.Book?.Inventory?.Quantity ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bookmarks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> IsBookmarkedAsync(string userId, int bookId)
        {
            return await _bookmarkRepository.IsBookmarkedAsync(userId, bookId);
        }

        public async Task RemoveBookmarkAsync(string userId, int bookId)
        {
            try
            {
                await _bookmarkRepository.RemoveBookmarkAsync(userId, bookId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing bookmark for user {UserId} and book {BookId}", userId, bookId);
                throw;
            }
        }

        // Helper method to extract author name from book
        private string GetAuthorNameFromBook(BookNook.Entities.Book? book)
        {
            if (book == null || book.BookAuthors == null || !book.BookAuthors.Any())
                return "Unknown Author";
            
            var bookAuthor = book.BookAuthors.FirstOrDefault();
            if (bookAuthor?.Author == null)
                return "Unknown Author";
            
            return $"{bookAuthor.Author.FirstName} {bookAuthor.Author.LastName}";
        }
    }
} 