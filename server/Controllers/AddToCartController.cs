using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services.Cart;
using BookNook.DTOs.Cart;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using BookNook.Entities;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddToCartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<AddToCartController> _logger;
        private readonly UserManager<User> _userManager;

        public AddToCartController(ICartService cartService, ILogger<AddToCartController> logger, UserManager<User> userManager)
        {
            _cartService = cartService;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto request)
        {
            try
            {
                _logger.LogInformation("AddToCart request received for BookId: {BookId}, Quantity: {Quantity}", request.BookId, request.Quantity);
                
                // Get the current user from UserManager rather than parsing the claim
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    _logger.LogWarning("User not found from claims");
                    return Unauthorized("User not found");
                }

                _logger.LogInformation("Found user with ID: {UserId}", user.Id);

                try 
                {
                    await _cartService.AddToCartAsync(user.Id, request.BookId, request.Quantity);
                    _logger.LogInformation("Item successfully added to cart for user {UserId}", user.Id);
                    return Ok(new { message = "Item added to cart successfully" });
                }
                catch (Exception serviceEx)
                {
                    _logger.LogError(serviceEx, "Error in cart service for user {UserId}", user.Id);
                    return StatusCode(500, new { message = "Service error", details = serviceEx.Message, innerMessage = serviceEx.InnerException?.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error adding item to cart");
                return StatusCode(500, new { message = "An unexpected error occurred", details = ex.Message });
            }
        }
    }
} 