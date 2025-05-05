using BookNook.Services;
using BookNook.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BookNook.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var (success, message) = await _authService.RegisterAsync(model);
        if (!success)
        {
            return BadRequest(new { message });
        }
        return Ok(new { message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var (success, token) = await _authService.LoginAsync(model);
        if (!success)
        {
            return Unauthorized(new { message = token });
        }
        return Ok(new { token });
    }

    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new { message = "You are an admin!" });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var (success, message) = await _authService.LogoutAsync();
        if (!success)
        {
            return BadRequest(new { message });
        }
        return Ok(new { message });
    }
} 