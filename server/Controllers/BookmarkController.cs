using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services.Bookmark;
using BookNook.DTOs.Bookmark;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/bookmarks")]
    [Authorize]
    public class BookmarksController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;
        private readonly ILogger<BookmarksController> _logger;

        public BookmarksController(IBookmarkService bookmarkService, ILogger<BookmarksController> logger)
        {
            _bookmarkService = bookmarkService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserBookmarks()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var bookmarks = await _bookmarkService.GetUserBookmarksAsync(userId);
                return Ok(bookmarks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user bookmarks");
                return StatusCode(500, "An error occurred while retrieving bookmarks");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddBookmark([FromBody] BookmarkRequestDTO request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var bookmark = await _bookmarkService.AddBookmarkAsync(userId, request.BookId);
                return Ok(bookmark);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bookmark");
                return StatusCode(500, "An error occurred while adding bookmark");
            }
        }

        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveBookmark(int bookId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                await _bookmarkService.RemoveBookmarkAsync(userId, bookId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing bookmark");
                return StatusCode(500, "An error occurred while removing bookmark");
            }
        }

        [HttpGet("check/{bookId}")]
        public async Task<IActionResult> IsBookmarked(int bookId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var isBookmarked = await _bookmarkService.IsBookmarkedAsync(userId, bookId);
                return Ok(new { isBookmarked });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking bookmark status");
                return StatusCode(500, "An error occurred while checking bookmark status");
            }
        }
    }
} 