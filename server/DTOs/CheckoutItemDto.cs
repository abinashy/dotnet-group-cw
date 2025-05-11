using System;
using System.Collections.Generic;

namespace BookNook.DTOs
{
    public class CheckoutItemDto
    {
        public int CartId { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }
        public List<string> AuthorNames { get; set; } = new List<string>();
        public List<string> Genres { get; set; } = new List<string>();
        public string Format { get; set; } = string.Empty;
        public int Availability { get; set; } // Inventory quantity
        public string Publisher { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int PublicationYear { get; set; }
        public int PageCount { get; set; }
        public string Language { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public bool IsDiscountActive { get; set; }
    }
} 