using System.ComponentModel.DataAnnotations;

namespace api.Modules.User.DTOs;

public record UserLoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = null!;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; init; } = null!;
}