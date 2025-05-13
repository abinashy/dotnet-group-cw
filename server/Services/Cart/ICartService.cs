namespace BookNook.Services.Cart
{
    public interface ICartService
    {
        Task AddToCartAsync(long userId, int bookId, int quantity);
    }
} 