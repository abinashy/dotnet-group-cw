using BookNook.Entities;

namespace BookNook.Repositories.Cart
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);
        Task<Cart> CreateCartAsync(int userId);
        Task<CartItem?> GetCartItemAsync(int cartId, int bookId);
        Task<CartItem> AddCartItemAsync(int cartId, int bookId, int quantity);
        Task UpdateCartItemQuantityAsync(CartItem cartItem, int quantity);
        Task<bool> BookExistsAsync(int bookId);
    }
} 