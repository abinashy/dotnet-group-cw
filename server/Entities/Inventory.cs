using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class Inventory
    {
        [Key]
        public int InventoryId { get; set; }

        [Required]
        public int BookId { get; set; }

        public int Quantity { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; } = null!;
    }
} 