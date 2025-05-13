using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Data;
using BookNook.Entities;
using System.Security.Claims;
using BookNook.DTOs.Review;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("batch")]
        public async Task<IActionResult> SubmitBatchReviews([FromBody] ReviewBatchDto dto)
        {
            Console.WriteLine("=== SubmitBatchReviews endpoint HIT ===");
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out var userId))
            {
                Console.WriteLine("[ReviewController] User ID not found in token or not a valid long");
                return Unauthorized(new { message = "User ID not found in token" });
            }

            Console.WriteLine($"[ReviewController] Received batch review for order {dto.OrderId} by user {userId} with {dto.Reviews?.Count ?? 0} reviews");
            if (dto.Reviews != null)
            {
                foreach (var review in dto.Reviews)
                {
                    Console.WriteLine($"[ReviewController] Processing review: BookId={review.BookId}, OrderId={review.OrderId}, Rating={review.Rating}, Review='{review.Review}'");
                    // Prevent duplicate reviews for the same book/order/user
                    var exists = _context.Reviews.Any(r => r.UserId == userId && r.BookId == review.BookId && r.OrderId == review.OrderId);
                    if (exists)
                    {
                        Console.WriteLine($"[ReviewController] Duplicate review found for BookId={review.BookId}, OrderId={review.OrderId}, skipping.");
                        continue;
                    }

                    var entity = new Review
                    {
                        UserId = userId,
                        BookId = review.BookId,
                        OrderId = review.OrderId,
                        Rating = review.Rating,
                        Comment = review.Review,
                        ReviewDate = DateTime.UtcNow
                    };
                    _context.Reviews.Add(entity);
                }
            }
            await _context.SaveChangesAsync();
            Console.WriteLine("[ReviewController] All reviews saved to database.");
            return Ok(new { message = "Reviews submitted successfully" });
        }

        [HttpGet("user")]
        public IActionResult GetUserReviews()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }
            var reviews = _context.Reviews
                .Where(r => r.UserId == userId)
                .Select(r => new { r.BookId, r.OrderId, r.Rating, r.Comment, r.ReviewDate })
                .ToList();
            return Ok(reviews);
        }
    }
} 