using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using BookNook.DTOs.Announcement;

namespace BookNook.Hubs
{
    public class AnnouncementHub : Hub
    {
        public async Task SendAnnouncement(AnnouncementDto announcement)
        {
            await Clients.All.SendAsync("ReceiveAnnouncement", announcement);
        }
    }
} 