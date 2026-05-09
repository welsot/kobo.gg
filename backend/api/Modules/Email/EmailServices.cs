using api.Modules.Email.Config;
using api.Modules.Email.Services;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Microsoft.Extensions.DependencyInjection;

public static class EmailServices
{
    public static IServiceCollection AddEmailServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IRazorViewRenderer, RazorViewRenderer>();
        
        services.Configure<EmailSettings>(configuration.GetSection("Email:Settings"));
        services.Configure<MailcatcherSettings>(configuration.GetSection("Email:Mailcatcher"));
        services.Configure<BrevoSettings>(configuration.GetSection("Email:Brevo"));
        
        // Register appropriate email service based on environment
        if (IsProduction(configuration))
        {
            services.AddHttpClient();
            services.AddScoped<IEmailService>(provider => {
                var settings = new BrevoSettings();
                configuration.GetSection("Email:Brevo").Bind(settings);
                
                return new BrevoEmailService(
                    provider.GetRequiredService<IRazorViewRenderer>(),
                    settings,
                    provider.GetRequiredService<ILogger<BrevoEmailService>>(),
                    provider.GetRequiredService<HttpClient>());
            });
        }
        else
        {
            services.AddScoped<IEmailService>(provider => {
                var settings = new MailcatcherSettings();
                configuration.GetSection("Email:Mailcatcher").Bind(settings);
                
                return new MailcatcherEmailService(
                    provider.GetRequiredService<IRazorViewRenderer>(),
                    settings,
                    provider.GetRequiredService<ILogger<MailcatcherEmailService>>());
            });
        }
        
        // The most high-level service that should be used to send emails:
        services.AddScoped<Mailer>();
        
        return services;
    }
    
    private static bool IsProduction(IConfiguration configuration)
    {
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] 
                          ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") 
                          ?? "Development";
        
        return environment.Equals("Production", StringComparison.OrdinalIgnoreCase);
    }
}