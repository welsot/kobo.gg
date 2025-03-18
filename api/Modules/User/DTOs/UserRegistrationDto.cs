using System.ComponentModel.DataAnnotations;

namespace api.Modules.User.DTOs;

public class UserRegistrationDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}