using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Repositories.BooksCatalogue
{
    public interface IBooksCatalogueRepository
    {
        Task<IEnumerable<Book>> GetBooksAsync(
            string? search,
            List<string>? genres,
            List<string>? languages,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice);
        Task<bool> AddSampleDataAsync();
        Task<bool> CanConnectToDatabaseAsync();
        Task<bool> HasAnyBooksAsync();
    }
} 