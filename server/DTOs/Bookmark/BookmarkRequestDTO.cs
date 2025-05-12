using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs.Bookmark
{
    public class BookmarkRequestDTO
    {
        [Required]
        public int BookId { get; set; }
    }
} 