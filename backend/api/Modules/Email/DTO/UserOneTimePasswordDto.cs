namespace api.Modules.Email.DTO;

public class UserOneTimePasswordDto
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}