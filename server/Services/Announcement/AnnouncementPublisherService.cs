using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using BookNook.Services.Announcements;

namespace BookNook.Services.Announcements
{
    public class AnnouncementPublisherService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AnnouncementPublisherService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);
        
        public AnnouncementPublisherService(
            IServiceProvider serviceProvider, 
            ILogger<AnnouncementPublisherService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Announcement Publisher Service is starting.");
            
            // Skip the first run on startup to improve performance
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var announcementService = scope.ServiceProvider.GetRequiredService<IAnnouncementService>();
                        var publishedCount = await announcementService.PublishDueAnnouncementsAsync();
                        
                        if (publishedCount.Count > 0)
                        {
                            _logger.LogInformation($"Published {publishedCount.Count} announcements");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in Announcement Publisher Service");
                }
                
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }
        
        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Announcement Publisher Service is stopping.");
            
            await base.StopAsync(cancellationToken);
        }
    }
} 