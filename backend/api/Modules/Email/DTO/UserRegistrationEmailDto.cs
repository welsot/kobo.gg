namespace api.Modules.Email.DTO;

public class UserRegistrationEmailDto
{
    public string Email { get; set; } = string.Empty;
    public string VerificationLink { get; set; } = string.Empty;
}