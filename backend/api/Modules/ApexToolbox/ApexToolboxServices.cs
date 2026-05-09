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
            // Read from configuration (includes .env via DotNetEnv and appsettings.json)
            configuration.GetSection("ApexToolbox").Bind(options);
            
            // Override token from environment variable if not set in config
            if (string.IsNullOrEmpty(options.Token))
            {
                options.Token = Environment.GetEnvironmentVariable("APEXTOOLBOX_TOKEN") ?? "";
            }
            
            // Auto-enable if token is present
            if (!string.IsNullOrEmpty(options.Token))
            {
                options.Enabled = true;
            }
            
            // Set defaults
            if (string.IsNullOrEmpty(options.EndpointUrl))
            {
                options.EndpointUrl = "https://apextoolbox.com/api/v1/logs";
            }
            if (options.TimeoutSeconds == 0)
            {
                options.TimeoutSeconds = 1;
            }
            
            // Log configuration at startup
            Console.WriteLine($"ApexToolbox Configuration: Enabled={options.Enabled}, HasToken={!string.IsNullOrEmpty(options.Token)}, Endpoint={options.EndpointUrl}");
        });

        // Register HTTP client factory
        services.AddHttpClient();

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