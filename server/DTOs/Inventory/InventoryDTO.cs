using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs.Inventory
{
    public class InventoryDTO
    {
        public int InventoryId { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class InventoryResponseDTO : InventoryDTO
    {
        public string ISBN { get; set; } = string.Empty;
        public string PublisherName { get; set; } = string.Empty;
    }

    public class CreateInventoryDTO
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class UpdateInventoryDTO
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
    }
} 