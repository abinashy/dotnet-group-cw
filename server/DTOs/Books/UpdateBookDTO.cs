using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs.Books
{
    public class UpdateBookDTO
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
        public DateTime PublicationDate { get; set; }

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
} 