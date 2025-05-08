using Microsoft.AspNetCore.Mvc;
using BookNook.DTOs.Inventory;
using BookNook.Services.Inventory;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpPost]
        public async Task<ActionResult<InventoryResponseDTO>> CreateInventory([FromBody] CreateInventoryDTO createInventoryDTO)
        {
            try
            {
                var inventory = await _inventoryService.CreateInventoryAsync(createInventoryDTO);
                return CreatedAtAction(nameof(GetInventoryByBookId), new { bookId = inventory.BookId }, inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<InventoryResponseDTO>> GetInventoryByBookId(int bookId)
        {
            var inventory = await _inventoryService.GetInventoryByBookIdAsync(bookId);
            if (inventory == null)
                return NotFound();

            return Ok(inventory);
        }

        [HttpGet]
        public async Task<ActionResult<List<InventoryResponseDTO>>> GetAllInventories()
        {
            var inventories = await _inventoryService.GetAllInventoriesAsync();
            return Ok(inventories);
        }

        [HttpPut("{inventoryId}")]
        public async Task<ActionResult<InventoryResponseDTO>> UpdateInventory(int inventoryId, [FromBody] UpdateInventoryDTO updateInventoryDTO)
        {
            try
            {
                var inventory = await _inventoryService.UpdateInventoryAsync(inventoryId, updateInventoryDTO);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{inventoryId}")]
        public async Task<ActionResult> DeleteInventory(int inventoryId)
        {
            var success = await _inventoryService.DeleteInventoryAsync(inventoryId);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
} 