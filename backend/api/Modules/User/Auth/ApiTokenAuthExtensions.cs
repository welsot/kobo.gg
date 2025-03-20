using Microsoft.AspNetCore.Authentication;

namespace api.Modules.User.Auth;

public static class ApiTokenAuthExtensions
{
    public static AuthenticationBuilder AddApiTokenAuth(this AuthenticationBuilder builder)
    {
        return builder.AddScheme<ApiTokenAuthOptions, ApiTokenAuthHandler>(
            ApiTokenAuthOptions.DefaultScheme, 
            _ => { }
        );
    }
    
    public static IServiceCollection AddApiTokenAuth(this IServiceCollection services)
    {
        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = ApiTokenAuthOptions.DefaultScheme;
                options.DefaultChallengeScheme = ApiTokenAuthOptions.DefaultScheme;
            })
            .AddApiTokenAuth();
            
        return services;
    }
}