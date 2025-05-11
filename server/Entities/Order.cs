using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        public long UserId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal FinalAmount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ClaimCode { get; set; }

        public bool IsClaimed { get; set; } = false;

        public DateTime? ClaimedDate { get; set; }

        // Navigation properties
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual OrderHistory OrderHistory { get; set; } = null!;
    }
} 