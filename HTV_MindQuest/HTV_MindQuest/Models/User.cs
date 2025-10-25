using System.ComponentModel.DataAnnotations;
public class User {
[Key]
public int Id { get; set; }
    [Required]
    public string Username { get; set; } = string.Empty;
[Required]
    public string Password { get; set; } 
public string PasswordHash { get; set; } = string.Empty;
public int Points { get; set; }
}