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
        public async Task<ActionResult<PagedBooksDto>> GetBooks(
            [FromQuery] string? search,
            [FromQuery] List<string>? genres,
            [FromQuery] List<string>? authors,
            [FromQuery] List<string>? languages,
            [FromQuery] List<string>? formats,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortPrice,
            [FromQuery] string? sort,
            [FromQuery] bool? availability,
            [FromQuery] decimal? minRating,
            [FromQuery] string? tab,
            [FromQuery] List<int>? publishers,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8)
        {
            try
            {
                _logger.LogInformation("Received request to fetch books with parameters: " +
                    "search={Search}, genres={Genres}, authors={Authors}, languages={Languages}, formats={Formats}, " +
                    "minPrice={MinPrice}, maxPrice={MaxPrice}, sortPrice={SortPrice}, sort={Sort}, " +
                    "availability={Availability}, minRating={MinRating}, tab={Tab}, publishers={Publishers}, page={Page}, pageSize={PageSize}",
                    search, genres, authors, languages, formats, minPrice, maxPrice, sortPrice, sort, availability, minRating, tab, publishers, page, pageSize);

                var pagedResult = await _service.GetBooksAsync(search, genres, authors, languages, formats, minPrice, maxPrice, sortPrice, sort, availability, minRating, tab, publishers, page, pageSize);
                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching books");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
    }
} 