using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookNook.Data;
using BookNook.DTOs;
using BookNook.Entities;

namespace BookNook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GenresController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<GenreResponseDTO>>> GetGenres()
        {
            var genres = await _context.Genres.ToListAsync();
            return genres.Select(g => new GenreResponseDTO
            {
                GenreId = g.GenreId,
                Name = g.Name,
                Description = g.Description
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GenreResponseDTO>> GetGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            return new GenreResponseDTO
            {
                GenreId = genre.GenreId,
                Name = genre.Name,
                Description = genre.Description
            };
        }

        [HttpPost]
        public async Task<ActionResult<GenreResponseDTO>> CreateGenre(CreateGenreDTO createGenreDTO)
        {
            var genre = new Genre
            {
                Name = createGenreDTO.Name,
                Description = createGenreDTO.Description
            };

            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();

            return new GenreResponseDTO
            {
                GenreId = genre.GenreId,
                Name = genre.Name,
                Description = genre.Description
            };
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<GenreResponseDTO>> UpdateGenre(int id, UpdateGenreDTO updateGenreDTO)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            genre.Name = updateGenreDTO.Name;
            genre.Description = updateGenreDTO.Description;

            await _context.SaveChangesAsync();

            return new GenreResponseDTO
            {
                GenreId = genre.GenreId,
                Name = genre.Name,
                Description = genre.Description
            };
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 