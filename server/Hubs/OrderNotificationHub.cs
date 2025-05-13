using Microsoft.AspNetCore.SignalR;
using BookNook.DTOs;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace BookNook.Hubs
{
    public class OrderNotificationHub : Hub
    {
        private readonly ILogger<OrderNotificationHub> _logger;

        public OrderNotificationHub(ILogger<OrderNotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}. Reason: {exception?.Message ?? "Unknown"}");
            await base.OnDisconnectedAsync(exception);
        }

        // Send notification to staff when a new order is placed
        public async Task SendNewOrderNotification(OrderConfirmationDto order)
        {
            _logger.LogInformation($"Sending new order notification for Order ID: {order.OrderId} to staff group");
            // Staff will be connected to the "staff" group
            await Clients.Group("staff").SendAsync("ReceiveNewOrder", order);
            _logger.LogInformation($"New order notification sent successfully");
        }
        
        // Send notification to staff when an order is cancelled
        public async Task SendOrderCancelledNotification(OrderConfirmationDto order)
        {
            _logger.LogInformation($"Sending order cancelled notification for Order ID: {order.OrderId} to staff group");
            // Staff will be connected to the "staff" group
            await Clients.Group("staff").SendAsync("ReceiveOrderCancelled", order);
            _logger.LogInformation($"Order cancelled notification sent successfully");
        }
        
        // Send notification to specific user when their order is completed
        public async Task SendOrderCompletedNotification(string userId, OrderConfirmationDto order)
        {
            _logger.LogInformation($"Sending order completed notification for Order ID: {order.OrderId} to user {userId}");
            // Users will be connected to a group with their userId
            await Clients.Group(userId).SendAsync("ReceiveOrderCompleted", order);
            _logger.LogInformation($"Order completed notification sent successfully");
        }
        
        // Join staff group (called when staff users connect)
        public async Task JoinStaffGroup()
        {
            _logger.LogInformation($"Adding user {Context.ConnectionId} to staff group");
            await Groups.AddToGroupAsync(Context.ConnectionId, "staff");
            _logger.LogInformation($"User {Context.ConnectionId} added to staff group successfully");
        }
        
        // Join user group (called when users connect)
        public async Task JoinUserGroup(string userId)
        {
            _logger.LogInformation($"Adding user {Context.ConnectionId} to user group: {userId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            _logger.LogInformation($"User {Context.ConnectionId} added to user group {userId} successfully");
        }

        // Test method to verify staff connections
        public async Task TestStaffNotification()
        {
            _logger.LogInformation("Testing staff notification");
            var testOrder = new OrderConfirmationDto
            {
                OrderId = 999,
                ClaimCode = "TEST1234",
                TotalAmount = 100,
                FinalAmount = 95,
                DiscountAmount = 5,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                OrderItems = new System.Collections.Generic.List<OrderItemConfirmationDto>
                {
                    new OrderItemConfirmationDto
                    {
                        BookId = 1,
                        BookTitle = "Test Book",
                        Quantity = 1,
                        UnitPrice = 100,
                        TotalPrice = 100
                    }
                }
            };
            
            await Clients.Group("staff").SendAsync("ReceiveNewOrder", testOrder);
            _logger.LogInformation("Test staff notification sent");
        }
    }
} 