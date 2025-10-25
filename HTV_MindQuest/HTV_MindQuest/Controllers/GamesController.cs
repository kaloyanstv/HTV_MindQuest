using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase {
private readonly AppDbContext _db;
public GamesController(AppDbContext db) { _db = db; }


[HttpGet]
public IActionResult GetGames() => Ok(_db.Games.ToList());


[HttpPost("result")]
public IActionResult PostResult([FromBody] GameResultDto dto) {
	int userId;
	try
	{
		var idClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
		userId = idClaim != null ? int.Parse(idClaim) : -1;
	}
	catch
	{
		userId = -1;
	}

	// If unauthenticated, fall back to static user
	if (userId <= 0)
	{
		var staticUser = _db.Users.FirstOrDefault(u => u.Username == StaticAuthStore.Username);
		if (staticUser == null)
		{
			staticUser = new User { Username = StaticAuthStore.Username, Password = "password", PasswordHash = StaticAuthStore.PasswordHash, Points = 0 };
			_db.Users.Add(staticUser);
			_db.SaveChanges();
		}
		userId = staticUser.Id;
	}

	var gr = new GameResult { UserId = userId, GameId = dto.GameId, Score = dto.Score, PlayedAt = DateTime.UtcNow };
	_db.GameResults.Add(gr);
	var user = _db.Users.Find(userId);
	if (user != null)
	{
		user.Points += dto.Score;
		_db.SaveChanges();
		return Ok(new { points = user.Points });
	}

	_db.SaveChanges();
	return Ok(new { points = 0 });
}
}


public record GameResultDto(int GameId, int Score);