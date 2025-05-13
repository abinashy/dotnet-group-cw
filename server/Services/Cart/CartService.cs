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

        public async Task AddToCartAsync(long userId, int bookId, int quantity)
        {
            _logger.LogInformation("CartService.AddToCartAsync - Starting for user {UserId}, book {BookId}, quantity {Quantity}", userId, bookId, quantity);
            
            try
            {
                // Check if book exists
                _logger.LogInformation("Checking if book {BookId} exists", bookId);
                if (!await _cartRepository.BookExistsAsync(bookId))
                {
                    _logger.LogWarning("Book with ID {BookId} not found", bookId);
                    throw new Exception($"Book with ID {bookId} not found");
                }

                // Check if item already exists in cart
                _logger.LogInformation("Checking if item already exists in cart for user {UserId}, book {BookId}", userId, bookId);
                var cartItem = await _cartRepository.GetCartItemAsync(userId, bookId);
                if (cartItem != null)
                {
                    // Update quantity if item exists
                    _logger.LogInformation("Updating existing cart item for user {UserId}, book {BookId}, adding {Quantity}", userId, bookId, quantity);
                    await _cartRepository.UpdateCartItemQuantityAsync(cartItem, cartItem.Quantity + quantity);
                    _logger.LogInformation("Cart item quantity updated successfully");
                }
                else
                {
                    // Add new item to cart
                    _logger.LogInformation("Adding new cart item for user {UserId}, book {BookId}, quantity {Quantity}", userId, bookId, quantity);
                    await _cartRepository.AddCartItemAsync(userId, bookId, quantity);
                    _logger.LogInformation("New cart item added successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart for user {UserId}, book {BookId}. Error: {Error}, InnerError: {InnerError}", 
                    userId, bookId, ex.Message, ex.InnerException?.Message);
                throw;
            }
        }
    }
} 