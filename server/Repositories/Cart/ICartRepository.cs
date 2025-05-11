using BookNook.Entities;

namespace BookNook.Repositories.Cart
{
    public interface ICartRepository
    {
        Task<ShoppingCart?> GetCartByUserIdAsync(long userId);
        Task<ShoppingCart> CreateCartAsync(long userId);
        Task<ShoppingCart?> GetCartItemAsync(long userId, int bookId);
        Task<ShoppingCart> AddCartItemAsync(long userId, int bookId, int quantity);
        Task UpdateCartItemQuantityAsync(ShoppingCart cartItem, int quantity);
        Task<bool> BookExistsAsync(int bookId);
    }
} 