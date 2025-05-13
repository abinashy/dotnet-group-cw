using System;
using System.ComponentModel.DataAnnotations;

namespace BookNook.DTOs
{
    public class CreateAnnouncementDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
} 