using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class Bookmark
    {
        [Key]
        public int BookmarkId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int BookId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;
    }
} 