using api.Modules.Common.Services;
using api.Modules.Email.DTO;

namespace api.Modules.Email.Services;

public class Mailer(
    IEmailService emailService
)
{
    public async Task SendOneTimePasswordAsync(string email)
    {
        var oneTimePassword = RandomTokenGenerator.GenerateOneTimePassword();
        var emailModel = new UserOneTimePasswordDto { Email = email, Otp = oneTimePassword };

        await emailService.SendTemplatedEmailAsync(
            to: email,
            subject: $"Welcome to Kobo.gg! Your one-time password is {oneTimePassword}",
            templateName: "UserOneTimePassword",
            model: emailModel
        );
    }
}