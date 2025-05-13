using BookNook.Data;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Repositories.BooksCatalogue
{
    public class BooksCatalogueRepository : IBooksCatalogueRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BooksCatalogueRepository> _logger;

        public BooksCatalogueRepository(ApplicationDbContext context, ILogger<BooksCatalogueRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(IEnumerable<Book> Books, int TotalCount)> GetBooksAsync(
            string? search,
            List<string>? genres,
            List<string>? authors,
            List<string>? languages,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortPrice,
            string? tab,
            int page = 1,
            int pageSize = 8)
        {
            var query = _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                .Include(b => b.Inventory)
                .Include(b => b.DiscountHistory)
                .Include(b => b.Discounts)
                .AsQueryable();

            if (!string.IsNullOrEmpty(tab))
            {
                if (tab == "all")
                {
                    query = query.Where(b => b.Status.ToLower() == "published");
                }
                else if (tab == "coming")
                {
                    query = query.Where(b => b.Status.ToLower() == "upcoming");
                }
                else if (tab == "award")
                {
                    query = query.Where(b => b.IsAwardWinning == true);
                }
                else if (tab == "new")
                {
                    var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
                    query = query.Where(b => b.CreatedAt >= oneMonthAgo);
                }
                else if (tab == "discount")
                {
                    query = query.Where(b => b.Discounts.Any(d => d.IsOnSale && d.IsActive && d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow));
                }
                else if (tab == "bestseller")
                {
                    // Get top 8 most ordered BookIds from OrderItems
                    var topBookIds = _context.OrderItems
                        .GroupBy(oi => oi.BookId)
                        .Select(g => new { BookId = g.Key, TotalOrdered = g.Sum(oi => oi.Quantity) })
                        .OrderByDescending(x => x.TotalOrdered)
                        .Take(8)
                        .Select(x => x.BookId)
                        .ToList();
                    query = query.Where(b => topBookIds.Contains(b.BookId));
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(lowerSearch) ||
                    b.ISBN.ToLower().Contains(lowerSearch) ||
                    b.BookAuthors.Any(ba =>
                        ba.Author.FirstName.ToLower().Contains(lowerSearch) ||
                        ba.Author.LastName.ToLower().Contains(lowerSearch))
                );
            }

            if (genres != null && genres.Count > 0)
            {
                var lowerGenres = genres.Select(g => g.ToLower()).ToList();
                query = query.Where(b => b.BookGenres.Any(bg => lowerGenres.Contains(bg.Genre.Name.ToLower())));
            }

            if (authors != null && authors.Count > 0)
            {
                var lowerAuthors = authors.Select(a => a.ToLower()).ToList();
                query = query.Where(b => b.BookAuthors.Any(ba => lowerAuthors.Contains((ba.Author.FirstName + " " + ba.Author.LastName).ToLower())));
            }

            if (languages != null && languages.Count > 0)
            {
                var lowerLanguages = languages.Select(l => l.ToLower()).ToList();
                query = query.Where(b => lowerLanguages.Contains(b.Language.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(b => b.Price >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(b => b.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(sortPrice))
            {
                if (sortPrice.ToLower() == "asc")
                    query = query.OrderBy(b => b.Price);
                else if (sortPrice.ToLower() == "desc")
                    query = query.OrderByDescending(b => b.Price);
            }
            else
            {
                query = query.OrderBy(b => b.Title);
            }

            int totalCount = await query.CountAsync();
            // Pagination
            query = query.Skip((page - 1) * pageSize).Take(pageSize);
            var books = await query.ToListAsync();
            return (books, totalCount);
        }

        public async Task<bool> AddSampleDataAsync()
        {
            try
            {
                var publisher = new Publisher
                {
                    Name = "Sample Publisher",
                    Description = "A sample publisher for testing",
                    Website = "https://samplepublisher.com"
                };
                _context.Publishers.Add(publisher);
                await _context.SaveChangesAsync();

                var author = new Author
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Biography = "A prolific writer"
                };
                _context.Authors.Add(author);
                await _context.SaveChangesAsync();

                var genre = new Genre
                {
                    Name = "Fiction",
                    Description = "Fictional works"
                };
                _context.Genres.Add(genre);
                await _context.SaveChangesAsync();

                var books = new List<Book>
                {
                    new Book
                    {
                        Title = "The Great Adventure",
                        ISBN = "978-1234567890",
                        Price = 19.99m,
                        PublicationYear = 2023,
                        PageCount = 300,
                        Language = "English",
                        Format = "Hardcover",
                        Description = "An exciting adventure story",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<BookAuthor>
                        {
                            new BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<BookGenre>
                        {
                            new BookGenre { GenreId = genre.GenreId }
                        }
                    },
                    new Book
                    {
                        Title = "Mystery Manor",
                        ISBN = "978-0987654321",
                        Price = 15.99m,
                        PublicationYear = 2023,
                        PageCount = 250,
                        Language = "English",
                        Format = "Paperback",
                        Description = "A thrilling mystery novel",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<BookAuthor>
                        {
                            new BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<BookGenre>
                        {
                            new BookGenre { GenreId = genre.GenreId }
                        }
                    }
                };

                _context.Books.AddRange(books);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding sample data");
                return false;
            }
        }

        public async Task<bool> CanConnectToDatabaseAsync()
        {
            return await _context.Database.CanConnectAsync();
        }

        public async Task<bool> HasAnyBooksAsync()
        {
            return await _context.Books.AnyAsync();
        }
    }
} 