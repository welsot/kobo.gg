using api.Modules.Email.DTO;

namespace api.Modules.Email.Services;

public class Mailer(
    IEmailService emailService
)
{
    public async Task SendOneTimePasswordAsync(string email, string otp)
    {
        var emailModel = new UserOneTimePasswordDto { Email = email, Otp = otp };

        await emailService.SendTemplatedEmailAsync(
            to: email,
            subject: $"Welcome to Kobo.gg! Your one-time password is {otp}",
            templateName: "UserOneTimePassword",
            model: emailModel
        );
    }
}