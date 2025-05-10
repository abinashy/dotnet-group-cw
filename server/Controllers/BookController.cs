using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.Entities;
using BookNook.DTOs;
using System.Text.Json;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookController> _logger;

        public BookController(ApplicationDbContext context, ILogger<BookController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
            [FromQuery] string? search,
            [FromQuery] List<string>? genres,
            [FromQuery] List<string>? languages,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortPrice
        )
        {
            try
            {
                _logger.LogInformation("Received request to fetch books with parameters: " +
                    "search={Search}, genres={Genres}, languages={Languages}, minPrice={MinPrice}, maxPrice={MaxPrice}, sortPrice={SortPrice}",
                    search, genres, languages, minPrice, maxPrice, sortPrice);

                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("Cannot connect to the database");
                    return StatusCode(500, "Database connection error");
                }

                if (!await _context.Books.AnyAsync())
                {
                    _logger.LogInformation("No books found in database, adding sample data");
                    await AddSampleData();
                }

                var query = _context.Books
                    .Include(b => b.Publisher)
                    .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                    .AsQueryable();

                // Search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var lowerSearch = search.ToLower();
                    query = query.Where(b =>
                        b.Title.ToLower().Contains(lowerSearch) ||
                        b.ISBN.ToLower().Contains(lowerSearch) ||
                        b.BookAuthors.Any(ba =>
                            ba.Author.FirstName.ToLower().Contains(lowerSearch) ||
                            ba.Author.LastName.ToLower().Contains(lowerSearch))
                    );
                }

                // Genre filter (multi-select)
                if (genres != null && genres.Count > 0)
                {
                    var lowerGenres = genres.Select(g => g.ToLower()).ToList();
                    query = query.Where(b => b.BookGenres.Any(bg => lowerGenres.Contains(bg.Genre.Name.ToLower())));
                }

                // Language filter (multi-select)
                if (languages != null && languages.Count > 0)
                {
                    var lowerLanguages = languages.Select(l => l.ToLower()).ToList();
                    query = query.Where(b => lowerLanguages.Contains(b.Language.ToLower()));
                }

                // Price filter
                if (minPrice.HasValue)
                {
                    query = query.Where(b => b.Price >= minPrice.Value);
                }
                if (maxPrice.HasValue)
                {
                    query = query.Where(b => b.Price <= maxPrice.Value);
                }

                // Sort by price
                if (!string.IsNullOrWhiteSpace(sortPrice))
                {
                    if (sortPrice.ToLower() == "asc")
                        query = query.OrderBy(b => b.Price);
                    else if (sortPrice.ToLower() == "desc")
                        query = query.OrderByDescending(b => b.Price);
                }
                else
                {
                    query = query.OrderBy(b => b.Title); // Default sort
                }

                var books = await query.ToListAsync();
                _logger.LogInformation("Found {Count} books matching the criteria", books.Count);

                var bookDtos = books.Select(b => new BookDto
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    Price = b.Price,
                    PublicationYear = b.PublicationYear,
                    PageCount = b.PageCount,
                    Language = b.Language,
                    Format = b.Format,
                    Description = b.Description,
                    CoverImageUrl = b.CoverImageUrl,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher?.Name ?? string.Empty,
                    Authors = b.BookAuthors.Select(ba => new AuthorDto
                    {
                        AuthorId = ba.Author.AuthorId,
                        FirstName = ba.Author.FirstName,
                        LastName = ba.Author.LastName,
                        Biography = ba.Author.Biography
                    }).ToList(),
                    Genres = b.BookGenres.Select(bg => new GenreDto
                    {
                        GenreId = bg.Genre.GenreId,
                        Name = bg.Genre.Name,
                        Description = bg.Genre.Description
                    }).ToList()
                }).ToList();

                return Ok(bookDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching books");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        private async Task AddSampleData()
        {
            try
            {
                // Add a publisher
                var publisher = new Publisher
                {
                    Name = "Sample Publisher",
                    Description = "A sample publisher for testing",
                    Website = "https://samplepublisher.com"
                };
                _context.Publishers.Add(publisher);
                await _context.SaveChangesAsync();

                // Add an author
                var author = new Author
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Biography = "A prolific writer"
                };
                _context.Authors.Add(author);
                await _context.SaveChangesAsync();

                // Add a genre
                var genre = new Genre
                {
                    Name = "Fiction",
                    Description = "Fictional works"
                };
                _context.Genres.Add(genre);
                await _context.SaveChangesAsync();

                // Add sample books
                var books = new List<Book>
                {
                    new Book
                    {
                        Title = "The Great Adventure",
                        ISBN = "978-1234567890",
                        Price = 19.99m,
                        PublicationYear = 2023,
                        PageCount = 300,
                        Language = "English",
                        Format = "Hardcover",
                        Description = "An exciting adventure story",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<BookAuthor>
                        {
                            new BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<BookGenre>
                        {
                            new BookGenre { GenreId = genre.GenreId }
                        }
                    },
                    new Book
                    {
                        Title = "Mystery Manor",
                        ISBN = "978-0987654321",
                        Price = 15.99m,
                        PublicationYear = 2023,
                        PageCount = 250,
                        Language = "English",
                        Format = "Paperback",
                        Description = "A thrilling mystery novel",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<BookAuthor>
                        {
                            new BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<BookGenre>
                        {
                            new BookGenre { GenreId = genre.GenreId }
                        }
                    }
                };

                _context.Books.AddRange(books);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully added sample data");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding sample data");
                throw;
            }
        }
    }
}

