using BookNook.Entities;

namespace BookNook.Repositories
{
    public interface IBookRepository
    {
        Task<Book> CreateAsync(Book book);
        Task<Book?> GetByIdAsync(int id, bool includeRelated = true);
        Task<List<Book>> GetAllAsync(bool includeRelated = true);
        Task<bool> DeleteAsync(int id);
        Task<Book> UpdateAsync(Book book);
        Task<bool> ExistsAsync(int id);
        Task<bool> IsbnExistsAsync(string isbn, int? excludeBookId = null);
    }
} 