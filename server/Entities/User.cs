using Microsoft.AspNetCore.Identity;

namespace BookNook.Entities;

public class User : IdentityUser<long>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
    public bool IsActive { get; set; } = true;
} 