using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase {
private readonly AppDbContext _db;
public GamesController(AppDbContext db) { _db = db; }


[HttpGet]
public IActionResult GetGames() => Ok(_db.Games.ToList());


[Authorize]
[HttpPost("result")]
public IActionResult PostResult([FromBody] GameResultDto dto) {
var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
var gr = new GameResult { UserId = userId, GameId = dto.GameId, Score = dto.Score, PlayedAt = DateTime.UtcNow };
_db.GameResults.Add(gr);
var user = _db.Users.Find(userId);
user.Points += dto.Score;
_db.SaveChanges();
return Ok(new { points = user.Points });
}
}


public record GameResultDto(int GameId, int Score);