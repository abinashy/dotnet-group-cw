using System;
using System.Collections.Generic;

namespace BookNook.DTOs.BooksCatalogue
{
    public class BookDto
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PublicationYear { get; set; }
        public int PageCount { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int PublisherId { get; set; }
        public string PublisherName { get; set; } = string.Empty;
        public List<AuthorDto> Authors { get; set; } = new();
        public List<GenreDto> Genres { get; set; } = new();
        public int Availability { get; set; } // Stock quantity
        public string Status { get; set; } = string.Empty;
    }

    public class AuthorDto
    {
        public int AuthorId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Biography { get; set; }
    }

    public class GenreDto
    {
        public int GenreId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
} 