using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookNook.Data;
using BookNook.Entities;
using BookNook.DTOs.Auth;
using BookNook.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BookNook.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public AuthService(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IConfiguration configuration,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _context = context;
    }

    public async Task<(bool Success, string Message)> RegisterAsync(RegisterDto model)
    {
        if (await _userManager.FindByEmailAsync(model.Email) != null)
        {
            return (false, "Email is already registered");
        }

        var user = new User
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Assign default role
        var memberRole = await _roleManager.FindByNameAsync("Member");
        if (memberRole == null)
        {
            await _roleManager.CreateAsync(new Role { Name = "Member" });
        }
        await _userManager.AddToRoleAsync(user, "Member");

        return (true, "User registered successfully");
    }

    public async Task<(bool Success, string Token)> LoginAsync(LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        {
            return (false, "Invalid email or password");
        }

        var userRoles = await _userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        foreach (var userRole in userRoles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, userRole));
        }

        var token = GetToken(authClaims);
        return (true, new JwtSecurityTokenHandler().WriteToken(token));
    }

    private JwtSecurityToken GetToken(List<Claim> authClaims)
    {
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: _configuration["JWT:ValidAudience"],
            expires: DateTime.Now.AddHours(3),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return token;
    }

    public async Task<(bool Success, string Message)> LogoutAsync()
    {
        // Since we're using JWT tokens, we don't need to do anything on the server side
        // The token will be invalidated by removing it from the client
        return (true, "Logged out successfully");
    }
} 