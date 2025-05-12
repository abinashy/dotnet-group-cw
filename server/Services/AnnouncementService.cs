using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookNook.Services
{
    public interface IAnnouncementService
    {
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto, long userId);
        Task<List<AnnouncementDto>> GetAllAsync();
        Task<AnnouncementDto?> PublishAnnouncementAsync(int id);
        Task<List<AnnouncementDto>> PublishDueAnnouncementsAsync();
        Task<bool> DeleteAnnouncementAsync(int id);
        Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto, long userId);
    }

    public class AnnouncementService : IAnnouncementService
    {
        private readonly ApplicationDbContext _db;
        public AnnouncementService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto, long userId)
        {
            var ann = new Announcement
            {
                Title = dto.Title,
                Content = dto.Content,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };
            _db.Announcements.Add(ann);
            await _db.SaveChangesAsync();
            return await ToDtoAsync(ann);
        }

        public async Task<List<AnnouncementDto>> GetAllAsync()
        {
            return await _db.Announcements.Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementId = a.AnnouncementId,
                    Title = a.Title,
                    Content = a.Content,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    CreatedBy = a.CreatedBy,
                    CreatedByName = a.User.UserName,
                    CreatedAt = a.CreatedAt
                }).ToListAsync();
        }

        public async Task<AnnouncementDto?> PublishAnnouncementAsync(int id)
        {
            var ann = await _db.Announcements.Include(a => a.User).FirstOrDefaultAsync(a => a.AnnouncementId == id);
            if (ann == null) return null;
            ann.IsActive = true;
            ann.StartDate = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return await ToDtoAsync(ann);
        }

        public async Task<List<AnnouncementDto>> PublishDueAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            var due = await _db.Announcements.Include(a => a.User)
                .Where(a => !a.IsActive && a.StartDate <= now)
                .ToListAsync();
            foreach (var ann in due)
            {
                ann.IsActive = true;
            }
            await _db.SaveChangesAsync();
            return due.Select(a => new AnnouncementDto
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedByName = a.User.UserName,
                CreatedAt = a.CreatedAt
            }).ToList();
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var ann = await _db.Announcements.FindAsync(id);
            if (ann == null) return false;
            _db.Announcements.Remove(ann);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto, long userId)
        {
            Console.WriteLine($"DEBUG: Updating announcement with ID: {id}");
            var ann = await _db.Announcements.Include(a => a.User).FirstOrDefaultAsync(a => a.AnnouncementId == id);
            if (ann == null) 
            {
                Console.WriteLine($"DEBUG: Announcement with ID {id} not found");
                return null;
            }
            
            Console.WriteLine($"DEBUG: Found announcement: ID={ann.AnnouncementId}, Title={ann.Title}");
            ann.Title = dto.Title;
            ann.Content = dto.Content;
            ann.StartDate = dto.StartDate;
            ann.EndDate = dto.EndDate;
            ann.IsActive = dto.IsActive;
            
            await _db.SaveChangesAsync();
            Console.WriteLine($"DEBUG: Updated announcement successfully");
            return await ToDtoAsync(ann);
        }

        private async Task<AnnouncementDto> ToDtoAsync(Announcement a)
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