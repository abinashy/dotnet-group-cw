using System;
using System.Collections.Generic;

namespace BookNook.DTOs
{
    public class CartItemDto
    {
        public int CartId { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public List<string> Genres { get; set; } = new List<string>();
        public string Format { get; set; } = string.Empty;
        public int Availability { get; set; } // Inventory quantity
    }
} 