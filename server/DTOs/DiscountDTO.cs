using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs
{
    public class DiscountDTO
    {
        public int DiscountId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsOnSale { get; set; }

        // Navigation properties
        public string? BookTitle { get; set; }
    }
} 