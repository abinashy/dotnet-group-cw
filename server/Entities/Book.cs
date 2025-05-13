using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookNook.Entities
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int PublisherId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(13)]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        public int PublicationYear { get; set; }

        [Required]
        public int PageCount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Language { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Format { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        public bool IsAwardWinning { get; set; } = false;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Published";

        public DateTime CreatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        public DateTime? UpdatedAt { get; set; } = null;

        // Navigation properties
        [ForeignKey("PublisherId")]
        public virtual Publisher? Publisher { get; set; }

        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
        public virtual ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
        public virtual Inventory? Inventory { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public virtual ICollection<ShoppingCart> ShoppingCarts { get; set; } = new List<ShoppingCart>();
        public virtual ICollection<BookDiscountHistory> DiscountHistory { get; set; } = new List<BookDiscountHistory>();
        public virtual ICollection<Discount> Discounts { get; set; } = new List<Discount>();
    }
} 