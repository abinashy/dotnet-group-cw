using System.ComponentModel.DataAnnotations;

namespace BookNook.Entities
{
    public class Publisher
    {
        [Key]
        public int PublisherId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }

        // Navigation properties
        public virtual ICollection<Book> Books { get; set; } = new List<Book>();
    }
} 