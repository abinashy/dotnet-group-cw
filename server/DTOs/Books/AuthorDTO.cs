using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs
{
    public class AuthorDTO
    {
        public int AuthorId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Biography { get; set; }
    }

    public class AuthorResponseDTO : AuthorDTO
    {
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAuthorDTO
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        public string? Biography { get; set; }
    }

    public class UpdateAuthorDTO
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        public string? Biography { get; set; }
    }
} 