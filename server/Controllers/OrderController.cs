using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookNook.DTOs;
using BookNook.DTOs.Order;
using BookNook.DTOs.Books;
using System.Security.Claims;
using BookNook.Data;
using BookNook.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BookNook.Services.Email;
using BookNook.Services.Order;
using BookNook.Entities;

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
                
                // Check if a 10% member discount was actually used for this order
                Console.WriteLine($"[OrderController] Checking 10% discount for Order #{orderId}, UserId: {userId}, OrderDate: {order.OrderDate}");
                
                // Debug section: dump all memberDiscounts for this user
                Console.WriteLine($"[OrderController] Debugging: All MemberDiscounts for user {userId}:");
                var allMemberDiscounts = await _context.MemberDiscounts
                    .Where(md => md.UserId == userId)
                    .OrderByDescending(md => md.CreatedAt)
                    .ToListAsync();
                
                foreach (var md in allMemberDiscounts)
                {
                    Console.WriteLine($"  - ID: {md.MemberDiscountId}, Created: {md.CreatedAt}, IsUsed: {md.IsUsed}, ExpiryDate: {md.ExpiryDate}, Percentage: {md.DiscountPercentage}%");
                }
                Console.WriteLine($"[OrderController] End of MemberDiscounts debug info");
                
                // Get all orders for this user to determine position
                Console.WriteLine($"[OrderController] Counting completed and pending orders for user {userId}");
                
                var allOrders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderBy(o => o.OrderDate)
                    .ToListAsync();
                    
                Console.WriteLine($"[OrderController] Total orders found: {allOrders.Count}");
                foreach (var o in allOrders.Take(5)) // Log the first 5 for debugging
                {
                    Console.WriteLine($"  - Order #{o.OrderId}, Date: {o.OrderDate}, Status: {o.Status}");
                }
                
                // Calculate this order's position within all user orders
                var orderPosition = allOrders.FindIndex(o => o.OrderId == orderId) + 1;
                
                Console.WriteLine($"[OrderController] Current order position: {orderPosition}");
                Console.WriteLine($"[OrderController] Is milestone order? {orderPosition % 10 == 1 && orderPosition > 10}");
                
                // Only milestone orders (11th, 21st, 31st) can have the 10% discount
                if (orderPosition % 10 == 1 && orderPosition > 10)
                {
                    Console.WriteLine($"[OrderController] This is a milestone order (position {orderPosition})");
                    // Check if there was a 10% member discount record used for this order
                    var memberDiscount = await _context.MemberDiscounts
                        .FirstOrDefaultAsync(md => md.UserId == userId 
                            && md.IsUsed 
                            && md.DiscountPercentage == 10
                            && md.CreatedAt <= order.OrderDate.AddDays(1)
                            && md.CreatedAt >= order.OrderDate.AddDays(-1));
                            
                    if (memberDiscount != null)
                    {
                        member10PercentDiscount = order.TotalAmount * 0.10m;
                        Console.WriteLine($"[OrderController] Applying 10% discount: {member10PercentDiscount}");
                    }
                    else
                    {
                        Console.WriteLine($"[OrderController] This is a milestone order but no discount record was found/used");
                    }
                }
                else
                {
                    Console.WriteLine($"[OrderController] Not a milestone order, no 10% discount applied");
                }
                
                Console.WriteLine($"[OrderController] Final discount values - PerBook: {perBookDiscount}, Member5%: {member5PercentDiscount}, Member10%: {member10PercentDiscount}");
                
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
            Console.WriteLine($"[OrderController] CancelOrder called for orderId: {orderId}");
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!long.TryParse(userIdStr, out var userId))
                {
                    Console.WriteLine("[OrderController] User ID not found in token");
                    return Unauthorized(new { message = "User ID not found in token" });
                }
                
                Console.WriteLine($"[OrderController] Cancelling order {orderId} for user {userId}");
                await _orderService.CancelOrderAsync(orderId, userId);
                Console.WriteLine($"[OrderController] Order {orderId} cancelled successfully");
                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrderController] Error cancelling order: {ex.Message}");
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
                var orderDtos = orders.Select(order => new OrderHistoryDto
                {
                    OrderId = order.OrderId,
                    ClaimCode = order.ClaimCode,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    FinalAmount = order.FinalAmount,
                    OrderItems = order.OrderItems?.Select(oi => new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        Book = oi.Book == null ? null : new BookNook.DTOs.Order.BookDto
                        {
                            BookId = oi.Book.BookId,
                            Title = oi.Book.Title
                        }
                    }).ToList(),
                    OrderHistory = order.OrderHistory == null ? null : new OrderHistoryDetailsDto
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
        public async Task<IActionResult> GetAllOrders([FromQuery] string? search = null)
        {
            var orders = await _orderService.GetAllOrdersAsync(search);
            var orderDtos = (from order in orders
                             join user in _context.Users on order.UserId equals user.Id
                             select new {
                                 order.OrderId,
                                 order.UserId,
                                 CustomerName = user.FirstName + " " + user.LastName,
                                 UserEmail = user.Email,
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
                
            try
            {
                await _orderService.CompleteOrderAsync(orderId, dto.ClaimCode);
                return Ok(new { message = "Order marked as completed" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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