using BookNook.DTOs;

namespace BookNook.Services.BooksCatalogue
{
    public interface IBooksCatalogueService
    {
        Task<IEnumerable<BookDto>> GetBooksAsync(
            string? search,
            List<string>? genres,
            List<string>? languages,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice);
    }
} 