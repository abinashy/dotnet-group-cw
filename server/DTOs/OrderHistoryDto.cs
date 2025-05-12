namespace BookNook.DTOs
{
    public class OrderHistoryDto
    {
        public long OrderId { get; set; }
        public string? ClaimCode { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Status { get; set; }
        public decimal FinalAmount { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
        public OrderHistoryDetailsDto? OrderHistory { get; set; }
    }

    public class OrderItemDto
    {
        public long OrderItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public BookDto? Book { get; set; }
    }

    public class BookDto
    {
        public long BookId { get; set; }
        public string? Title { get; set; }
        // Add other fields as needed
    }

    public class OrderHistoryDetailsDto
    {
        public string? Status { get; set; }
        public DateTime StatusDate { get; set; }
        public string? Notes { get; set; }
    }
} 