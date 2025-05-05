using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class BookAuthor
    {
        [Key]
        public int BookAuthorId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int AuthorId { get; set; }

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;

        [ForeignKey("AuthorId")]
        public virtual Author Author { get; set; } = null!;
    }
} 