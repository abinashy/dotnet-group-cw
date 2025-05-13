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

        public async Task<PagedBooksDto> GetBooksAsync(
            string? search,
            List<string>? genres,
            List<string>? authors,
            List<string>? languages,
            List<string>? formats,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice,
            string? sort,
            bool? availability,
            decimal? minRating,
            string? tab,
            List<int>? publishers = null,
            int page = 1,
            int pageSize = 8)
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

                var (books, totalCount) = await _repository.GetBooksAsync(search, genres, authors, languages, formats, minPrice, maxPrice, sortPrice, sort, availability, minRating, tab, publishers, page, pageSize);
                _logger.LogInformation("Found {Count} books matching the criteria", books.Count());

                return new PagedBooksDto {
                    Books = books.Select(b => {
                        // Find active discount (IsOnSale and IsActive and within date)
                        var discount = b.Discounts?.FirstOrDefault(d => d.IsOnSale && d.IsActive && d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow);
                        decimal? discountedPrice = null;
                        decimal? discountPercentage = null;
                        decimal? originalPrice = null;
                        bool isOnSale = false;
                        if (discount != null)
                        {
                            isOnSale = true;
                            discountPercentage = discount.DiscountPercentage;
                            originalPrice = b.Price;
                            discountedPrice = Math.Round(b.Price * (1 - (discount.DiscountPercentage / 100)), 2);
                        }
                        return new BookDto
                        {
                            BookId = b.BookId,
                            Title = b.Title,
                            ISBN = b.ISBN,
                            Price = b.Price,
                            PublicationDate = b.PublicationDate,
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
                            Status = b.Status,
                            IsOnSale = isOnSale,
                            DiscountedPrice = discountedPrice,
                            DiscountPercentage = discountPercentage,
                            OriginalPrice = originalPrice,
                            AverageRating = b.Reviews != null && b.Reviews.Any() ? (decimal?)b.Reviews.Average(r => r.Rating) : null,
                            ReviewCount = b.Reviews != null ? b.Reviews.Count : 0
                        };
                    }).ToList(),
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching books");
                throw;
            }
        }
    }
} 