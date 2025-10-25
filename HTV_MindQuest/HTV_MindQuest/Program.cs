using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();  // serves index.html by default
app.UseStaticFiles();   // serves JS/CSS files

// In-memory score storage
var scores = new ConcurrentDictionary<string, int>();

// Endpoint to submit score
app.MapPost("/submit-score", async (HttpContext context) =>
{
    var gameScore = await context.Request.ReadFromJsonAsync<GameScore>();
    if (gameScore == null || string.IsNullOrWhiteSpace(gameScore.Username))
        return Results.BadRequest(new { message = "Invalid username" });

    scores.AddOrUpdate(gameScore.Username, gameScore.Points, (_, old) => old + gameScore.Points);
    return Results.Ok(new { username = gameScore.Username, totalScore = scores[gameScore.Username] });
});

app.Run();

record GameScore(string Username, int Points);



