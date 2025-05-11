using Microsoft.AspNetCore.Mvc;
using BookNook.Services.BooksCatalogue;
using BookNook.DTOs.BooksCatalogue;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksCatalogueController : ControllerBase
    {
        private readonly IBooksCatalogueService _service;
        private readonly ILogger<BooksCatalogueController> _logger;

        public BooksCatalogueController(IBooksCatalogueService service, ILogger<BooksCatalogueController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
            [FromQuery] string? search,
            [FromQuery] List<string>? genres,
            [FromQuery] List<string>? languages,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortPrice)
        {
            try
            {
                _logger.LogInformation("Received request to fetch books with parameters: " +
                    "search={Search}, genres={Genres}, languages={Languages}, minPrice={MinPrice}, maxPrice={MaxPrice}, sortPrice={SortPrice}",
                    search, genres, languages, minPrice, maxPrice, sortPrice);

                var books = await _service.GetBooksAsync(search, genres, languages, minPrice, maxPrice, sortPrice);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching books");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
    }
} 