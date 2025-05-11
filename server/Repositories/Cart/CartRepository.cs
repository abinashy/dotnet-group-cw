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

        public async Task<ShoppingCart?> GetCartByUserIdAsync(int userId)
        {
            return await _context.ShoppingCarts
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<ShoppingCart> CreateCartAsync(int userId)
        {
            var cart = new ShoppingCart
            {
                UserId = userId,
                AddedAt = DateTime.UtcNow
            };
            _context.ShoppingCarts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task<ShoppingCart?> GetCartItemAsync(int userId, int bookId)
        {
            return await _context.ShoppingCarts
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.BookId == bookId);
        }

        public async Task<ShoppingCart> AddCartItemAsync(int userId, int bookId, int quantity)
        {
            var cartItem = new ShoppingCart
            {
                UserId = userId,
                BookId = bookId,
                Quantity = quantity,
                AddedAt = DateTime.UtcNow
            };
            _context.ShoppingCarts.Add(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task UpdateCartItemQuantityAsync(ShoppingCart cartItem, int quantity)
        {
            cartItem.Quantity = quantity;
            cartItem.AddedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> BookExistsAsync(int bookId)
        {
            return await _context.Books.AnyAsync(b => b.BookId == bookId);
        }
    }
} 