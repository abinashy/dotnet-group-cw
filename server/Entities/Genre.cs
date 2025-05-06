using System.ComponentModel.DataAnnotations;

namespace BookNook.Entities
{
    public class Genre
    {
        [Key]
        public int GenreId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
    }
} 