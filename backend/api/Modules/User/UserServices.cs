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

            return services;
        }
    }
}