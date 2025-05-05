using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookNook.Services;

namespace BookNook.Entities
{
    public class MemberDiscount
    {
        [Key]
        public int MemberDiscountId { get; set; }

        [Required]
        public long UserId { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage { get; set; }

        public bool IsUsed { get; set; } = false;

        [Required]
        public DateTime ExpiryDate { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow.AddMonths(1), DateTimeKind.Utc);

        public DateTime CreatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
} 