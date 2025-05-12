using System;

namespace BookNook.DTOs
{
    public class OrderConfirmationDto
    {
        public int OrderId { get; set; }
        public string? ClaimCode { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PerBookDiscount { get; set; }
        public decimal Member5PercentDiscount { get; set; }
        public decimal Member10PercentDiscount { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Status { get; set; }
        public List<OrderItemConfirmationDto> OrderItems { get; set; } = new();
    }

    public class OrderItemConfirmationDto
    {
        public int BookId { get; set; }
        public string? BookTitle { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal Savings { get; set; }
    }
} 