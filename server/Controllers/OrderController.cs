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

        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"[OrderController] userIdStr from JWT: {userIdStr}");
                if (string.IsNullOrEmpty(userIdStr))
                {
                    Console.WriteLine("[OrderController] userIdStr is null or empty. Returning Unauthorized.");
                    return Unauthorized();
                }
                var userId = long.Parse(userIdStr);
                Console.WriteLine($"[OrderController] Parsed userId: {userId}");

                var orders = await _orderService.GetOrderHistoryAsync(userId);
                Console.WriteLine($"[OrderController] Orders fetched: {orders.Count}");

                // Map to DTOs to avoid cycles
                var orderDtos = orders.Select(order => new DTOs.OrderHistoryDto
                {
                    OrderId = order.OrderId,
                    ClaimCode = order.ClaimCode,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    FinalAmount = order.FinalAmount,
                    OrderItems = order.OrderItems?.Select(oi => new DTOs.OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        Book = oi.Book == null ? null : new DTOs.BookDto
                        {
                            BookId = oi.Book.BookId,
                            Title = oi.Book.Title
                        }
                    }).ToList(),
                    OrderHistory = order.OrderHistory == null ? null : new DTOs.OrderHistoryDetailsDto
                    {
                        Status = order.OrderHistory.Status,
                        StatusDate = order.OrderHistory.StatusDate,
                        Notes = order.OrderHistory.Notes
                    }
                }).ToList();

                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrderController] Exception: {ex.Message}\n{ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 