using api.Modules.Email.Config;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace api.Modules.Email.Services;

public class BrevoEmailService : EmailServiceBase
{
    private readonly BrevoSettings _brevoSettings;
    private readonly HttpClient _httpClient;

    public BrevoEmailService(
        IRazorViewRenderer viewRenderer,
        BrevoSettings settings,
        ILogger<BrevoEmailService> logger,
        HttpClient httpClient) 
        : base(viewRenderer, settings, logger)
    {
        _brevoSettings = settings;
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.brevo.com/v3/");
        _httpClient.DefaultRequestHeaders.Add("api-key", _brevoSettings.ApiKey);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
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
            var email = new
            {
                sender = new
                {
                    name = fromName.EmptyAsNull() ?? _settings.DefaultFromName,
                    email = fromEmail.EmptyAsNull() ?? _settings.DefaultFromEmail
                },
                to = new[]
                {
                    new { email = to }
                },
                subject = subject,
                htmlContent = htmlContent,
                textContent = string.IsNullOrEmpty(textContent) ? null : textContent
            };

            var content = new StringContent(
                JsonSerializer.Serialize(email),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync("smtp/email", content);
            response.EnsureSuccessStatusCode();
            
            _logger.LogInformation("Email sent via Brevo to {To} with subject {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via Brevo to {To} with subject {Subject}", to, subject);
            throw;
        }
    }
}