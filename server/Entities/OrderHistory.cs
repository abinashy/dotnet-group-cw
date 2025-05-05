using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class OrderHistory
    {
        [Key]
        public int HistoryId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;

        [Required]
        public DateTime StatusDate { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } = null!;
    }
} 