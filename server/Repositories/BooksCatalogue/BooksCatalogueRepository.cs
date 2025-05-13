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
            int pageSize = 8)
        {
            _logger.LogInformation("Starting GetBooksAsync with parameters: search={Search}, languages={Languages}, formats={Formats}, availability={Availability}, minRating={MinRating}, sort={Sort}", 
                                  search, languages, formats, availability, minRating, sort);
            
            var query = _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                .Include(b => b.Inventory)
                .Include(b => b.Discounts)
                .Include(b => b.Reviews)
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
                else if (tab == "release")
                {
                    // New releases are books published in the last 3 months
                    var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
                    query = query.Where(b => b.PublicationDate >= threeMonthsAgo);
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
                    (b.Description != null && b.Description.ToLower().Contains(lowerSearch)) ||
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
                query = query.Where(b => b.BookAuthors.Any(ba => 
                    lowerAuthors.Contains((ba.Author.FirstName.ToLower() + " " + ba.Author.LastName.ToLower()))));
            }

            if (languages != null && languages.Count > 0)
            {
                _logger.LogInformation("Filtering by languages: {Languages}", string.Join(", ", languages));
                var lowerLanguages = languages.Select(l => l.ToLower()).ToList();
                query = query.Where(b => b.Language != null && lowerLanguages.Contains(b.Language.ToLower()));
            }

            if (formats != null && formats.Count > 0)
            {
                _logger.LogInformation("Filtering by formats: {Formats}", string.Join(", ", formats));
                var lowerFormats = formats.Select(f => f.ToLower()).ToList();
                query = query.Where(b => b.Format != null && lowerFormats.Contains(b.Format.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(b => b.Price >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(b => b.Price <= maxPrice.Value);
            }

            if (publishers != null && publishers.Count > 0)
            {
                query = query.Where(b => publishers.Contains(b.PublisherId));
            }

            // Availability filter
            if (availability.HasValue)
            {
                _logger.LogInformation("Filtering by availability: {Availability}", availability.Value);
                if (availability.Value)
                {
                    // In stock (quantity > 0)
                    query = query.Where(b => b.Inventory != null && b.Inventory.Quantity > 0);
                }
                else
                {
                    // Out of stock (quantity = 0)
                    query = query.Where(b => b.Inventory == null || b.Inventory.Quantity == 0);
                }
            }
            
            // Minimum rating filter
            if (minRating.HasValue && minRating.Value > 0)
            {
                _logger.LogInformation("Filtering by minimum rating: {MinRating}", minRating.Value);
                // We need to filter after materializing the results because EF Core can't translate this well
                var booksWithoutPaging = await query.ToListAsync();
                
                booksWithoutPaging = booksWithoutPaging.Where(b => 
                    b.Reviews != null && 
                    b.Reviews.Any() && 
                    b.Reviews.Average(r => r.Rating) >= (double)minRating.Value).ToList();
                
                int totalFilteredCount = booksWithoutPaging.Count;
                
                // Apply sorting
                booksWithoutPaging = ApplySorting(booksWithoutPaging, sort, sortPrice);
                
                // Apply pagination manually
                var pagedBooks = booksWithoutPaging
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
                
                return (pagedBooks, totalFilteredCount);
            }

            // Apply sorting to query
            query = ApplySortingToQuery(query, sort, sortPrice);

            // Get total count before pagination
            int totalCount = await query.CountAsync();
            
            // Apply pagination
            query = query.Skip((page - 1) * pageSize).Take(pageSize);
            
            var books = await query.ToListAsync();
            return (books, totalCount);
        }

        private IQueryable<Book> ApplySortingToQuery(IQueryable<Book> query, string? sort, string? sortPrice)
        {
            _logger.LogInformation("Applying sort to query: sort={Sort}, sortPrice={SortPrice}", sort, sortPrice);
            if (!string.IsNullOrWhiteSpace(sort))
            {
                switch (sort.ToLower())
                {
                    case "title_asc":
                        _logger.LogInformation("Sorting by title ascending");
                        return query.OrderBy(b => b.Title);
                    case "title_desc":
                        _logger.LogInformation("Sorting by title descending");
                        return query.OrderByDescending(b => b.Title);
                    case "popularity":
                        _logger.LogInformation("Sorting by popularity (in-memory)");
                        // For popularity, we need special handling with manual sorting
                        return query.OrderBy(b => b.Title); // Temporary default order, will be replaced in PopularitySorting method
                    default:
                        _logger.LogInformation("Using default sort (title asc)");
                        return query.OrderBy(b => b.Title);
                }
            }
            else if (!string.IsNullOrWhiteSpace(sortPrice))
            {
                if (sortPrice.ToLower() == "asc")
                    return query.OrderBy(b => b.Price);
                else if (sortPrice.ToLower() == "desc")
                    return query.OrderByDescending(b => b.Price);
            }

            // Default sorting
            return query.OrderBy(b => b.Title);
        }

        private List<Book> ApplySorting(List<Book> books, string? sort, string? sortPrice)
        {
            _logger.LogInformation("Applying in-memory sort: sort={Sort}, sortPrice={SortPrice}", sort, sortPrice);
            if (!string.IsNullOrWhiteSpace(sort))
            {
                switch (sort.ToLower())
                {
                    case "title_asc":
                        _logger.LogInformation("In-memory sorting by title ascending");
                        return books.OrderBy(b => b.Title).ToList();
                    case "title_desc":
                        _logger.LogInformation("In-memory sorting by title descending");
                        return books.OrderByDescending(b => b.Title).ToList();
                    case "popularity":
                        _logger.LogInformation("In-memory sorting by popularity");
                        return PopularitySorting(books);
                    default:
                        _logger.LogInformation("In-memory using default sort (title asc)");
                        return books.OrderBy(b => b.Title).ToList();
                }
            }
            else if (!string.IsNullOrWhiteSpace(sortPrice))
            {
                if (sortPrice.ToLower() == "asc")
                    return books.OrderBy(b => b.Price).ToList();
                else if (sortPrice.ToLower() == "desc")
                    return books.OrderByDescending(b => b.Price).ToList();
            }

            // Default sorting
            return books.OrderBy(b => b.Title).ToList();
        }

        private List<Book> PopularitySorting(List<Book> books)
        {
            if (!books.Any()) return books;

            // Get all book IDs to query
            var bookIds = books.Select(b => b.BookId).ToList();

            // Get popularity data
            var bookPopularity = _context.OrderItems
                .Where(oi => bookIds.Contains(oi.BookId))
                .GroupBy(oi => oi.BookId)
                .Select(g => new { BookId = g.Key, TotalSold = g.Sum(oi => oi.Quantity) })
                .OrderByDescending(bp => bp.TotalSold)
                .ToList();

            // Create a dictionary for performance
            var popularityDict = bookPopularity.ToDictionary(bp => bp.BookId, bp => bp.TotalSold);

            // Sort the books by popularity
            return books
                .OrderByDescending(b => popularityDict.ContainsKey(b.BookId) ? popularityDict[b.BookId] : 0)
                .ToList();
        }

        public async Task<bool> AddSampleDataAsync()
        {
            try
            {
                var publisher = new Entities.Publisher
                {
                    Name = "Sample Publisher",
                    Description = "A sample publisher for testing",
                    Website = "https://samplepublisher.com"
                };
                _context.Publishers.Add(publisher);
                await _context.SaveChangesAsync();

                var author = new Entities.Author
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Biography = "A prolific writer"
                };
                _context.Authors.Add(author);
                await _context.SaveChangesAsync();

                var genre = new Entities.Genre
                {
                    Name = "Fiction",
                    Description = "Fictional works"
                };
                _context.Genres.Add(genre);
                await _context.SaveChangesAsync();

                var books = new List<Entities.Book>
                {
                    new Entities.Book
                    {
                        Title = "The Great Adventure",
                        ISBN = "978-1234567890",
                        Price = 19.99m,
                        PublicationDate = DateTime.UtcNow.AddDays(-30), // Published 1 month ago
                        PageCount = 300,
                        Language = "English",
                        Format = "Hardcover",
                        Description = "An exciting adventure story",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<Entities.BookAuthor>
                        {
                            new Entities.BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<Entities.BookGenre>
                        {
                            new Entities.BookGenre { GenreId = genre.GenreId }
                        }
                    },
                    new Entities.Book
                    {
                        Title = "Mystery Manor",
                        ISBN = "978-0987654321",
                        Price = 15.99m,
                        PublicationDate = DateTime.UtcNow.AddDays(-60), // Published 2 months ago
                        PageCount = 250,
                        Language = "English",
                        Format = "Paperback",
                        Description = "A thrilling mystery novel",
                        PublisherId = publisher.PublisherId,
                        BookAuthors = new List<Entities.BookAuthor>
                        {
                            new Entities.BookAuthor { AuthorId = author.AuthorId }
                        },
                        BookGenres = new List<Entities.BookGenre>
                        {
                            new Entities.BookGenre { GenreId = genre.GenreId }
                        }
                    }
                };

                _context.Books.AddRange(books);
                await _context.SaveChangesAsync();

                foreach (var book in books)
                {
                    _context.Inventories.Add(new Entities.Inventory
                    {
                        BookId = book.BookId,
                        Quantity = 10
                    });
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding sample data");
                return false;
            }
        }

        public async Task<bool> CanConnectToDatabaseAsync()
        {
            try
            {
                return await _context.Database.CanConnectAsync();
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> HasAnyBooksAsync()
        {
            return await _context.Books.AnyAsync();
        }
    }
} 