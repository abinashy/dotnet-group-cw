using BookNook.Repositories.Cart;

namespace BookNook.Services.Cart
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(ICartRepository cartRepository, ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _logger = logger;
        }

        public async Task AddToCartAsync(int userId, int bookId, int quantity)
        {
            try
            {
                // Check if book exists
                if (!await _cartRepository.BookExistsAsync(bookId))
                {
                    throw new Exception($"Book with ID {bookId} not found");
                }

                // Check if item already exists in cart
                var cartItem = await _cartRepository.GetCartItemAsync(userId, bookId);
                if (cartItem != null)
                {
                    // Update quantity if item exists
                    await _cartRepository.UpdateCartItemQuantityAsync(cartItem, cartItem.Quantity + quantity);
                }
                else
                {
                    // Add new item to cart
                    await _cartRepository.AddCartItemAsync(userId, bookId, quantity);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart for user {UserId}", userId);
                throw;
            }
        }
    }
} 