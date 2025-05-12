using BookNook.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BookNook.Services
{
    public class AnnouncementPublisherService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        public AnnouncementPublisherService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var announcementService = scope.ServiceProvider.GetRequiredService<IAnnouncementService>();
                    await announcementService.PublishDueAnnouncementsAsync();
                }
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
} 