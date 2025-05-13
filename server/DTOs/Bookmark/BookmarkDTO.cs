using System;

namespace BookNook.DTOs.Bookmark
{
    public class BookmarkDTO
    {
        public int BookmarkId { get; set; }
        public int BookId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        
        // Book details for display
        public string BookTitle { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int Availability { get; set; }
    }
} 