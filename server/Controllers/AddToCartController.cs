using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services.Cart;
using BookNook.DTOs;
using System.Security.Claims;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddToCartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<AddToCartController> _logger;

        public AddToCartController(ICartService cartService, ILogger<AddToCartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest("Invalid user ID format");
                }

                await _cartService.AddToCartAsync(userId, request.BookId, request.Quantity);
                return Ok(new { message = "Item added to cart successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, "An error occurred while adding the item to cart");
            }
        }
    }
} 