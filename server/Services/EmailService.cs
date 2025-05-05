using BookNook.Entities;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;
using BookNook.Data;

namespace BookNook.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationEmailAsync(Order order);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public EmailService(IConfiguration configuration, ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public async Task SendOrderConfirmationEmailAsync(Order order)
        {
            var user = await _context.Users.FindAsync(int.Parse(order.UserId));
            if (user == null || string.IsNullOrEmpty(user.Email))
                throw new Exception("User email not found");

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var smtpClient = new SmtpClient(smtpSettings["Host"])
            {
                Port = int.Parse(smtpSettings["Port"]),
                Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                EnableSsl = true,
            };

            var message = new MailMessage
            {
                From = new MailAddress(smtpSettings["FromEmail"], "BookNook Store"),
                Subject = $"Order Confirmation - Order #{order.OrderId}",
                IsBodyHtml = true
            };

            message.To.Add(user.Email);

            // Build email body
            var body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <h2 style='color: #2c3e50;'>Order Confirmation</h2>
                        <p>Dear {user.FirstName},</p>
                        <p>Thank you for your order! Here are your order details:</p>
                        
                        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Order Number:</strong> #{order.OrderId}</p>
                            <p><strong>Claim Code:</strong> {order.ClaimCode}</p>
                            <p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>
                            <p><strong>Discount Amount:</strong> ${order.DiscountAmount:F2}</p>
                            <p><strong>Final Amount:</strong> ${order.FinalAmount:F2}</p>
                        </div>

                        <h3>Order Items:</h3>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background-color: #f8f9fa;'>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Book</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Quantity</th>
                                <th style='padding: 10px; text-align: left; border: 1px solid #dee2e6;'>Price</th>
                            </tr>";

            foreach (var item in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                body += $@"
                    <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{book.Title}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{item.Quantity}</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>${item.UnitPrice:F2}</td>
                    </tr>";
            }

            body += $@"
                        </table>

                        <p><strong>Important:</strong> Please bring your membership ID and the claim code above when picking up your order at the store.</p>
                        
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        
                        <p>Best regards,<br>BookNook Store Team</p>
                    </body>
                </html>";

            message.Body = body;

            await smtpClient.SendMailAsync(message);
        }
    }
} 