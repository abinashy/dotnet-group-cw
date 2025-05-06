using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services;
using BookNook.DTOs;
using System.Security.Claims;
using BookNook.Data;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;

        public OrderController(IOrderService orderService, IEmailService emailService, ApplicationDbContext context)
        {
            _orderService = orderService;
            _emailService = emailService;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!long.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var order = await _orderService.CreateOrderAsync(userId, orderDto);
                
                // Generate claim code and send confirmation email
                await _emailService.SendOrderConfirmationEmailAsync(order);
                
                return Ok(new { 
                    orderId = order.OrderId,
                    claimCode = order.ClaimCode,
                    totalAmount = order.TotalAmount,
                    finalAmount = order.FinalAmount,
                    discountAmount = order.DiscountAmount
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(int orderId)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!long.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var order = await _orderService.GetOrderByIdAsync(orderId, userId);
                
                if (order == null)
                    return NotFound();

                var dto = new OrderConfirmationDto
                {
                    OrderId = order.OrderId,
                    ClaimCode = order.ClaimCode,
                    TotalAmount = order.TotalAmount,
                    FinalAmount = order.FinalAmount,
                    DiscountAmount = order.DiscountAmount,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    OrderItems = order.OrderItems.Select(oi => new OrderItemConfirmationDto
                    {
                        BookTitle = oi.Book.Title,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.UnitPrice * oi.Quantity
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!long.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                await _orderService.CancelOrderAsync(orderId, userId);
                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            var orderDtos = (from order in orders
                             join user in _context.Users on order.UserId equals user.Id
                             select new {
                                 order.OrderId,
                                 order.UserId,
                                 CustomerName = user.FirstName + " " + user.LastName,
                                 order.OrderDate,
                                 order.Status,
                                 order.ClaimCode,
                                 order.TotalAmount,
                                 order.FinalAmount,
                                 order.DiscountAmount,
                                 OrderItems = order.OrderItems.Select(oi => new {
                                     oi.BookId,
                                     BookTitle = oi.Book.Title,
                                     oi.Quantity,
                                     oi.UnitPrice,
                                     TotalPrice = oi.UnitPrice * oi.Quantity
                                 }).ToList()
                             }).ToList();
            return Ok(orderDtos);
        }

        [HttpPut("{orderId}/complete")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CompleteOrder(int orderId, [FromBody] CompleteOrderDto dto)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId, null, true); // allow staff to fetch any order
            if (order == null)
                return NotFound(new { message = "Order not found" });
            if (order.Status == "Completed")
                return BadRequest(new { message = "Order is already completed" });
            if (!string.Equals(order.ClaimCode?.Trim(), dto.ClaimCode?.Trim(), StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = $"Invalid claim code. (DEBUG: order='{order.ClaimCode}', input='{dto.ClaimCode}')" });
            order.Status = "Completed";
            order.OrderHistory.Status = "Completed";
            order.OrderHistory.StatusDate = DateTime.UtcNow;
            order.OrderHistory.Notes = "Order marked as completed by staff";
            await _orderService.SaveChangesAsync();
            return Ok(new { message = "Order marked as completed" });
        }
    }
} 