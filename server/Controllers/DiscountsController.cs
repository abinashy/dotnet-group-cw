using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;
using System.Text.Json;

namespace BookNook.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DiscountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DiscountsController> _logger;

        public DiscountsController(ApplicationDbContext context, ILogger<DiscountsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Discounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiscountDTO>>> GetDiscounts()
        {
            try
            {
                var discounts = await _context.Discounts
                    .Include(d => d.Book)
                    .Select(d => new DiscountDTO
                    {
                        DiscountId = d.DiscountId,
                        BookId = d.BookId,
                        DiscountPercentage = d.DiscountPercentage,
                        StartDate = d.StartDate,
                        EndDate = d.EndDate,
                        IsActive = d.IsActive,
                        IsOnSale = d.IsOnSale,
                        BookTitle = d.Book.Title
                    })
                    .ToListAsync();

                return discounts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discounts");
                return StatusCode(500, "An error occurred while retrieving discounts");
            }
        }

        // GET: api/Discounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DiscountDTO>> GetDiscount(int id)
        {
            try
            {
                var discount = await _context.Discounts
                    .Include(d => d.Book)
                    .Where(d => d.DiscountId == id)
                    .Select(d => new DiscountDTO
                    {
                        DiscountId = d.DiscountId,
                        BookId = d.BookId,
                        DiscountPercentage = d.DiscountPercentage,
                        StartDate = d.StartDate,
                        EndDate = d.EndDate,
                        IsActive = d.IsActive,
                        IsOnSale = d.IsOnSale,
                        BookTitle = d.Book.Title
                    })
                    .FirstOrDefaultAsync();

                if (discount == null)
                {
                    return NotFound();
                }

                return discount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discount {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the discount");
            }
        }

        // POST: api/Discounts
        [HttpPost]
        public async Task<ActionResult<DiscountDTO>> CreateDiscount(DiscountDTO discountDTO)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation("Creating discount: {DiscountDTO}", JsonSerializer.Serialize(discountDTO));

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state: {ModelState}", JsonSerializer.Serialize(ModelState));
                    return BadRequest(ModelState);
                }

                var book = await _context.Books.FindAsync(discountDTO.BookId);
                if (book == null)
                {
                    _logger.LogWarning("Book not found with ID: {BookId}", discountDTO.BookId);
                    return BadRequest("Book not found");
                }

                // Check if there's already an active discount for this book
                var existingDiscount = await _context.Discounts
                    .Where(d => d.BookId == discountDTO.BookId && d.IsActive)
                    .FirstOrDefaultAsync();

                if (existingDiscount != null)
                {
                    _logger.LogWarning("Active discount already exists for book {BookId}", discountDTO.BookId);
                    return BadRequest("An active discount already exists for this book");
                }

                // Get the user ID from claims
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out long createdBy))
                {
                    _logger.LogWarning("Could not determine the current user for discount creation.");
                    return Unauthorized("Could not determine the current user.");
                }

                // Check if the user exists in the database
                var userExists = await _context.Users.AnyAsync(u => u.Id == createdBy);
                if (!userExists)
                {
                    _logger.LogWarning("User with ID {CreatedBy} does not exist.", createdBy);
                    return Unauthorized("User does not exist.");
                }

                var discount = new Discount
                {
                    BookId = discountDTO.BookId,
                    DiscountPercentage = discountDTO.DiscountPercentage,
                    StartDate = discountDTO.StartDate.ToUniversalTime(),
                    EndDate = discountDTO.EndDate.ToUniversalTime(),
                    IsActive = true,
                    IsOnSale = discountDTO.IsOnSale
                };

                _context.Discounts.Add(discount);
                await _context.SaveChangesAsync();

                // Create discount history
                var discountHistory = new BookDiscountHistory
                {
                    BookId = discountDTO.BookId,
                    OriginalPrice = book.Price,
                    DiscountedPrice = book.Price * (1 - discountDTO.DiscountPercentage / 100),
                    DiscountPercentage = discountDTO.DiscountPercentage,
                    StartDate = discountDTO.StartDate.ToUniversalTime(),
                    EndDate = discountDTO.EndDate.ToUniversalTime(),
                    IsActive = true,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };

                _context.BookDiscountHistories.Add(discountHistory);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Successfully created discount with ID: {DiscountId}", discount.DiscountId);

                return CreatedAtAction(nameof(GetDiscount), new { id = discount.DiscountId }, discountDTO);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating discount: {DiscountDTO}", JsonSerializer.Serialize(discountDTO));
                return StatusCode(500, "An error occurred while creating the discount");
            }
        }

        // DELETE: api/Discounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiscount(int id)
        {
            try
            {
                var discount = await _context.Discounts.FindAsync(id);
                if (discount == null)
                {
                    _logger.LogWarning("Discount not found with ID: {Id}", id);
                    return NotFound();
                }

                _context.Discounts.Remove(discount);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully deleted discount with ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting discount {Id}", id);
                return StatusCode(500, "An error occurred while deleting the discount");
            }
        }

        private bool DiscountExists(int id)
        {
            return _context.Discounts.Any(e => e.DiscountId == id);
        }
    }
} 