using BookNook.DTOs.BooksCatalogue;

namespace BookNook.Services.BooksCatalogue
{
    public interface IBooksCatalogueService
    {
        Task<PagedBooksDto> GetBooksAsync(
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
            int pageSize = 8);
    }
} 