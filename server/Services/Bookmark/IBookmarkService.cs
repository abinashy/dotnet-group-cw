using BookNook.DTOs.Bookmark;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookNook.Services.Bookmark
{
    public interface IBookmarkService
    {
        /// <summary>
        /// Add a book to user's wishlist
        /// </summary>
        Task<BookmarkDTO> AddBookmarkAsync(string userId, int bookId);
        
        /// <summary>
        /// Remove a book from user's wishlist
        /// </summary>
        Task RemoveBookmarkAsync(string userId, int bookId);
        
        /// <summary>
        /// Get all books in user's wishlist
        /// </summary>
        Task<IEnumerable<BookmarkDTO>> GetUserBookmarksAsync(string userId);
        
        /// <summary>
        /// Check if a book is in user's wishlist
        /// </summary>
        Task<bool> IsBookmarkedAsync(string userId, int bookId);
    }
} 