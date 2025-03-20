using api.Modules.Email.Config;

namespace api.Modules.Email.Services;

public abstract class EmailServiceBase(
    IRazorViewRenderer viewRenderer,
    EmailSettings settings,
    ILogger<EmailServiceBase> logger
) : IEmailService
{
    protected readonly IRazorViewRenderer _viewRenderer = viewRenderer;
    protected readonly EmailSettings _settings = settings;
    protected readonly ILogger<EmailServiceBase> _logger = logger;

    public abstract Task SendEmailAsync(
        string to,
        string subject,
        string htmlContent,
        string textContent = "",
        string fromEmail = "",
        string fromName = "");

    public async Task SendTemplatedEmailAsync<T>(
        string to,
        string subject,
        string templateName,
        T dto,
        string fromEmail = "",
        string fromName = "")
    {
        try
        {
            string htmlContent = await _viewRenderer.RenderViewToStringAsync(templateName, dto);
            await SendEmailAsync(to, subject, htmlContent, "", fromEmail, fromName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send templated email {TemplateName} to {To}", templateName, to);
            throw;
        }
    }
}