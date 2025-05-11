using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.Services;
using BookNook.DTOs;
using System.Security.Claims;
using BookNook.Data;
using Microsoft.EntityFrameworkCore;

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

                // Calculate per-book discount
                var perBookDiscount = order.OrderItems.Sum(oi => {
                    var originalPrice = oi.Book.Price;
                    return (originalPrice > oi.UnitPrice ? (originalPrice - oi.UnitPrice) * oi.Quantity : 0);
                });
                // 5% member discount if 5+ books
                var member5PercentDiscount = 0m;
                if (order.OrderItems.Sum(oi => oi.Quantity) >= 5)
                {
                    member5PercentDiscount = order.TotalAmount * 0.05m;
                }
                // 10% member discount if it was actually applied to this order
                var member10PercentDiscount = 0m;
                // Try to reconstruct the actual 10% discount applied
                var expected10Percent = order.TotalAmount * 0.10m;
                // The 10% discount is only applied if the discount amount is at least the sum of 5% and 10% (or just 10% if 5% doesn't apply)
                if (order.DiscountAmount >= member5PercentDiscount + expected10Percent - 0.01m) // allow for rounding
                {
                    member10PercentDiscount = expected10Percent;
                }
                var dto = new OrderConfirmationDto
                {
                    OrderId = order.OrderId,
                    ClaimCode = order.ClaimCode,
                    TotalAmount = order.TotalAmount,
                    FinalAmount = order.FinalAmount,
                    DiscountAmount = order.DiscountAmount,
                    PerBookDiscount = perBookDiscount,
                    Member5PercentDiscount = member5PercentDiscount,
                    Member10PercentDiscount = member10PercentDiscount,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    OrderItems = order.OrderItems.Select(oi => {
                        var originalPrice = oi.Book.Price;
                        var discountPercent = originalPrice > 0 ? (1 - (oi.UnitPrice / originalPrice)) * 100 : 0;
                        var isDiscounted = oi.UnitPrice < originalPrice;
                        var savings = (originalPrice - oi.UnitPrice) * oi.Quantity;
                        return new OrderItemConfirmationDto
                        {
                            BookId = oi.BookId,
                            BookTitle = oi.Book.Title,
                            Quantity = oi.Quantity,
                            UnitPrice = oi.UnitPrice,
                            TotalPrice = oi.UnitPrice * oi.Quantity,
                            OriginalPrice = originalPrice,
                            DiscountPercent = isDiscounted ? discountPercent : 0,
                            Savings = isDiscounted ? savings : 0
                        };
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
            // Grant 10% member discount after every 10th completed order
            var completedOrdersBefore = await _context.Orders
                .CountAsync(o => o.UserId == order.UserId && o.Status == "Completed");
            if (completedOrdersBefore % 10 == 9) // This is the 10th, 20th, etc. order (9 completed before, this is the 10th)
            {
                // Clean up expired discounts first
                var expiredDiscounts = await _context.MemberDiscounts
                    .Where(md => md.UserId == order.UserId && md.ExpiryDate <= DateTime.UtcNow)
                    .ToListAsync();
                if (expiredDiscounts.Any())
                {
                    _context.MemberDiscounts.RemoveRange(expiredDiscounts);
                    await _context.SaveChangesAsync();
                }

                var hasUnused = await _context.MemberDiscounts
                    .AnyAsync(md => md.UserId == order.UserId && !md.IsUsed && md.DiscountPercentage == 10 && md.ExpiryDate > DateTime.UtcNow);
                if (!hasUnused)
                {
                    _context.MemberDiscounts.Add(new Entities.MemberDiscount
                    {
                        UserId = order.UserId,
                        DiscountPercentage = 10,
                        IsUsed = false,
                        ExpiryDate = DateTime.UtcNow.AddMonths(3),
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }
            }
            order.Status = "Completed";
            order.OrderHistory.Status = "Completed";
            order.OrderHistory.StatusDate = DateTime.UtcNow;
            order.OrderHistory.Notes = "Order marked as completed by staff";
            await _orderService.SaveChangesAsync();
            return Ok(new { message = "Order marked as completed" });
        }

        [HttpPost("{orderId}/resend-confirmation")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ResendOrderConfirmation(int orderId)
        {
            Console.WriteLine($"[ResendOrderConfirmation] Called for orderId={orderId}");
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
            {
                Console.WriteLine($"[ResendOrderConfirmation] Order not found for orderId={orderId}");
                return NotFound(new { message = "Order not found" });
            }
            Console.WriteLine($"[ResendOrderConfirmation] Order found. Status={order.Status}");
            if (!string.Equals(order.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"[ResendOrderConfirmation] Order status is not Pending. Status={order.Status}");
                return BadRequest(new { message = "Can only resend confirmation for pending orders." });
            }
            await _emailService.SendOrderConfirmationEmailAsync(order);
            Console.WriteLine($"[ResendOrderConfirmation] Email sent for orderId={orderId}");
            return Ok(new { message = "Order confirmation email resent to user." });
        }
    }
} 