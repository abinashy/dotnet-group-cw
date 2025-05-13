using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace BookNook.DTOs.Books
{
    public class BookDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int PublisherId { get; set; }
        public string PublisherName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ISBN { get; set; } = string.Empty;
        public DateTime PublicationDate { get; set; }
        public int PageCount { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsAwardWinning { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int Availability { get; set; } // Stock quantity
        public bool IsOnSale { get; set; } = false;
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class BookResponseDTO : BookDTO
    {
        public List<int> AuthorIds { get; set; } = new();
        public List<int> GenreIds { get; set; } = new();
        public List<AuthorDTO> Authors { get; set; } = new();
        public List<GenreDTO> Genres { get; set; } = new();
    }

    public class CreateBookDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int PublisherId { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(13)]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        public DateTime PublicationDate { get; set; } = DateTime.UtcNow;

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

        public bool IsAwardWinning { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Published";

        [Required]
        public List<int> AuthorIds { get; set; } = new();

        [Required]
        public List<int> GenreIds { get; set; } = new();
    }

    public class AuthorDTO
    {
        public int AuthorId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Biography { get; set; }
    }

    public class GenreDTO
    {
        public int GenreId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
} 