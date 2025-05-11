using BookNook.Data;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Repositories.Cart
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartRepository> _logger;

        public CartRepository(ApplicationDbContext context, ILogger<CartRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Cart?> GetCartByUserIdAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart> CreateCartAsync(int userId)
        {
            var cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task<CartItem?> GetCartItemAsync(int cartId, int bookId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.BookId == bookId);
        }

        public async Task<CartItem> AddCartItemAsync(int cartId, int bookId, int quantity)
        {
            var cartItem = new CartItem
            {
                CartId = cartId,
                BookId = bookId,
                Quantity = quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task UpdateCartItemQuantityAsync(CartItem cartItem, int quantity)
        {
            cartItem.Quantity = quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> BookExistsAsync(int bookId)
        {
            return await _context.Books.AnyAsync(b => b.BookId == bookId);
        }
    }
} 