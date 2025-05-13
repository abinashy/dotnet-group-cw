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

        public async Task<ShoppingCart?> GetCartByUserIdAsync(long userId)
        {
            _logger.LogInformation("Getting cart for user {UserId}", userId);
            return await _context.ShoppingCarts
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<ShoppingCart> CreateCartAsync(long userId)
        {
            _logger.LogInformation("Creating new cart for user {UserId}", userId);
            var cart = new ShoppingCart
            {
                UserId = userId,
                AddedAt = DateTime.UtcNow
            };
            _context.ShoppingCarts.Add(cart);
            try 
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully created cart for user {UserId}", userId);
                return cart;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cart for user {UserId}. Error: {Error}", userId, ex.Message);
                throw;
            }
        }

        public async Task<ShoppingCart?> GetCartItemAsync(long userId, int bookId)
        {
            _logger.LogInformation("Getting cart item for user {UserId}, book {BookId}", userId, bookId);
            return await _context.ShoppingCarts
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.BookId == bookId);
        }

        public async Task<ShoppingCart> AddCartItemAsync(long userId, int bookId, int quantity)
        {
            _logger.LogInformation("Adding cart item: UserId={UserId}, BookId={BookId}, Quantity={Quantity}", userId, bookId, quantity);
            
            var cartItem = new ShoppingCart
            {
                UserId = userId,
                BookId = bookId,
                Quantity = quantity,
                AddedAt = DateTime.UtcNow
            };
            
            _context.ShoppingCarts.Add(cartItem);
            
            try
            {
                _logger.LogInformation("Saving cart item to database...");
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully added item to cart");
                return cartItem;
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error adding cart item. Error: {Error}, Inner: {InnerError}", 
                    dbEx.Message, dbEx.InnerException?.Message);
                
                // Log more information about the error
                _logger.LogError("User ID: {UserId}, Book ID: {BookId}, Quantity: {Quantity}", 
                    userId, bookId, quantity);
                
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding cart item. Error: {Error}", ex.Message);
                throw;
            }
        }

        public async Task UpdateCartItemQuantityAsync(ShoppingCart cartItem, int quantity)
        {
            _logger.LogInformation("Updating cart item quantity: CartId={CartId}, NewQuantity={Quantity}", cartItem.CartId, quantity);
            cartItem.Quantity = quantity;
            cartItem.AddedAt = DateTime.UtcNow;
            
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated cart item quantity");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item quantity. Error: {Error}", ex.Message);
                throw;
            }
        }

        public async Task<bool> BookExistsAsync(int bookId)
        {
            _logger.LogInformation("Checking if book {BookId} exists", bookId);
            var exists = await _context.Books.AnyAsync(b => b.BookId == bookId);
            _logger.LogInformation("Book {BookId} exists: {Exists}", bookId, exists);
            return exists;
        }
    }
} 