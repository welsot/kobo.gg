using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Modules.User.Models;

[Table("one_time_password")]
public class OneTimePassword
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required]
    [ForeignKey("UserId")]
    public User User { get; private set; }

    public Guid UserId { get; private set; }

    [Required]
    [StringLength(6)]
    [Column]
    public string Otp { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private OneTimePassword()
    {
    }

    public OneTimePassword(User user, string otp)
    {
        User = user;
        Otp = otp;
        CreatedAt = DateTime.UtcNow;
    }
}