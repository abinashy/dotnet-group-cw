using Microsoft.AspNetCore.Http;

namespace BookNook.Services.Cloudinary
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
    }
} 