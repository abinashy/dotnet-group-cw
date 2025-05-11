using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using System.Linq;
using System.Threading.Tasks;

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
            var cartItems = await _context.ShoppingCarts
                .Where(c => c.UserId == userId)
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
                    Availability = c.Book.Inventory != null ? c.Book.Inventory.Quantity : 0
                })
                .ToListAsync();
            return Ok(cartItems);
        }

        [HttpGet("checkout")]
        public async Task<IActionResult> GetCheckoutCart([FromQuery] string userId)
        {
            var checkoutItems = await _context.ShoppingCarts
                .Where(c => c.UserId == userId)
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
                    PublicationYear = c.Book.PublicationYear,
                    PageCount = c.Book.PageCount,
                    Language = c.Book.Language,
                    Description = c.Book.Description
                })
                .ToListAsync();
            return Ok(checkoutItems);
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart([FromQuery] string userId)
        {
            var cartItems = _context.ShoppingCarts.Where(c => c.UserId == userId);
            _context.ShoppingCarts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart cleared successfully" });
        }
    }
} 