using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Models;

[Table("users")]
[Index(nameof(Email), IsUnique = true)]
public class User
{
    [Key]
    [Column]
    public Guid Id { get; private set; }

    private string _email = string.Empty;

    [StringLength(255)]
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
    
    public virtual ICollection<OneTimePassword> OneTimePasswords { get; private set; } = new List<OneTimePassword>();
    
    public virtual ICollection<ApiToken> ApiTokens { get; private set; } = new List<ApiToken>();
    
    private User() { }
    
    public User(Guid id, string email)
    {
        Id = id;
        Email = email;
    }
}