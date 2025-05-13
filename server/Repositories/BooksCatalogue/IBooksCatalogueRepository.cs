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
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice,
            string? tab,
            int page = 1,
            int pageSize = 8);
        Task<bool> AddSampleDataAsync();
        Task<bool> CanConnectToDatabaseAsync();
        Task<bool> HasAnyBooksAsync();
    }
} 