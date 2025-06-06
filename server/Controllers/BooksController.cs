using Microsoft.AspNetCore.Mvc;
using BookNook.DTOs.Books;
using BookNook.Services.Books;
using BookNook.Data;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BookNook.Repositories.Books;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ApplicationDbContext _context;
        private readonly IBookRepository _repository;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ApplicationDbContext context, IBookRepository repository, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _context = context;
            _repository = repository;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<BookResponseDTO>> CreateBook([FromBody] CreateBookDTO createBookDTO)
        {
            // Log the incoming DTO
            Console.WriteLine("[BooksController] Incoming CreateBookDTO: " + System.Text.Json.JsonSerializer.Serialize(createBookDTO));
            try
            {
                var book = await _bookService.CreateBookAsync(createBookDTO);
                return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookResponseDTO>> GetBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
                return NotFound();

            return Ok(book);
        }

        [HttpGet("{id}/reviews")]
        public async Task<ActionResult> GetBookReviews(int id)
        {
            var reviews = await _context.Reviews
                .Where(r => r.BookId == id)
                .Join(
                    _context.Users,
                    review => review.UserId,
                    user => user.Id,
                    (review, user) => new
                    {
                        review.ReviewId,
                        review.Rating,
                        review.Comment,
                        review.ReviewDate,
                        UserId = review.UserId,
                        UserName = $"{user.FirstName} {user.LastName}"
                    })
                .ToListAsync();

            if (!reviews.Any())
                return NotFound(new { message = "No reviews found for this book" });

            return Ok(reviews);
        }

        [HttpGet]
        public async Task<ActionResult<List<BookResponseDTO>>> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BookResponseDTO>> UpdateBook(int id, [FromBody] UpdateBookDTO updateBookDTO)
        {
            try
            {
                var book = await _bookService.UpdateBookAsync(id, updateBookDTO);
                return Ok(book);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBook(int id)
        {
            var result = await _bookService.DeleteBookAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("formats")]
        public async Task<ActionResult<IEnumerable<string>>> GetFormats()
        {
            try
            {
                var formats = await _context.Books
                    .Select(b => b.Format)
                    .Distinct()
                    .Where(f => !string.IsNullOrWhiteSpace(f))
                    .OrderBy(f => f)
                    .ToListAsync();

                return Ok(formats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving formats");
                return StatusCode(500, "An error occurred while retrieving book formats");
            }
        }

        [HttpGet("languages")]
        public async Task<ActionResult<IEnumerable<string>>> GetLanguages()
        {
            try
            {
                var languages = await _context.Books
                    .Select(b => b.Language)
                    .Distinct()
                    .Where(l => !string.IsNullOrWhiteSpace(l))
                    .OrderBy(l => l)
                    .ToListAsync();

                return Ok(languages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving languages");
                return StatusCode(500, "An error occurred while retrieving book languages");
            }
        }
    }
} 