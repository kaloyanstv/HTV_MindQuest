public static class SeedData {
public static void Seed(AppDbContext db) {
if (!db.Games.Any()) {
db.Games.AddRange(new Game { Key = "math_race", Title = "Math Race", Description = "Fast math questions" },
new Game { Key = "word_scramble", Title = "Word Scramble", Description = "Unscramble words" });
db.SaveChanges();
}


if (!db.Users.Any()) {
	// Seed a default user. The application uses PasswordHash (BCrypt) for login verification.
	// Keep the plain Password for compatibility (e.g. UI/tests), but ensure PasswordHash is set.
	db.Users.Add(new User {
		Username = "kid1",
		Password = "password",
		PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
		Points = 0
	});
	db.SaveChanges();
}
else
{
	// If users exist but some lack a PasswordHash (seeded earlier without hashing), hash their plain Password now.
	var usersToUpdate = db.Users.Where(u => string.IsNullOrEmpty(u.PasswordHash) && !string.IsNullOrEmpty(u.Password)).ToList();
	if (usersToUpdate.Any())
	{
		foreach (var u in usersToUpdate)
		{
			u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(u.Password);
		}
		db.SaveChanges();
	}
}
}
}