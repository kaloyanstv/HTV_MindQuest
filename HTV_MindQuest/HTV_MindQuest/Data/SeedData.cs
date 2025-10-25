public static class SeedData {
public static void Seed(AppDbContext db) {
if (!db.Games.Any()) {
db.Games.AddRange(new Game { Key = "math_race", Title = "Math Race", Description = "Fast math questions" },
new Game { Key = "word_scramble", Title = "Word Scramble", Description = "Unscramble words" });
db.SaveChanges();
}


if (!db.Users.Any()) {
db.Users.Add(new User { Username = "kid1", Password = "password", Points = 0 });
db.SaveChanges();
}
}
}