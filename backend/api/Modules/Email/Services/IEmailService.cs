namespace api.Modules.Email.Services;

public interface IEmailService
{
    Task SendEmailAsync(
        string to, 
        string subject, 
        string htmlContent, 
        string textContent = "",
        string fromEmail = "",
        string fromName = "");
    
    Task SendTemplatedEmailAsync<T>(
        string to,
        string subject,
        string templateName,
        T model,
        string fromEmail = "",
        string fromName = "");
}