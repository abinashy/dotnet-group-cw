using BookNook.Data;
using BookNook.DTOs.Announcement;
using BookNook.Entities;
using BookNook.Hubs;
using BookNook.Repositories.Announcement;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Services.Announcements
{
    public interface IAnnouncementService
    {
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto, long userId);
        Task<List<AnnouncementDto>> GetAllAsync();
        Task<AnnouncementDto?> PublishAnnouncementAsync(int id);
        Task<List<AnnouncementDto>> PublishDueAnnouncementsAsync();
        Task<bool> DeleteAnnouncementAsync(int id);
        Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto, long userId);
        Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync();
        Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id);
    }

    public class AnnouncementService : IAnnouncementService
    {
        private readonly IAnnouncementRepository _repository;
        private readonly ApplicationDbContext _db;
        private readonly IHubContext<AnnouncementHub> _hubContext;
        
        public AnnouncementService(IAnnouncementRepository repository, ApplicationDbContext db, IHubContext<AnnouncementHub> hubContext)
        {
            _repository = repository;
            _db = db;
            _hubContext = hubContext;
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto, long userId)
        {
            var ann = new Entities.Announcement
            {
                Title = dto.Title,
                Content = dto.Content,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            var createdAnnouncement = await _repository.CreateAsync(ann);
            
            var announcementDto = await ToDtoAsync(createdAnnouncement);
            
            // If announcement is active now, notify connected clients immediately
            if (ann.IsActive && ann.StartDate <= DateTime.UtcNow && DateTime.UtcNow <= ann.EndDate)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", announcementDto);
            }
            
            return announcementDto;
        }

        public async Task<List<AnnouncementDto>> GetAllAsync()
        {
            var announcements = await _repository.GetAllAsync();
            return announcements.Select(a => new AnnouncementDto
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedByName = a.User?.UserName ?? "",
                CreatedAt = a.CreatedAt
            }).ToList();
        }
        
        public async Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync()
        {
            var activeAnnouncements = await _repository.GetActiveAnnouncementsAsync();
            return activeAnnouncements.Select(a => new AnnouncementDto
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedByName = a.User?.UserName ?? "",
                CreatedAt = a.CreatedAt
            }).ToList();
        }

        public async Task<AnnouncementDto?> PublishAnnouncementAsync(int id)
        {
            var ann = await _repository.GetByIdAsync(id);
            if (ann == null) return null;
            
            ann.IsActive = true;
            ann.StartDate = DateTime.UtcNow;
            
            var updatedAnnouncement = await _repository.UpdateAsync(ann);
            if (updatedAnnouncement == null) return null;
            
            var announcementDto = await ToDtoAsync(updatedAnnouncement);
            
            // Notify connected clients about the newly published announcement
            await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", announcementDto);
            
            return announcementDto;
        }

        public async Task<List<AnnouncementDto>> PublishDueAnnouncementsAsync()
        {
            var due = await _repository.GetDueAnnouncementsAsync();
                
            if (due.Count == 0)
            {
                return new List<AnnouncementDto>();
            }
            
            var announcements = new List<AnnouncementDto>();
            
            foreach (var ann in due)
            {
                ann.IsActive = true;
                var updatedAnnouncement = await _repository.UpdateAsync(ann);
                if (updatedAnnouncement != null)
                {
                    var dto = await ToDtoAsync(updatedAnnouncement);
                    announcements.Add(dto);
                }
            }
            
            // Notify connected clients about each newly activated announcement
            foreach (var announcement in announcements)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", announcement);
            }
            
            return announcements;
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto, long userId)
        {
            Console.WriteLine($"DEBUG: Updating announcement with ID: {id}");
            var ann = await _repository.GetByIdAsync(id);
            if (ann == null) 
            {
                Console.WriteLine($"DEBUG: Announcement with ID {id} not found");
                return null;
            }
            
            Console.WriteLine($"DEBUG: Found announcement: ID={ann.AnnouncementId}, Title={ann.Title}");
            
            bool wasActive = ann.IsActive && ann.StartDate <= DateTime.UtcNow && DateTime.UtcNow <= ann.EndDate;
            
            ann.Title = dto.Title;
            ann.Content = dto.Content;
            ann.StartDate = dto.StartDate;
            ann.EndDate = dto.EndDate;
            ann.IsActive = dto.IsActive;
            
            var updatedAnnouncement = await _repository.UpdateAsync(ann);
            if (updatedAnnouncement == null) return null;
            
            Console.WriteLine($"DEBUG: Updated announcement successfully");
            
            var announcementDto = await ToDtoAsync(updatedAnnouncement);
            
            // Check if announcement became active or was already active
            bool isNowActive = updatedAnnouncement.IsActive && updatedAnnouncement.StartDate <= DateTime.UtcNow && DateTime.UtcNow <= updatedAnnouncement.EndDate;
            
            // If announcement became active or was updated while active, notify clients
            if (isNowActive)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", announcementDto);
            }
            
            return announcementDto;
        }

        public async Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id)
        {
            var announcement = await _repository.GetByIdAsync(id);
            if (announcement == null) return null;
            
            return await ToDtoAsync(announcement);
        }

        private async Task<AnnouncementDto> ToDtoAsync(Entities.Announcement a)
        {
            var user = a.User ?? await _db.Users.FindAsync(a.CreatedBy);
            return new AnnouncementDto
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedByName = user?.UserName ?? "",
                CreatedAt = a.CreatedAt
            };
        }
    }
} 