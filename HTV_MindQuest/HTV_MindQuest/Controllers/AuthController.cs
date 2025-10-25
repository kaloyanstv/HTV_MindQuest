using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

// Make sure your namespace matches your project name
namespace HTV_MindQuest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ✅ POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Registration is disabled when using static in-file credentials.
            // If you want to allow registrations into the DB, remove this check.
            return BadRequest("Registration is disabled for this build. Use the static credentials or enable DB registration.");
        }

        // ✅ POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // First try DB lookup (if DB exists and contains the user)
            User? user = null;
            try
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            }
            catch
            {
                // If DB isn't available or query fails, we'll fall back to static auth below.
                user = null;
            }

            if (user != null)
            {
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                if (!isPasswordValid)
                    return Unauthorized("Invalid username or password");

                var token = GenerateJwtToken(user);
                return Ok(new { token });
            }

            // Fallback: validate against static in-file credentials
            if (StaticAuthStore.Validate(dto.Username, dto.Password))
            {
                // Create a minimal User object for token generation (Id = 0 indicates static user)
                var staticUser = new User { Id = 0, Username = StaticAuthStore.Username };
                var token = GenerateJwtToken(staticUser);
                return Ok(new { token });
            }

            return Unauthorized("Invalid username or password");
        }

        // ✅ Token generator
        private string GenerateJwtToken(User user)
        {
            var key = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
                throw new Exception("JWT key missing in appsettings.json");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // ✅ DTO classes for request bodies
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
