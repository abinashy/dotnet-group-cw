using BookNook.DTOs;
using BookNook.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    [Authorize(Roles = "Admin")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _service;
        public AnnouncementController(IAnnouncementService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto)
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.CreateAnnouncementAsync(dto, userId);
            return Ok(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            var result = await _service.PublishAnnouncementAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ann = await _service.DeleteAnnouncementAsync(id);
            if (!ann) return NotFound();
            return NoContent();
        }
    }
} 