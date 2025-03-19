using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Models;

[Table("api_token")]
[Index(nameof(Token), IsUnique = true)]
public class ApiToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required]
    [StringLength(24)]
    [Column]
    public string Token { get; private set; }

    [Required]
    [ForeignKey("UserId")]
    public User User { get; private set; }
    public Guid UserId { get; private set; }

    public DateTime CreatedAt { get; private set; }
    
    private ApiToken() { }

    public ApiToken(User user)
    {
        User = user;
        Token = GenerateRandomToken();
        CreatedAt = DateTime.UtcNow;
    }

    private static string GenerateRandomToken()
    {
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var tokenData = new byte[16];
        rng.GetBytes(tokenData);
        return Convert.ToBase64String(tokenData);
    }
}