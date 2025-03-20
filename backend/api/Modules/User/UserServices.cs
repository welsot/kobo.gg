using api.Modules.User.Auth;
using api.Modules.User.Repository;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class UserServices
    {
        public static IServiceCollection AddUserServices(
            this IServiceCollection services
        )
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IApiTokenRepository, ApiTokenRepository>();
            services.AddScoped<IOneTimePasswordRepository, OneTimePasswordRepository>();
            
            // Add API token authentication
            services.AddApiTokenAuth();

            return services;
        }
    }
}