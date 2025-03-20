using api.Modules.Common.Data;
using api.Modules.Common.OpenApi;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CommonServices
    {
        public static IServiceCollection AddCommonServices(
            this IServiceCollection services
        )
        {
            services.AddScoped<Db>();
            
            // Add API Token to OpenAPI/Swagger
            services.AddApiTokenToOpenApi();

            return services;
        }
    }
}