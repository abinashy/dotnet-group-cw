namespace BookNook.DTOs.Cart
{
    public class AddToCartDto
    {
        public long UserId { get; set; }
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }
} 