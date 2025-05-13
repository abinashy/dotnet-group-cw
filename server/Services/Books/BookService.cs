using BookNook.DTOs.Books;
using BookNook.Entities;
using BookNook.Repositories;
using BookNook.Services.Inventory;

namespace BookNook.Services.Books
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IInventoryService _inventoryService;

        public BookService(IBookRepository bookRepository, IInventoryService inventoryService)
        {
            _bookRepository = bookRepository;
            _inventoryService = inventoryService;
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
                PublicationDate = createBookDTO.PublicationDate,
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

            // Create inventory entry for the new book
            await _inventoryService.CreateInventoryAsync(new DTOs.Inventory.CreateInventoryDTO
            {
                BookId = createdBook.BookId,
                Quantity = 0
            });

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
            existingBook.PublicationDate = updateBookDTO.PublicationDate;
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
            // Find active discount (IsOnSale and IsActive and within date)
            var discount = book.Discounts?.FirstOrDefault(d => d.IsOnSale && d.IsActive && d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow);
            decimal? discountedPrice = null;
            decimal? discountPercentage = null;
            decimal? originalPrice = null;
            bool isOnSale = false;
            if (discount != null)
            {
                isOnSale = true;
                discountPercentage = discount.DiscountPercentage;
                originalPrice = book.Price;
                discountedPrice = Math.Round(book.Price * (1 - (discount.DiscountPercentage / 100)), 2);
            }
            
            // Calculate average rating and review count
            decimal? averageRating = null;
            int reviewCount = 0;
            
            if (book.Reviews != null && book.Reviews.Any())
            {
                reviewCount = book.Reviews.Count;
                averageRating = (decimal)book.Reviews.Average(r => r.Rating);
            }
            
            // Ensure unique author and genre IDs by using distinct
            var uniqueAuthorIds = book.BookAuthors.Select(ba => ba.AuthorId).Distinct().ToList();
            var uniqueGenreIds = book.BookGenres.Select(bg => bg.GenreId).Distinct().ToList();
            
            // Create unique author and genre DTOs
            var authorsDict = new Dictionary<int, DTOs.Books.AuthorDTO>();
            foreach (var ba in book.BookAuthors)
            {
                if (!authorsDict.ContainsKey(ba.Author.AuthorId))
                {
                    authorsDict[ba.Author.AuthorId] = new DTOs.Books.AuthorDTO
                    {
                        AuthorId = ba.Author.AuthorId,
                        FirstName = ba.Author.FirstName,
                        LastName = ba.Author.LastName,
                        Biography = ba.Author.Biography
                    };
                }
            }
            
            var genresDict = new Dictionary<int, DTOs.Books.GenreDTO>();
            foreach (var bg in book.BookGenres)
            {
                if (!genresDict.ContainsKey(bg.Genre.GenreId))
                {
                    genresDict[bg.Genre.GenreId] = new DTOs.Books.GenreDTO
                    {
                        GenreId = bg.Genre.GenreId,
                        Name = bg.Genre.Name,
                        Description = bg.Genre.Description
                    };
                }
            }
            
            return new BookResponseDTO
            {
                BookId = book.BookId,
                Title = book.Title,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name ?? string.Empty,
                Price = book.Price,
                ISBN = book.ISBN,
                PublicationDate = book.PublicationDate,
                PageCount = book.PageCount,
                Language = book.Language,
                Format = book.Format,
                Description = book.Description,
                CoverImageUrl = book.CoverImageUrl,
                IsAwardWinning = book.IsAwardWinning,
                Status = book.Status,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt,
                AuthorIds = uniqueAuthorIds,
                GenreIds = uniqueGenreIds,
                Authors = authorsDict.Values.ToList(),
                Genres = genresDict.Values.ToList(),
                Availability = book.Inventory != null ? book.Inventory.Quantity : 0,
                IsOnSale = isOnSale,
                DiscountedPrice = discountedPrice,
                DiscountPercentage = discountPercentage,
                OriginalPrice = originalPrice,
                AverageRating = averageRating,
                ReviewCount = reviewCount
            };
        }
    }
} 