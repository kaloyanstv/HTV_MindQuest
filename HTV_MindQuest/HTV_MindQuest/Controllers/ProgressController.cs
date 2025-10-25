using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProgressController(AppDbContext db) => _db = db;

    // Get progress for the current user
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProgress()
    {
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();

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
