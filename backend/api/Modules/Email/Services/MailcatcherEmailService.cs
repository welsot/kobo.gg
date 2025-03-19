using api.Modules.Email.Config;
using MailKit.Net.Smtp;
using MimeKit;

namespace api.Modules.Email.Services;

public class MailcatcherEmailService : EmailServiceBase
{
    private readonly MailcatcherSettings _mailcatcherSettings;

    public MailcatcherEmailService(
        IRazorViewRenderer viewRenderer,
        MailcatcherSettings settings,
        ILogger<MailcatcherEmailService> logger) 
        : base(viewRenderer, settings, logger)
    {
        _mailcatcherSettings = settings;
    }

    public override async Task SendEmailAsync(
        string to,
        string subject,
        string htmlContent,
        string textContent = "",
        string fromEmail = "",
        string fromName = "")
    {
        try
        {
            var message = new MimeMessage();
            
            message.From.Add(new MailboxAddress(
                fromName.EmptyAsNull() ?? _settings.DefaultFromName,
                fromEmail.EmptyAsNull() ?? _settings.DefaultFromEmail));
            
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlContent
            };
            
            if (!string.IsNullOrEmpty(textContent))
            {
                builder.TextBody = textContent;
            }
            
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_mailcatcherSettings.Host, _mailcatcherSettings.Port, false);
            
            // Mailcatcher doesn't need authentication
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            _logger.LogInformation("Email sent to {To} with subject {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} with subject {Subject}", to, subject);
            throw;
        }
    }
}

// Extension method for string null checks
public static class StringExtensions
{
    public static string? EmptyAsNull(this string value)
    {
        return string.IsNullOrEmpty(value) ? null : value;
    }
}