using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProgressController(AppDbContext db) => _db = db;

    // Get progress for the current user (or static anonymous user if not authenticated)
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProgress()
    {
        var username = User.Identity?.Name;
        if (username == null)
        {
            // fall back to static username so anonymous users can access progress
            username = StaticAuthStore.Username;
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound();

        var progress = await _db.GameResults
            .Where(r => r.UserId == user.Id)
            .GroupBy(r => r.GameId)
            .Select(g => new
            {
                GameId = g.Key,
                TotalScore = g.Sum(x => x.Score),
                Sessions = g.Count(),
                LastPlayed = g.Max(x => x.PlayedAt)
            })
            .ToListAsync();

        return Ok(progress);
    }

    // Optional: get progress for all users (admin only)
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var data = await _db.GameResults
            .GroupBy(r => r.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                TotalScore = g.Sum(x => x.Score),
                GamesPlayed = g.Select(x => x.GameId).Distinct().Count()
            })
            .ToListAsync();

        return Ok(data);
    }
}
