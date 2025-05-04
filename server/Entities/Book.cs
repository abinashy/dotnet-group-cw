using System;
using System.ComponentModel.DataAnnotations;

namespace BookNook.Entities
{
    public class Book
    {
        public long Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public DateTime PublicationDate { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsOnSale { get; set; }
        public decimal? DiscountPrice { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }
        public double? Rating { get; set; }
        public int? RatingsCount { get; set; }
        public bool IsAvailableInLibrary { get; set; }
    }
} 