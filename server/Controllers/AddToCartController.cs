using Microsoft.AspNetCore.Mvc;
using BookNook.Entities;
using BookNook.DTOs.Cart;
using BookNook.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddToCartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AddToCartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                var allClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                var claimsString = string.Join(", ", allClaims);
                return Unauthorized($"User ID claim is missing. Claims: {claimsString}");
            }
            if (!long.TryParse(userIdClaim, out var userId))
            {
                var allClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                var claimsString = string.Join(", ", allClaims);
                return Unauthorized($"User ID claim is not a valid long. Value: {userIdClaim}. Claims: {claimsString}");
            }
            try
            {
                // Defensive check: ensure user exists
                var cartItem = _context.ShoppingCarts.FirstOrDefault(c => c.UserId == userId && c.BookId == dto.BookId);
                if (cartItem != null)
                {
                    cartItem.Quantity += dto.Quantity;
                    cartItem.AddedAt = DateTime.UtcNow;
                }
                else
                {
                    cartItem = new ShoppingCart
                    {
                        UserId = userId,
                        BookId = dto.BookId,
                        Quantity = dto.Quantity,
                        AddedAt = DateTime.UtcNow
                    };
                    _context.ShoppingCarts.Add(cartItem);
                }
                await _context.SaveChangesAsync();
                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 