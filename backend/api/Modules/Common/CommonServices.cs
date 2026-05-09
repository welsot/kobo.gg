using api.Modules.Common.Data;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CommonServices
    {
        public static IServiceCollection AddCommonServices(
            this IServiceCollection services
        )
        {
            services.AddScoped<Db>();
            return services;
        }
    }
}