using BookNook.DTOs;
using BookNook.Services;
using BookNook.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    [Authorize(Roles = "Admin")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _service;
        private readonly IHubContext<AnnouncementHub> _hubContext;

        public AnnouncementController(IAnnouncementService service, IHubContext<AnnouncementHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
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

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var result = await _service.GetActiveAnnouncementsAsync();
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

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAnnouncementDto dto)
        {
            try
            {
                Console.WriteLine($"Controller: PUT update request for announcement ID {id}");
                var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var result = await _service.UpdateAnnouncementAsync(id, dto, userId);
                if (result == null) return NotFound($"Announcement with ID {id} not found");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Controller: Error updating announcement: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Workaround endpoint using POST instead of PUT
        [HttpPost("{id}/update")]
        public async Task<IActionResult> UpdateViaPost(int id, [FromBody] CreateAnnouncementDto dto)
        {
            try
            {
                Console.WriteLine($"Controller: POST update request for announcement ID {id}");
                var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var result = await _service.UpdateAnnouncementAsync(id, dto, userId);
                if (result == null) return NotFound($"Announcement with ID {id} not found");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Controller: Error in POST update: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
} 