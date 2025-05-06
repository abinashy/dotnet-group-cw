using System;

namespace BookNook.DTOs
{
    public class OrderConfirmationDto
    {
        public int OrderId { get; set; }
        public string ClaimCode { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public List<OrderItemConfirmationDto> OrderItems { get; set; }
    }

    public class OrderItemConfirmationDto
    {
        public string BookTitle { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
} 