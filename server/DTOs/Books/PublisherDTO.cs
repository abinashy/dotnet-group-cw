using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs
{
    public class PublisherResponseDTO
    {
        public int PublisherId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Website { get; set; }
    }

    public class CreatePublisherDTO
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }
    }

    public class UpdatePublisherDTO
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Website { get; set; }
    }
} 