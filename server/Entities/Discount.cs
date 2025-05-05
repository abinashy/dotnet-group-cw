using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class Discount
    {
        [Key]
        public int DiscountId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        [Required]
        public DateTime EndDate { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc);

        public bool IsActive { get; set; } = true;

        public bool IsOnSale { get; set; } = false;

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;
    }
} 