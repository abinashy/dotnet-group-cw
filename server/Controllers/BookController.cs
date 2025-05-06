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
            [FromQuery] string? genre,
            [FromQuery] string? format,
            [FromQuery] string? language,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortBy)
        {
            try
            {
                _logger.LogInformation("Received request to fetch books with parameters: " +
                    "search={Search}, genre={Genre}, format={Format}, language={Language}, " +
                    "minPrice={MinPrice}, maxPrice={MaxPrice}, sortBy={SortBy}",
                    search, genre, format, language, minPrice, maxPrice, sortBy);

                // Check if we can connect to the database
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("Cannot connect to the database");
                    return StatusCode(500, "Database connection error");
                }

                // Check if we have any books
                if (!await _context.Books.AnyAsync())
                {
                    _logger.LogInformation("No books found in database, adding sample data");
                    await AddSampleData();
                }

                var query = _context.Books
                    .Include(b => b.Publisher)
                    .Include(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.ToLower();
                    query = query.Where(b =>
                        b.Title.ToLower().Contains(search) ||
                        b.ISBN.ToLower().Contains(search) ||
                        b.BookAuthors.Any(ba => 
                            ba.Author.FirstName.ToLower().Contains(search) ||
                            ba.Author.LastName.ToLower().Contains(search)));
                }

                if (!string.IsNullOrWhiteSpace(genre))
                {
                    query = query.Where(b => b.BookGenres.Any(bg => bg.Genre.Name == genre));
                }

                if (!string.IsNullOrWhiteSpace(format))
                {
                    query = query.Where(b => b.Format == format);
                }

                if (!string.IsNullOrWhiteSpace(language))
                {
                    query = query.Where(b => b.Language == language);
                }

                if (minPrice.HasValue)
                {
                    query = query.Where(b => b.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    query = query.Where(b => b.Price <= maxPrice.Value);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "title" => query.OrderBy(b => b.Title),
                    "price" => query.OrderBy(b => b.Price),
                    "year" => query.OrderByDescending(b => b.PublicationYear),
                    _ => query.OrderBy(b => b.Title)
                };

                var books = await query.ToListAsync();
                _logger.LogInformation("Found {Count} books matching the criteria", books.Count);

                // Map to DTOs
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

