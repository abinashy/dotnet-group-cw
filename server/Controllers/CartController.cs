using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using BookNook.DTOs.Cart;
using BookNook.DTOs.Order;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart([FromQuery] string userId)
        {
            if (!long.TryParse(userId, out var userIdLong))
            {
                return BadRequest("Invalid userId");
            }
            var now = DateTime.UtcNow;
            var cartItems = await _context.ShoppingCarts
                .Where(c => c.UserId == userIdLong)
                .Include(c => c.Book)
                    .ThenInclude(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(c => c.Book)
                    .ThenInclude(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                .Include(c => c.Book)
                    .ThenInclude(b => b.Inventory)
                .Select(c => new CartItemDto
                {
                    CartId = c.CartId,
                    BookId = c.BookId,
                    Title = c.Book.Title,
                    CoverImageUrl = c.Book.CoverImageUrl,
                    Price = c.Book.Price,
                    Quantity = c.Quantity,
                    AddedAt = c.AddedAt,
                    AuthorName = c.Book.BookAuthors.Select(ba => ba.Author.FirstName + " " + ba.Author.LastName).FirstOrDefault() ?? string.Empty,
                    Genres = c.Book.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    Format = c.Book.Format,
                    Availability = c.Book.Inventory != null ? c.Book.Inventory.Quantity : 0,
                    DiscountPercentage = _context.Discounts
                        .Where(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                        .Select(d => (decimal?)d.DiscountPercentage)
                        .FirstOrDefault(),
                    DiscountedPrice = _context.Discounts
                        .Where(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                        .Select(d => (decimal?)(c.Book.Price * (1 - d.DiscountPercentage / 100)))
                        .FirstOrDefault(),
                    IsDiscountActive = _context.Discounts
                        .Any(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                })
                .ToListAsync();
            return Ok(cartItems);
        }

        [HttpGet("checkout")]
        public async Task<IActionResult> GetCheckoutCart([FromQuery] string userId)
        {
            if (!long.TryParse(userId, out var userIdLong))
            {
                return BadRequest("Invalid userId");
            }
            var now = DateTime.UtcNow;
            var checkoutItems = await _context.ShoppingCarts
                .Where(c => c.UserId == userIdLong)
                .Include(c => c.Book)
                    .ThenInclude(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(c => c.Book)
                    .ThenInclude(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                .Include(c => c.Book)
                    .ThenInclude(b => b.Inventory)
                .Include(c => c.Book)
                    .ThenInclude(b => b.Publisher)
                .Select(c => new CheckoutItemDto
                {
                    CartId = c.CartId,
                    BookId = c.BookId,
                    Title = c.Book.Title,
                    CoverImageUrl = c.Book.CoverImageUrl,
                    Price = c.Book.Price,
                    Quantity = c.Quantity,
                    AddedAt = c.AddedAt,
                    AuthorNames = c.Book.BookAuthors.Select(ba => ba.Author.FirstName + " " + ba.Author.LastName).ToList(),
                    Genres = c.Book.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    Format = c.Book.Format,
                    Availability = c.Book.Inventory != null ? c.Book.Inventory.Quantity : 0,
                    Publisher = c.Book.Publisher != null ? c.Book.Publisher.Name : string.Empty,
                    ISBN = c.Book.ISBN,
                    PublicationDate = c.Book.PublicationDate,
                    PageCount = c.Book.PageCount,
                    Language = c.Book.Language,
                    Description = c.Book.Description,
                    DiscountPercentage = _context.Discounts
                        .Where(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                        .Select(d => (decimal?)d.DiscountPercentage)
                        .FirstOrDefault(),
                    DiscountedPrice = _context.Discounts
                        .Where(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                        .Select(d => (decimal?)(c.Book.Price * (1 - d.DiscountPercentage / 100)))
                        .FirstOrDefault(),
                    IsDiscountActive = _context.Discounts
                        .Any(d => d.BookId == c.BookId && d.IsActive && d.StartDate <= now && d.EndDate >= now)
                })
                .ToListAsync();

            // Calculate subtotal and member discounts
            decimal subtotal = checkoutItems.Sum(i => (i.DiscountedPrice ?? i.Price) * i.Quantity);
            int totalQuantity = checkoutItems.Sum(i => i.Quantity);
            decimal member5PercentDiscountAmount = 0;
            decimal member10PercentDiscountAmount = 0;

            // Calculate original price total (before any per-book discounts)
            decimal originalPriceTotal = checkoutItems.Sum(i => i.Price * i.Quantity);

            // 5% discount for 5+ books - apply to original price total
            if (totalQuantity >= 5)
            {
                member5PercentDiscountAmount = originalPriceTotal * 0.05m;
            }

            // 10% stackable member discount - apply to original price total
            var memberDiscount = await _context.MemberDiscounts
                .Where(md => md.UserId == userIdLong && !md.IsUsed && md.ExpiryDate > DateTime.UtcNow && md.DiscountPercentage == 10)
                .OrderBy(md => md.ExpiryDate)
                .FirstOrDefaultAsync();
            if (memberDiscount != null)
            {
                member10PercentDiscountAmount = originalPriceTotal * 0.10m;
            }

            decimal memberDiscountAmount = member5PercentDiscountAmount + member10PercentDiscountAmount;
            decimal finalTotal = subtotal - memberDiscountAmount;

            return Ok(new {
                items = checkoutItems,
                subtotal,
                member5PercentDiscountAmount,
                member10PercentDiscountAmount,
                memberDiscountAmount,
                finalTotal,
                totalQuantity
            });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart([FromQuery] string userId)
        {
            if (!long.TryParse(userId, out var userIdLong))
            {
                return BadRequest("Invalid userId");
            }
            var cartItems = _context.ShoppingCarts.Where(c => c.UserId == userIdLong);
            _context.ShoppingCarts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart cleared successfully" });
        }

        [HttpPatch("item/{cartId}/quantity")]
        public async Task<IActionResult> UpdateCartItemQuantity(int cartId, [FromBody] int quantity)
        {
            var cartItem = await _context.ShoppingCarts.FindAsync(cartId);
            if (cartItem == null)
                return NotFound();
            if (quantity < 1)
                return BadRequest("Quantity must be at least 1");
            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart item quantity updated" });
        }

        [HttpDelete("item/{cartId}")]
        public async Task<IActionResult> RemoveCartItem(int cartId)
        {
            var cartItem = await _context.ShoppingCarts.FindAsync(cartId);
            if (cartItem == null)
                return NotFound();
            _context.ShoppingCarts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart item removed" });
        }
    }
} 