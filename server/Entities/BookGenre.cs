using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class BookGenre
    {
        [Key]
        public int BookGenreId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int GenreId { get; set; }

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;

        [ForeignKey("GenreId")]
        public virtual Genre Genre { get; set; } = null!;
    }
} 