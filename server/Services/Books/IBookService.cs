using BookNook.DTOs.Books;

namespace BookNook.Services.Books
{
    public interface IBookService
    {
        Task<BookResponseDTO> CreateBookAsync(CreateBookDTO createBookDTO);
        Task<BookResponseDTO?> GetBookByIdAsync(int bookId);
        Task<List<BookResponseDTO>> GetAllBooksAsync();
        Task<bool> DeleteBookAsync(int bookId);
        Task<BookResponseDTO> UpdateBookAsync(int bookId, UpdateBookDTO updateBookDTO);
    }
} 