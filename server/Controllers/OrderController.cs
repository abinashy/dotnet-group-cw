using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services;
using BookNook.DTOs;
using System.Security.Claims;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IEmailService _emailService;

        public OrderController(IOrderService orderService, IEmailService emailService)
        {
            _orderService = orderService;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
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
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var order = await _orderService.GetOrderByIdAsync(orderId, userId);
                
                if (order == null)
                    return NotFound();

                return Ok(order);
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
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
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
    }
} 