using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Repositories.BooksCatalogue
{
    public interface IBooksCatalogueRepository
    {
        Task<(IEnumerable<Book> Books, int TotalCount)> GetBooksAsync(
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
        Task<bool> AddSampleDataAsync();
        Task<bool> CanConnectToDatabaseAsync();
        Task<bool> HasAnyBooksAsync();
    }
} 