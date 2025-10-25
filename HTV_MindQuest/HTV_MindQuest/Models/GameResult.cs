using System.ComponentModel.DataAnnotations;
public class GameResult {
[Key]
public int Id { get; set; }
public int UserId { get; set; }
public int GameId { get; set; }
public int Score { get; set; }
public DateTime PlayedAt { get; set; }
}