namespace Microsoft.Extensions.DependencyInjection
{
    public static class KoboServices
    {
        public static IServiceCollection AddKoboServices(
            this IServiceCollection services
        )
        {
            //services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }
    }
}