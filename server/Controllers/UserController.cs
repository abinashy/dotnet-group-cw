using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using BookNook.Entities;
using System.Linq;
using System.Collections.Generic;

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
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.CreatedAt,
                    Roles = roles // This will be a list of role names
                });
            }

            return Ok(userList);
        }

        [HttpGet("staff")]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetStaffUsers()
        {
            // RoleId 2 is Staff
            var staffRoleId = 2L;
            var context = HttpContext.RequestServices.GetService(typeof(BookNook.Data.ApplicationDbContext)) as BookNook.Data.ApplicationDbContext;
            var staffUsers = (from user in context.Users
                              join userRole in context.UserRoles on user.Id equals userRole.UserId
                              where userRole.RoleId == staffRoleId
                              select new {
                                  user.Id,
                                  user.UserName,
                                  user.Email,
                                  user.FirstName,
                                  user.LastName,
                                  user.CreatedAt
                              }).ToList();
            return Ok(staffUsers);
        }

        [HttpGet("member")]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetMemberUsers()
        {
            // RoleId 3 is Member
            var memberRoleId = 3L;
            var context = HttpContext.RequestServices.GetService(typeof(BookNook.Data.ApplicationDbContext)) as BookNook.Data.ApplicationDbContext;
            var memberUsers = (from user in context.Users
                               join userRole in context.UserRoles on user.Id equals userRole.UserId
                               where userRole.RoleId == memberRoleId
                               select new {
                                   user.Id,
                                   user.UserName,
                                   user.Email,
                                   user.FirstName,
                                   user.LastName,
                                   user.CreatedAt
                               }).ToList();
            return Ok(memberUsers);
        }
    }
} 