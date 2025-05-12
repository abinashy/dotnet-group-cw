using BookNook.DTOs.BooksCatalogue;
using BookNook.Repositories.BooksCatalogue;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Services.BooksCatalogue
{
    public class BooksCatalogueService : IBooksCatalogueService
    {
        private readonly IBooksCatalogueRepository _repository;
        private readonly ILogger<BooksCatalogueService> _logger;

        public BooksCatalogueService(IBooksCatalogueRepository repository, ILogger<BooksCatalogueService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<BookDto>> GetBooksAsync(
            string? search,
            List<string>? genres,
            List<string>? authors,
            List<string>? languages,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice,
            string? tab)
        {
            try
            {
                if (!await _repository.CanConnectToDatabaseAsync())
                {
                    _logger.LogError("Cannot connect to the database");
                    throw new Exception("Database connection error");
                }

                if (!await _repository.HasAnyBooksAsync())
                {
                    _logger.LogInformation("No books found in database, adding sample data");
                    await _repository.AddSampleDataAsync();
                }

                var books = await _repository.GetBooksAsync(search, genres, authors, languages, minPrice, maxPrice, sortPrice, tab);
                _logger.LogInformation("Found {Count} books matching the criteria", books.Count());

                return books.Select(b => new BookDto
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
                    }).ToList(),
                    Availability = b.Inventory != null ? b.Inventory.Quantity : 0,
                    Status = b.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching books");
                throw;
            }
        }
    }
} 