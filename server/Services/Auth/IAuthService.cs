using BookNook.DTOs.Auth;

namespace BookNook.Services;

public interface IAuthService
{
    Task<(bool Success, string Message)> RegisterAsync(RegisterDto model);
    Task<(bool Success, string Token)> LoginAsync(LoginDto model);
    Task<(bool Success, string Message)> LogoutAsync();
} 