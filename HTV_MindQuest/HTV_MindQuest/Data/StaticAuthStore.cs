using BCrypt.Net;

public static class StaticAuthStore
{
    // Hard-coded single user used when DB is not available or you prefer a simple static login.
    // You can change Username or Password below. The password is hashed with BCrypt at startup.
    public static readonly string Username = "kid1";
    // If you want a different password, change the string here.
    private const string PlainPassword = "password";

    // Computed password hash (BCrypt) — used for verification
    public static readonly string PasswordHash = BCrypt.Net.BCrypt.HashPassword(PlainPassword);

    public static bool Validate(string username, string password)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password)) return false;
        if (!string.Equals(username, Username, System.StringComparison.Ordinal)) return false;
        return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
    }
}
