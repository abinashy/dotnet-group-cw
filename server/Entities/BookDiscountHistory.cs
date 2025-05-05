using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookNook.Services;

namespace BookNook.Entities
{
    public class BookDiscountHistory
    {
        [Key]
        public int DiscountHistoryId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal OriginalPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountedPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public long CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;

        [ForeignKey("CreatedBy")]
        public virtual User User { get; set; } = null!;
    }
} 