using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.Entities;

namespace BookNook.Repositories.Announcement
{
    public class AnnouncementRepository : IAnnouncementRepository
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Entities.Announcement> CreateAsync(Entities.Announcement announcement)
        {
            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();
            return announcement;
        }

        public async Task<Entities.Announcement?> GetByIdAsync(int id, bool includeUser = true)
        {
            IQueryable<Entities.Announcement> query = _context.Announcements;

            if (includeUser)
            {
                query = query.Include(a => a.User);
            }

            return await query.FirstOrDefaultAsync(a => a.AnnouncementId == id);
        }

        public async Task<List<Entities.Announcement>> GetAllAsync(bool includeUser = true)
        {
            IQueryable<Entities.Announcement> query = _context.Announcements;

            if (includeUser)
            {
                query = query.Include(a => a.User);
            }

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        public async Task<List<Entities.Announcement>> GetActiveAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Announcements
                .Include(a => a.User)
                .Where(a => a.IsActive && a.StartDate <= now && now <= a.EndDate)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Entities.Announcement>> GetDueAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Announcements
                .Include(a => a.User)
                .Where(a => !a.IsActive && a.StartDate <= now)
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;
            
            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Entities.Announcement?> UpdateAsync(Entities.Announcement announcement)
        {
            _context.Entry(announcement).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return announcement;
        }
    }
} 