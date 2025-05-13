using Microsoft.AspNetCore.SignalR;
using BookNook.DTOs;
using System.Threading.Tasks;

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