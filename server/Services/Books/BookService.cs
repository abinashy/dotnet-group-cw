using BookNook.DTOs.Books;
using BookNook.Entities;
using BookNook.Repositories;

namespace BookNook.Services.Books
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;

        public BookService(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        public async Task<BookResponseDTO> CreateBookAsync(CreateBookDTO createBookDTO)
        {
            // Check if ISBN already exists
            if (await _bookRepository.IsbnExistsAsync(createBookDTO.ISBN))
            {
                throw new Exception("A book with this ISBN already exists");
            }

            // Create new book
            var book = new Book
            {
                Title = createBookDTO.Title,
                PublisherId = createBookDTO.PublisherId,
                Price = createBookDTO.Price,
                ISBN = createBookDTO.ISBN,
                PublicationYear = createBookDTO.PublicationYear,
                PageCount = createBookDTO.PageCount,
                Language = createBookDTO.Language,
                Format = createBookDTO.Format,
                Description = createBookDTO.Description,
                CoverImageUrl = createBookDTO.CoverImageUrl,
                IsAwardWinning = createBookDTO.IsAwardWinning,
                Status = createBookDTO.Status,
                CreatedAt = DateTime.UtcNow,
                BookAuthors = createBookDTO.AuthorIds.Select(authorId => new BookAuthor
                {
                    AuthorId = authorId
                }).ToList(),
                BookGenres = createBookDTO.GenreIds.Select(genreId => new BookGenre
                {
                    GenreId = genreId
                }).ToList()
            };

            var createdBook = await _bookRepository.CreateAsync(book);
            var bookWithRelations = await _bookRepository.GetByIdAsync(createdBook.BookId)
                ?? throw new Exception("Failed to create book");

            return MapToBookResponseDTO(bookWithRelations);
        }

        public async Task<BookResponseDTO?> GetBookByIdAsync(int bookId)
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            return book == null ? null : MapToBookResponseDTO(book);
        }

        public async Task<List<BookResponseDTO>> GetAllBooksAsync()
        {
            var books = await _bookRepository.GetAllAsync();
            return books.Select(MapToBookResponseDTO).ToList();
        }

        public async Task<bool> DeleteBookAsync(int bookId)
        {
            return await _bookRepository.DeleteAsync(bookId);
        }

        public async Task<BookResponseDTO> UpdateBookAsync(int bookId, UpdateBookDTO updateBookDTO)
        {
            var existingBook = await _bookRepository.GetByIdAsync(bookId, false)
                ?? throw new Exception("Book not found");

            // Check if ISBN is unique (excluding current book)
            if (await _bookRepository.IsbnExistsAsync(updateBookDTO.ISBN, bookId))
            {
                throw new Exception("A book with this ISBN already exists");
            }

            // Update book properties
            existingBook.Title = updateBookDTO.Title;
            existingBook.PublisherId = updateBookDTO.PublisherId;
            existingBook.Price = updateBookDTO.Price;
            existingBook.ISBN = updateBookDTO.ISBN;
            existingBook.PublicationYear = updateBookDTO.PublicationYear;
            existingBook.PageCount = updateBookDTO.PageCount;
            existingBook.Language = updateBookDTO.Language;
            existingBook.Format = updateBookDTO.Format;
            existingBook.Description = updateBookDTO.Description;
            existingBook.CoverImageUrl = updateBookDTO.CoverImageUrl;
            existingBook.IsAwardWinning = updateBookDTO.IsAwardWinning;
            existingBook.Status = updateBookDTO.Status;
            existingBook.UpdatedAt = DateTime.UtcNow;

            // Update relationships
            existingBook.BookAuthors = updateBookDTO.AuthorIds.Select(authorId => new BookAuthor
            {
                BookId = bookId,
                AuthorId = authorId
            }).ToList();

            existingBook.BookGenres = updateBookDTO.GenreIds.Select(genreId => new BookGenre
            {
                BookId = bookId,
                GenreId = genreId
            }).ToList();

            await _bookRepository.UpdateAsync(existingBook);
            
            var updatedBook = await _bookRepository.GetByIdAsync(bookId)
                ?? throw new Exception("Failed to update book");

            return MapToBookResponseDTO(updatedBook);
        }

        private static BookResponseDTO MapToBookResponseDTO(Book book)
        {
            return new BookResponseDTO
            {
                BookId = book.BookId,
                Title = book.Title,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name ?? string.Empty,
                Price = book.Price,
                ISBN = book.ISBN,
                PublicationYear = book.PublicationYear,
                PageCount = book.PageCount,
                Language = book.Language,
                Format = book.Format,
                Description = book.Description,
                CoverImageUrl = book.CoverImageUrl,
                IsAwardWinning = book.IsAwardWinning,
                Status = book.Status,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt,
                AuthorIds = book.BookAuthors.Select(ba => ba.AuthorId).ToList(),
                GenreIds = book.BookGenres.Select(bg => bg.GenreId).ToList()
            };
        }
    }
} 