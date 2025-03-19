using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Modules.User.Models;

[Table("users")]
public class User
{
    [Key]
    [Column]
    public Guid Id { get; }

    private string _email = string.Empty;

    [Column]
    public string Email 
    {
        get => _email;
        private set => _email = value.ToLowerInvariant();
    }
    
    [Column]
    public bool IsEmailVerified { get; set; } = false;
    
    [Column]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    public User(Guid id, string email)
    {
        Id = id;
        Email = email;
    }
}