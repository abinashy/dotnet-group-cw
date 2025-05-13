using BookNook.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookNook.Services
{
    public class DiscountExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DiscountExpirationService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public DiscountExpirationService(
            IServiceProvider serviceProvider,
            ILogger<DiscountExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Discount Expiration Service is starting.");

            // Run once at startup after a short delay
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        await UpdateDiscountStatusesAsync(dbContext);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in Discount Expiration Service");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task UpdateDiscountStatusesAsync(ApplicationDbContext dbContext)
        {
            var now = DateTime.UtcNow;
            
            // Find all active discounts that have passed their end date
            var expiredDiscounts = await dbContext.Discounts
                .Where(d => d.IsActive && d.EndDate < now)
                .ToListAsync();
                
            if (expiredDiscounts.Count > 0)
            {
                _logger.LogInformation($"Found {expiredDiscounts.Count} expired discounts to deactivate");
                
                // Deactivate expired discounts
                foreach (var discount in expiredDiscounts)
                {
                    discount.IsActive = false;
                    _logger.LogInformation($"Deactivating discount ID {discount.DiscountId} for book ID {discount.BookId}. Expired at {discount.EndDate}");
                }
                
                await dbContext.SaveChangesAsync();
            }
            
            // Activate any discounts that have reached their start date but aren't active yet
            var pendingDiscounts = await dbContext.Discounts
                .Where(d => !d.IsActive && d.StartDate <= now && d.EndDate > now)
                .ToListAsync();
                
            if (pendingDiscounts.Count > 0)
            {
                _logger.LogInformation($"Found {pendingDiscounts.Count} pending discounts to activate");
                
                // Activate pending discounts
                foreach (var discount in pendingDiscounts)
                {
                    discount.IsActive = true;
                    _logger.LogInformation($"Activating discount ID {discount.DiscountId} for book ID {discount.BookId}. Started at {discount.StartDate}");
                }
                
                await dbContext.SaveChangesAsync();
            }
        }
        
        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Discount Expiration Service is stopping.");
            
            await base.StopAsync(cancellationToken);
        }
    }
} 