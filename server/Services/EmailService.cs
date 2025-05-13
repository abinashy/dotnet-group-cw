using BookNook.Entities;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;
using BookNook.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationEmailAsync(Order order);
        Task SendOrderNotificationToStaffAsync(Order order);
        Task SendOrderCancellationToStaffAsync(Order order);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public EmailService(IConfiguration configuration, ApplicationDbContext context, UserManager<User> userManager)
        {
            _configuration = configuration;
            _context = context;
            _userManager = userManager;
        }

        public async Task SendOrderConfirmationEmailAsync(Order order)
        {
            var user = await _context.Users.FindAsync(order.UserId);
            if (user == null || string.IsNullOrEmpty(user.Email))
                throw new Exception("User email not found");

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var host = smtpSettings["Host"];
            var port = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(port) ||
                string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new Exception("SMTP configuration is missing required values. Please check your appsettings.json.");
            }

            var smtpClient = new SmtpClient(host)
            {
                Port = int.Parse(port),
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true,
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, "BookNook Store"),
                Subject = $"Order Confirmation - Order #{order.OrderId}",
                IsBodyHtml = true
            };

            message.To.Add(user.Email);

            // Build email body
            var perBookDiscount = order.OrderItems.Sum(item => {
                var book = _context.Books.Find(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                return (originalPrice > item.UnitPrice ? (originalPrice - item.UnitPrice) * item.Quantity : 0);
            });
            var member5PercentDiscount = 0m;
            var member10PercentDiscount = 0m;
            if (order.OrderItems.Sum(i => i.Quantity) >= 5)
            {
                member5PercentDiscount = order.TotalAmount * 0.05m;
            }
            
            // Check for 10% discount by looking for a used MemberDiscount record
            var orderDate = order.OrderDate;
            var oneDayAfter = orderDate.AddDays(1);
            
            Console.WriteLine($"[EmailService] Checking 10% discount for Order #{order.OrderId}, UserId: {order.UserId}, OrderDate: {orderDate}");
            
            // Debug section: dump all memberDiscounts for this user
            Console.WriteLine($"[EmailService] Debugging: All MemberDiscounts for user {order.UserId}:");
            var allMemberDiscounts = await _context.MemberDiscounts
                .Where(md => md.UserId == order.UserId)
                .OrderByDescending(md => md.CreatedAt)
                .ToListAsync();
            
            foreach (var md in allMemberDiscounts)
            {
                Console.WriteLine($"  - ID: {md.MemberDiscountId}, Created: {md.CreatedAt}, IsUsed: {md.IsUsed}, ExpiryDate: {md.ExpiryDate}, Percentage: {md.DiscountPercentage}%");
            }
            Console.WriteLine($"[EmailService] End of MemberDiscounts debug info");
            
            // Get all orders for this user to determine position
            Console.WriteLine($"[EmailService] Getting all orders for user {order.UserId}");
            
            var allOrders = await _context.Orders
                .Where(o => o.UserId == order.UserId)
                .OrderBy(o => o.OrderDate)
                .ToListAsync();
                
            Console.WriteLine($"[EmailService] Total orders found: {allOrders.Count}");
            foreach (var o in allOrders.Take(5)) // Log the first 5 for debugging
            {
                Console.WriteLine($"  - Order #{o.OrderId}, Date: {o.OrderDate}, Status: {o.Status}");
            }
            
            // Calculate this order's position within all user orders
            var orderPosition = allOrders.FindIndex(o => o.OrderId == order.OrderId) + 1;
            
            Console.WriteLine($"[EmailService] Current order position: {orderPosition}");
            Console.WriteLine($"[EmailService] Is milestone order? {orderPosition % 10 == 1 && orderPosition > 10}");
            
            // Only milestone orders (11th, 21st, 31st) can have the 10% discount
            if (orderPosition % 10 == 1 && orderPosition > 10)
            {
                Console.WriteLine($"[EmailService] This is a milestone order (position {orderPosition})");
                // Check if there was a 10% member discount record used for this order
                var memberDiscount = await _context.MemberDiscounts
                    .FirstOrDefaultAsync(md => md.UserId == order.UserId 
                        && md.IsUsed 
                        && md.DiscountPercentage == 10
                        && md.CreatedAt <= oneDayAfter
                        && md.CreatedAt >= orderDate.AddDays(-1));
                        
                if (memberDiscount != null)
                {
                    member10PercentDiscount = order.TotalAmount * 0.10m;
                    Console.WriteLine($"[EmailService] Applying 10% discount: {member10PercentDiscount}");
                }
                else
                {
                    Console.WriteLine($"[EmailService] This is a milestone order but no discount record was found/used");
                }
            }
            else
            {
                Console.WriteLine($"[EmailService] Not a milestone order, no 10% discount applied");
            }
            
            Console.WriteLine($"[EmailService] Final discount values - PerBook: {perBookDiscount}, Member5%: {member5PercentDiscount}, Member10%: {member10PercentDiscount}");
            
            var discountExplanation = "";
            
            if (perBookDiscount > 0)
                discountExplanation += $"<p>• Per-book discounts are applied directly to individual book prices</p>";
                
            if (member5PercentDiscount > 0)
                discountExplanation += $"<p>• 5% Member Discount applied on orders with 5 or more items</p>";
                
            if (member10PercentDiscount > 0)
                discountExplanation += $"<p>• 10% Member Discount applied on milestone orders (11th, 21st, 31st, etc.)</p>";
                
            if (discountExplanation.Length > 0)
                discountExplanation = $@"<div style='background-color: #e6f7e6; padding: 10px; border-radius: 5px; margin-top: 10px;'>
                    <p><strong>Your Savings Breakdown:</strong></p>
                    {discountExplanation}
                    <p style='font-size: 11px; color: #666; margin-top: 8px;'>
                        Note: The 10% milestone discount is earned after completing your 10th, 20th, 30th order (and so on), 
                        and automatically applied to your next order.
                    </p>
                </div>";

            var body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <h2 style='color: #2c3e50;'>Order Confirmation</h2>
                        <p>Dear {user.FirstName},</p>
                        <p>Thank you for your order! Here are your order details:</p>
                        
                        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Order Number:</strong> #{order.OrderId}</p>
                            <p><strong>Membership ID:</strong> {user.Id}</p>
                            <p><strong>Claim Code:</strong> {order.ClaimCode}</p>
                            <p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>
                            {(perBookDiscount > 0 ? $"<p><strong>Per-Book Discount (Special Offers):</strong> -${perBookDiscount:F2}</p>" : "")}
                            {(member5PercentDiscount > 0 ? $"<p><strong>Member 5% Discount (5+ books):</strong> -${member5PercentDiscount:F2}</p>" : "")}
                            {(member10PercentDiscount > 0 ? $"<p><strong>Member 10% Discount (Milestone):</strong> -${member10PercentDiscount:F2}</p>" : "")}
                            <p><strong>Total Discount:</strong> -${order.DiscountAmount:F2}</p>
                            <p><strong>Final Amount:</strong> ${order.FinalAmount:F2}</p>
                        </div>";
            
            // Debug display values
            Console.WriteLine("[EmailService] DEBUG - Email display values:");
            Console.WriteLine($"  - Will show Per-Book Discount? {perBookDiscount > 0}, Value: {perBookDiscount:F2}");
            Console.WriteLine($"  - Will show 5% Discount? {member5PercentDiscount > 0}, Value: {member5PercentDiscount:F2}");
            Console.WriteLine($"  - Will show 10% Discount? {member10PercentDiscount > 0}, Value: {member10PercentDiscount:F2}");
            Console.WriteLine($"  - Order total discount amount from DB: {order.DiscountAmount:F2}");
            Console.WriteLine($"  - Calculated discount (sum): {perBookDiscount + member5PercentDiscount + member10PercentDiscount:F2}");
            
            body += $@"
                        <h3>Order Items:</h3>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background-color: #f8f9fa;'>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Book</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Quantity</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Original Price</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Discount</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Price Paid</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Savings</th>
                            </tr>";

            foreach (var item in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                var discount = originalPrice > 0 ? (1 - (item.UnitPrice / originalPrice)) * 100 : 0;
                var isDiscounted = item.UnitPrice < originalPrice;
                var savings = (originalPrice - item.UnitPrice) * item.Quantity;
                body += $@"
                    <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{book?.Title}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{item.Quantity}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"<span style='text-decoration:line-through;color:#888;'>${originalPrice:F2}</span>" : $"${originalPrice:F2}")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"{discount:F0}%" : "-")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>${item.UnitPrice:F2}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"${savings:F2}" : "-")}</td>
                    </tr>";
            }

            body += $@"
                        </table>

                        <p><strong>Important:</strong> Please bring your <strong>membership ID ({user.Id})</strong> and the claim code above when picking up your order at the store.</p>
                        {discountExplanation}
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        
                        <p>Best regards,<br>BookNook Store Team</p>
                    </body>
                </html>";

            message.Body = body;

            await smtpClient.SendMailAsync(message);
        }

        public async Task SendOrderNotificationToStaffAsync(Order order)
        {
            var staffUsers = await _userManager.GetUsersInRoleAsync("Staff");
            if (staffUsers == null || staffUsers.Count == 0)
                return;

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var host = smtpSettings["Host"];
            var port = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];

            var smtpClient = new SmtpClient(host)
            {
                Port = int.Parse(port),
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true,
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, "BookNook Store"),
                Subject = $"New Order Placed - Order #{order.OrderId}",
                IsBodyHtml = true
            };

            foreach (var staff in staffUsers)
            {
                if (!string.IsNullOrEmpty(staff.Email))
                    message.To.Add(staff.Email);
            }

            var user = await _context.Users.FindAsync(order.UserId);
            var perBookDiscount = order.OrderItems.Sum(item => {
                var book = _context.Books.Find(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                return (originalPrice > item.UnitPrice ? (originalPrice - item.UnitPrice) * item.Quantity : 0);
            });
            var member5PercentDiscount = 0m;
            var member10PercentDiscount = 0m;
            if (order.OrderItems.Sum(i => i.Quantity) >= 5)
            {
                member5PercentDiscount = order.TotalAmount * 0.05m;
            }
            
            // Check for 10% discount by looking for a used MemberDiscount record
            var orderDate = order.OrderDate;
            var oneDayAfter = orderDate.AddDays(1);
            
            // Get all orders for this user to determine position
            var allOrders = await _context.Orders
                .Where(o => o.UserId == order.UserId)
                .OrderBy(o => o.OrderDate)
                .ToListAsync();
                
            // Calculate this order's position within all user orders
            var orderPosition = allOrders.FindIndex(o => o.OrderId == order.OrderId) + 1;
            
            // Only milestone orders (11th, 21st, 31st) can have the 10% discount
            if (orderPosition % 10 == 1 && orderPosition > 10)
            {
                // Check if there was a 10% member discount record used for this order
                var memberDiscount = await _context.MemberDiscounts
                    .FirstOrDefaultAsync(md => md.UserId == order.UserId 
                        && md.IsUsed 
                        && md.DiscountPercentage == 10
                        && md.CreatedAt <= oneDayAfter
                        && md.CreatedAt >= orderDate.AddDays(-1));
                        
                if (memberDiscount != null)
                {
                    member10PercentDiscount = order.TotalAmount * 0.10m;
                }
            }
            var body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <h2 style='color: #2c3e50;'>New Order Notification</h2>
                        <p>A new order has been placed by <strong>{user?.FirstName} {user?.LastName}</strong> (Email: {user?.Email}).</p>
                        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Order Number:</strong> #{order.OrderId}</p>
                            <p><strong>Claim Code:</strong> {order.ClaimCode}</p>
                            <p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>
                            {(perBookDiscount > 0 ? $"<p><strong>Per-Book Discount (Special Offers):</strong> -${perBookDiscount:F2}</p>" : "")}
                            {(member5PercentDiscount > 0 ? $"<p><strong>Member 5% Discount (5+ books):</strong> -${member5PercentDiscount:F2}</p>" : "")}
                            {(member10PercentDiscount > 0 ? $"<p><strong>Member 10% Discount (Milestone):</strong> -${member10PercentDiscount:F2}</p>" : "")}
                            <p><strong>Total Discount:</strong> -${order.DiscountAmount:F2}</p>
                            <p><strong>Final Amount:</strong> ${order.FinalAmount:F2}</p>
                        </div>
                        <h3>Order Items:</h3>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background-color: #f8f9fa;'>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Book</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Quantity</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Original Price</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Discount</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Price Paid</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Savings</th>
                            </tr>";
            foreach (var item in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                var discount = originalPrice > 0 ? (1 - (item.UnitPrice / originalPrice)) * 100 : 0;
                var isDiscounted = item.UnitPrice < originalPrice;
                var savings = (originalPrice - item.UnitPrice) * item.Quantity;
                body += $@"
                    <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{book?.Title}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{item.Quantity}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"<span style='text-decoration:line-through;color:#888;'>${originalPrice:F2}</span>" : $"${originalPrice:F2}")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"{discount:F0}%" : "-")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>${item.UnitPrice:F2}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"${savings:F2}" : "-")}</td>
                    </tr>";
            }
            body += $@"
                        </table>
                        <p>Order placed on: {order.OrderDate.ToLocalTime()}</p>
                        <p>Best regards,<br>BookNook System</p>
                    </body>
                </html>";
            message.Body = body;
            await smtpClient.SendMailAsync(message);
        }

        public async Task SendOrderCancellationToStaffAsync(Order order)
        {
            var staffUsers = await _userManager.GetUsersInRoleAsync("Staff");
            if (staffUsers == null || staffUsers.Count == 0)
                return;

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var host = smtpSettings["Host"];
            var port = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];

            var smtpClient = new SmtpClient(host)
            {
                Port = int.Parse(port),
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true,
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, "BookNook Store"),
                Subject = $"Order Cancelled - Order #{order.OrderId}",
                IsBodyHtml = true
            };

            foreach (var staff in staffUsers)
            {
                if (!string.IsNullOrEmpty(staff.Email))
                    message.To.Add(staff.Email);
            }

            var user = await _context.Users.FindAsync(order.UserId);
            var perBookDiscount = order.OrderItems.Sum(item => {
                var book = _context.Books.Find(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                return (originalPrice > item.UnitPrice ? (originalPrice - item.UnitPrice) * item.Quantity : 0);
            });
            var member5PercentDiscount = 0m;
            var member10PercentDiscount = 0m;
            if (order.OrderItems.Sum(i => i.Quantity) >= 5)
            {
                member5PercentDiscount = order.TotalAmount * 0.05m;
            }
            
            // Check for 10% discount by looking for a used MemberDiscount record
            var orderDate = order.OrderDate;
            var oneDayAfter = orderDate.AddDays(1);
            
            // Get all orders for this user to determine position
            var allOrders = await _context.Orders
                .Where(o => o.UserId == order.UserId)
                .OrderBy(o => o.OrderDate)
                .ToListAsync();
                
            // Calculate this order's position within all user orders
            var orderPosition = allOrders.FindIndex(o => o.OrderId == order.OrderId) + 1;
            
            // Only milestone orders (11th, 21st, 31st) can have the 10% discount
            if (orderPosition % 10 == 1 && orderPosition > 10)
            {
                // Check if there was a 10% member discount record used for this order
                var memberDiscount = await _context.MemberDiscounts
                    .FirstOrDefaultAsync(md => md.UserId == order.UserId 
                        && md.IsUsed 
                        && md.DiscountPercentage == 10
                        && md.CreatedAt <= oneDayAfter
                        && md.CreatedAt >= orderDate.AddDays(-1));
                        
                if (memberDiscount != null)
                {
                    member10PercentDiscount = order.TotalAmount * 0.10m;
                }
            }
            var body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <h2 style='color: #c0392b;'>Order Cancelled</h2>
                        <p>The following order has been cancelled by <strong>{user?.FirstName} {user?.LastName}</strong> (Email: {user?.Email}).</p>
                        <div style='background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Order Number:</strong> #{order.OrderId}</p>
                            <p><strong>Claim Code:</strong> {order.ClaimCode}</p>
                            <p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>
                            {(perBookDiscount > 0 ? $"<p><strong>Per-Book Discount (Special Offers):</strong> -${perBookDiscount:F2}</p>" : "")}
                            {(member5PercentDiscount > 0 ? $"<p><strong>Member 5% Discount (5+ books):</strong> -${member5PercentDiscount:F2}</p>" : "")}
                            {(member10PercentDiscount > 0 ? $"<p><strong>Member 10% Discount (Milestone):</strong> -${member10PercentDiscount:F2}</p>" : "")}
                            <p><strong>Total Discount:</strong> -${order.DiscountAmount:F2}</p>
                            <p><strong>Final Amount:</strong> ${order.FinalAmount:F2}</p>
                        </div>
                        <h3>Order Items:</h3>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background-color: #f8f9fa;'>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Book</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Quantity</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Original Price</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Discount</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Price Paid</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Savings</th>
                            </tr>";
            foreach (var item in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                var originalPrice = book?.Price ?? item.UnitPrice;
                var discount = originalPrice > 0 ? (1 - (item.UnitPrice / originalPrice)) * 100 : 0;
                var isDiscounted = item.UnitPrice < originalPrice;
                var savings = (originalPrice - item.UnitPrice) * item.Quantity;
                body += $@"
                    <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{book?.Title}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{item.Quantity}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"<span style='text-decoration:line-through;color:#888;'>${originalPrice:F2}</span>" : $"${originalPrice:F2}")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"{discount:F0}%" : "-")}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>${item.UnitPrice:F2}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{(isDiscounted ? $"${savings:F2}" : "-")}</td>
                    </tr>";
            }
            body += $@"
                        </table>
                        <p>Order was cancelled on: {DateTime.Now.ToLocalTime()}</p>
                        <p>Best regards,<br>BookNook System</p>
                    </body>
                </html>";
            message.Body = body;
            await smtpClient.SendMailAsync(message);
        }
    }
} 