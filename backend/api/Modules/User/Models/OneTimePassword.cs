using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using api.Modules.Common.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Modules.User.Models;

[Table("one_time_password")]
public class OneTimePassword
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required]
    [Column]
    [StringLength(6)]
    public string Code { get; private set; }

    [Required]
    [ForeignKey("User")]
    public Guid UserId { get; private set; }

    [Required]
    public User User { get; private set; }

    [Required]
    public DateTimeOffset ExpiresAt { get; private set; }

    public OneTimePassword(User user)
    {
        Code = RandomTokenGenerator.GenerateOneTimePassword();
        User = user;
        ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15);
    }

    private OneTimePassword() { }

    public class Configuration : IEntityTypeConfiguration<OneTimePassword>
    {
        public void Configure(EntityTypeBuilder<OneTimePassword> builder)
        {
            builder.HasIndex(x => new { x.Code, x.UserId }).IsUnique();
        }
    }
}