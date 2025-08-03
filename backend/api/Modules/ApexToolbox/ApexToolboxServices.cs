using api.Modules.ApexToolbox.Config;
using api.Modules.ApexToolbox.Middleware;
using api.Modules.ApexToolbox.Services;

namespace api.Modules.ApexToolbox;

public static class ApexToolboxServices
{
    public static IServiceCollection AddApexToolboxServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure ApexToolbox settings
        services.Configure<ApexToolboxSettings>(options =>
        {
            options.Token = Environment.GetEnvironmentVariable("APEXTOOLBOX_TOKEN") ?? "";
            options.Enabled = !string.IsNullOrEmpty(options.Token);
            options.EndpointUrl = "https://apextoolbox.com/api/v1/logs";
            options.TimeoutSeconds = 1;
            
            // Log configuration at startup
            Console.WriteLine($"ApexToolbox Configuration: Enabled={options.Enabled}, HasToken={!string.IsNullOrEmpty(options.Token)}, Endpoint={options.EndpointUrl}");
        });

        // Register HTTP client for ApexToolbox logger
        services.AddHttpClient<IApexToolboxLogger, ApexToolboxLogger>();

        // Register ApexToolbox logger service
        services.AddScoped<IApexToolboxLogger, ApexToolboxLogger>();

        // Add HTTP context accessor for log correlation
        services.AddHttpContextAccessor();

        // Register custom logger provider
        services.AddSingleton<ILoggerProvider, ApexToolboxLoggerProvider>();

        return services;
    }

    public static IApplicationBuilder UseApexToolboxLogging(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ApexToolboxMiddleware>();
    }
}