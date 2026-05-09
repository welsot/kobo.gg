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
            .AddAuthorization(options =>
            {
                options.AddPolicy(ApiTokenAuthOptions.DefaultScheme, policy =>
                    policy.RequireAuthenticatedUser());
            })
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = ApiTokenAuthOptions.DefaultScheme;
                options.DefaultChallengeScheme = ApiTokenAuthOptions.DefaultScheme;
            })
            .AddApiTokenAuth();
            
        return services;
    }
}