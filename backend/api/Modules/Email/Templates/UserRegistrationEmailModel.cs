namespace api.Modules.Email.Templates;

public class UserRegistrationEmailModel
{
    public string Email { get; set; } = string.Empty;
    public string VerificationLink { get; set; } = string.Empty;
}