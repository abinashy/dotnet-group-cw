using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BookNook.Entities;
using System.Linq;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public UserController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpPut("{userId}/make-staff")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MakeUserStaff(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Remove existing roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Add Staff role
            var result = await _userManager.AddToRoleAsync(user, "Staff");
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "User role updated to Staff successfully" });
        }

        [HttpGet]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetAllUsers()
        {
            var users = _userManager.Users
                .Select(u => new {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.CreatedAt
                }).ToList();
            return Ok(users);
        }
    }
} 