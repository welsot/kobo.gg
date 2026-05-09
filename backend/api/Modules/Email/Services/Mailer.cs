using api.Modules.Email.DTO;

namespace api.Modules.Email.Services;

public class Mailer(
    IEmailService emailService
)
{
    public async Task SendOneTimePasswordAsync(UserOneTimePasswordDto dto)
    {
        var subject = dto.IsNewUser ? "Welcome to Kobo.gg!" : $"Kobo.gg - your one-time password is {dto.Otp}";

        await emailService.SendTemplatedEmailAsync(
            to: dto.Email,
            subject: subject,
            templateName: "UserOneTimePassword",
            dto: dto
        );
    }
}