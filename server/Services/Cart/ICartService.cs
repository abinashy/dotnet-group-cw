namespace BookNook.Services.Cart
{
    public interface ICartService
    {
        Task AddToCartAsync(int userId, int bookId, int quantity);
    }
} 