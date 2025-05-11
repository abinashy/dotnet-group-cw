using BookNook.Entities;

namespace BookNook.Repositories.Cart
{
    public interface ICartRepository
    {
        Task<ShoppingCart?> GetCartByUserIdAsync(int userId);
        Task<ShoppingCart> CreateCartAsync(int userId);
        Task<ShoppingCart?> GetCartItemAsync(int userId, int bookId);
        Task<ShoppingCart> AddCartItemAsync(int userId, int bookId, int quantity);
        Task UpdateCartItemQuantityAsync(ShoppingCart cartItem, int quantity);
        Task<bool> BookExistsAsync(int bookId);
    }
} 