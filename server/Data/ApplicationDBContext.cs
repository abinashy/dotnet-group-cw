using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BookNook.Entities;

namespace BookNook.Data;

public class ApplicationDbContext : IdentityDbContext<User, Role, long>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
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
    }

    public DbSet<Book> Books { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<BookDiscountHistory> BookDiscountHistories { get; set; }
    public DbSet<Discount> Discounts { get; set; }
    public DbSet<MemberDiscount> MemberDiscounts { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<OrderHistory> OrderHistories { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<ShoppingCart> ShoppingCarts { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Bookmark> Bookmarks { get; set; }
    public DbSet<BookGenre> BookGenres { get; set; }
    public DbSet<BookAuthor> BookAuthors { get; set; }
    public DbSet<Publisher> Publishers { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<Role> Roles { get; set; }
}
