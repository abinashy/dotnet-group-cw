using Microsoft.AspNetCore.Mvc;
using BookNook.Entities;
using BookNook.DTOs.Cart;
using BookNook.Data;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var cartItem = new ShoppingCart
            {
                UserId = dto.UserId,
                BookId = dto.BookId,
                Quantity = dto.Quantity,
                AddedAt = DateTime.UtcNow
            };
            _context.ShoppingCarts.Add(cartItem);
            await _context.SaveChangesAsync();
            return Ok(cartItem);
        }
    }
} 