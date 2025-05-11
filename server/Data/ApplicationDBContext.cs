using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BookNook.Entities;

namespace BookNook.Data;

public class ApplicationDbContext : IdentityDbContext<User, Role, long, IdentityUserClaim<long>, IdentityUserRole<long>, IdentityUserLogin<long>, IdentityRoleClaim<long>, IdentityUserToken<long>>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configure Book entity
        builder.Entity<Book>(entity =>
        {
            entity.Property(e => e.Status)
                .HasDefaultValue("Published")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.IsAwardWinning)
                .HasDefaultValue(false);
        });

        // Customize the ASP.NET Identity model and override the defaults if needed
        builder.Entity<User>(entity =>
        {
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
        });

        // Configure Order and OrderHistory to prevent cascade delete
        builder.Entity<Order>(entity =>
        {
            // Prevent cascade delete for OrderItems
            entity.HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prevent cascade delete for OrderHistory
            entity.HasOne(o => o.OrderHistory)
                .WithOne(oh => oh.Order)
                .HasForeignKey<OrderHistory>(oh => oh.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed Roles
        builder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", NormalizedName = "ADMIN" },
            new Role { Id = 2, Name = "Staff", NormalizedName = "STAFF" },
            new Role { Id = 3, Name = "Member", NormalizedName = "MEMBER" }
        );

        // Seed Users
        var admin = new User
        {
            Id = 1,
            UserName = "admin",
            NormalizedUserName = "ADMIN",
            Email = "admin@booknook.com",
            NormalizedEmail = "ADMIN@BOOKNOOK.COM",
            FirstName = "Admin",
            LastName = "User",
            EmailConfirmed = true,
            CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc),
            IsActive = true,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, "Admin@123");

        var staff1 = new User
        {
            Id = 2,
            UserName = "staff1",
            NormalizedUserName = "STAFF1",
            Email = "staff1@booknook.com",
            NormalizedEmail = "STAFF1@BOOKNOOK.COM",
            FirstName = "Staff",
            LastName = "One",
            EmailConfirmed = true,
            CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc),
            IsActive = true,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        staff1.PasswordHash = new PasswordHasher<User>().HashPassword(staff1, "Staff@123");

        var staff2 = new User
        {
            Id = 3,
            UserName = "staff2",
            NormalizedUserName = "STAFF2",
            Email = "staff2@booknook.com",
            NormalizedEmail = "STAFF2@BOOKNOOK.COM",
            FirstName = "Staff",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc),
            IsActive = true,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        staff2.PasswordHash = new PasswordHasher<User>().HashPassword(staff2, "Staff@123");

        builder.Entity<User>().HasData(admin, staff1, staff2);

        // Seed User Roles
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<long>>().HasData(
            new Microsoft.AspNetCore.Identity.IdentityUserRole<long> { UserId = 1, RoleId = 1 }, // Admin
            new Microsoft.AspNetCore.Identity.IdentityUserRole<long> { UserId = 2, RoleId = 2 }, // Staff
            new Microsoft.AspNetCore.Identity.IdentityUserRole<long> { UserId = 3, RoleId = 2 }  // Staff
        );

        // Seed Publishers
        builder.Entity<Publisher>().HasData(
            new Publisher { PublisherId = 1, Name = "BookNook Publishers" },
            new Publisher { PublisherId = 2, Name = "Open Books" }
        );

        // Seed Authors
        builder.Entity<Author>().HasData(
            new Author { AuthorId = 1, FirstName = "John", LastName = "Doe", Biography = "Seed author for testing." }
        );

        // Seed Genres
        builder.Entity<Genre>().HasData(
            new Genre { GenreId = 1, Name = "Fiction", Description = "Seed genre for testing." }
        );

        // Seed Books
        builder.Entity<Book>().HasData(
            new Book
            {
                BookId = 1,
                Title = "The BookNook Story",
                PublisherId = 1,
                Price = 19.99m,
                ISBN = "9780000000001",
                PublicationYear = 2023,
                PageCount = 250,
                Language = "English",
                Format = "Paperback",
                IsAwardWinning = false,
                Status = "Published",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc)
            },
            new Book
            {
                BookId = 2,
                Title = "Staff Picks Vol. 1",
                PublisherId = 2,
                Price = 14.99m,
                ISBN = "9780000000002",
                PublicationYear = 2022,
                PageCount = 180,
                Language = "English",
                Format = "Hardcover",
                IsAwardWinning = true,
                Status = "Published",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc)
            },
            new Book
            {
                BookId = 3,
                Title = "Learning ASP.NET Core",
                PublisherId = 1,
                Price = 29.99m,
                ISBN = "9780000000003",
                PublicationYear = 2024,
                PageCount = 320,
                Language = "English",
                Format = "eBook",
                IsAwardWinning = false,
                Status = "Upcoming",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 1, 1, 0, 0, 0), DateTimeKind.Utc)
            }
        );

        // Seed BookAuthor (BookId <-> AuthorId)
        builder.Entity<BookAuthor>().HasData(
            new BookAuthor { BookAuthorId = 1, BookId = 1, AuthorId = 1 },
            new BookAuthor { BookAuthorId = 2, BookId = 2, AuthorId = 1 },
            new BookAuthor { BookAuthorId = 3, BookId = 3, AuthorId = 1 }
        );

        // Seed BookGenre (BookId <-> GenreId)
        builder.Entity<BookGenre>().HasData(
            new BookGenre { BookGenreId = 1, BookId = 1, GenreId = 1 },
            new BookGenre { BookGenreId = 2, BookId = 2, GenreId = 1 },
            new BookGenre { BookGenreId = 3, BookId = 3, GenreId = 1 }
        );

        // Configure many-to-many relationships
        builder.Entity<BookAuthor>()
            .HasKey(ba => ba.BookAuthorId);

        builder.Entity<BookAuthor>()
            .HasOne(ba => ba.Book)
            .WithMany(b => b.BookAuthors)
            .HasForeignKey(ba => ba.BookId);

        builder.Entity<BookAuthor>()
            .HasOne(ba => ba.Author)
            .WithMany(a => a.BookAuthors)
            .HasForeignKey(ba => ba.AuthorId);

        builder.Entity<BookGenre>()
            .HasKey(bg => bg.BookGenreId);

        builder.Entity<BookGenre>()
            .HasOne(bg => bg.Book)
            .WithMany(b => b.BookGenres)
            .HasForeignKey(bg => bg.BookId);

        builder.Entity<BookGenre>()
            .HasOne(bg => bg.Genre)
            .WithMany(g => g.BookGenres)
            .HasForeignKey(bg => bg.GenreId);
    }

    public override DbSet<User> Users { get; set; } = null!;
    public override DbSet<Role> Roles { get; set; } = null!;
    public DbSet<Book> Books { get; set; } = null!;
    public DbSet<Author> Authors { get; set; } = null!;
    public DbSet<Genre> Genres { get; set; } = null!;
    public DbSet<Publisher> Publishers { get; set; } = null!;
    public DbSet<BookAuthor> BookAuthors { get; set; } = null!;
    public DbSet<BookGenre> BookGenres { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Inventory> Inventories { get; set; } = null!;
    public DbSet<Discount> Discounts { get; set; } = null!;
    public DbSet<BookDiscountHistory> BookDiscountHistories { get; set; } = null!;
    public DbSet<MemberDiscount> MemberDiscounts { get; set; } = null!;
    public DbSet<ShoppingCart> ShoppingCarts { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<OrderHistory> OrderHistories { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<Announcement> Announcements { get; set; } = null!;
    public DbSet<Bookmark> Bookmarks { get; set; } = null!;
}
