using BookNook.Entities;

namespace BookNook.Repositories.Announcement
{
    public interface IAnnouncementRepository
    {
        Task<Entities.Announcement> CreateAsync(Entities.Announcement announcement);
        Task<Entities.Announcement?> GetByIdAsync(int id, bool includeUser = true);
        Task<List<Entities.Announcement>> GetAllAsync(bool includeUser = true);
        Task<List<Entities.Announcement>> GetActiveAnnouncementsAsync();
        Task<List<Entities.Announcement>> GetDueAnnouncementsAsync();
        Task<bool> DeleteAsync(int id);
        Task<Entities.Announcement?> UpdateAsync(Entities.Announcement announcement);
    }
} 