using BookNook.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookNook.Repositories.Bookmark
{
    public interface IBookmarkRepository
    {
        /// <summary>
        /// Add a bookmark
        /// </summary>
        Task<Entities.Bookmark> AddBookmarkAsync(string userId, int bookId);
        
        /// <summary>
        /// Remove a bookmark
        /// </summary>
        Task RemoveBookmarkAsync(string userId, int bookId);
        
        /// <summary>
        /// Get all bookmarks for a user with book details
        /// </summary>
        Task<IEnumerable<Entities.Bookmark>> GetUserBookmarksAsync(string userId);
        
        /// <summary>
        /// Check if a book is bookmarked by a user
        /// </summary>
        Task<bool> IsBookmarkedAsync(string userId, int bookId);
        
        /// <summary>
        /// Get a specific bookmark
        /// </summary>
        Task<Entities.Bookmark?> GetBookmarkAsync(string userId, int bookId);
    }
} 