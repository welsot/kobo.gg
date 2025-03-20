namespace api.Modules.Email.DTO;

public class UserOneTimePasswordDto(string email, string otp, bool isNewUser = false)
{
    public string Email { get; private set; } = email;
    public string Otp { get; private set; } = otp;
    public bool IsNewUser { get; private set; } = isNewUser;
}