using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublishersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublishersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<PublisherResponseDTO>>> GetPublishers()
        {
            var publishers = await _context.Publishers.ToListAsync();
            return publishers.Select(p => new PublisherResponseDTO
            {
                PublisherId = p.PublisherId,
                Name = p.Name,
                Description = p.Description,
                Website = p.Website
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PublisherResponseDTO>> GetPublisher(int id)
        {
            var publisher = await _context.Publishers.FindAsync(id);
            if (publisher == null)
                return NotFound();

            return new PublisherResponseDTO
            {
                PublisherId = publisher.PublisherId,
                Name = publisher.Name,
                Description = publisher.Description,
                Website = publisher.Website
            };
        }

        [HttpPost]
        public async Task<ActionResult<PublisherResponseDTO>> CreatePublisher(CreatePublisherDTO createPublisherDTO)
        {
            var publisher = new Publisher
            {
                Name = createPublisherDTO.Name,
                Description = createPublisherDTO.Description,
                Website = createPublisherDTO.Website
            };

            _context.Publishers.Add(publisher);
            await _context.SaveChangesAsync();

            return new PublisherResponseDTO
            {
                PublisherId = publisher.PublisherId,
                Name = publisher.Name,
                Description = publisher.Description,
                Website = publisher.Website
            };
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PublisherResponseDTO>> UpdatePublisher(int id, CreatePublisherDTO updatePublisherDTO)
        {
            var publisher = await _context.Publishers.FindAsync(id);
            if (publisher == null)
                return NotFound();

            publisher.Name = updatePublisherDTO.Name;
            publisher.Description = updatePublisherDTO.Description;
            publisher.Website = updatePublisherDTO.Website;

            await _context.SaveChangesAsync();

            return new PublisherResponseDTO
            {
                PublisherId = publisher.PublisherId,
                Name = publisher.Name,
                Description = publisher.Description,
                Website = publisher.Website
            };
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePublisher(int id)
        {
            var publisher = await _context.Publishers.FindAsync(id);
            if (publisher == null)
                return NotFound();

            _context.Publishers.Remove(publisher);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 