using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<AuthorResponseDTO>>> GetAuthors()
        {
            var authors = await _context.Authors.ToListAsync();
            return authors.Select(a => new AuthorResponseDTO
            {
                AuthorId = a.AuthorId,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Biography = a.Biography,
                CreatedAt = a.CreatedAt
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AuthorResponseDTO>> GetAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            return new AuthorResponseDTO
            {
                AuthorId = author.AuthorId,
                FirstName = author.FirstName,
                LastName = author.LastName,
                Biography = author.Biography,
                CreatedAt = author.CreatedAt
            };
        }

        [HttpPost]
        public async Task<ActionResult<AuthorResponseDTO>> CreateAuthor(CreateAuthorDTO createAuthorDTO)
        {
            var author = new Author
            {
                FirstName = createAuthorDTO.FirstName,
                LastName = createAuthorDTO.LastName,
                Biography = createAuthorDTO.Biography,
                CreatedAt = DateTime.UtcNow
            };

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            return new AuthorResponseDTO
            {
                AuthorId = author.AuthorId,
                FirstName = author.FirstName,
                LastName = author.LastName,
                Biography = author.Biography,
                CreatedAt = author.CreatedAt
            };
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AuthorResponseDTO>> UpdateAuthor(int id, UpdateAuthorDTO updateAuthorDTO)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            author.FirstName = updateAuthorDTO.FirstName;
            author.LastName = updateAuthorDTO.LastName;
            author.Biography = updateAuthorDTO.Biography;

            await _context.SaveChangesAsync();

            return new AuthorResponseDTO
            {
                AuthorId = author.AuthorId,
                FirstName = author.FirstName,
                LastName = author.LastName,
                Biography = author.Biography,
                CreatedAt = author.CreatedAt
            };
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 