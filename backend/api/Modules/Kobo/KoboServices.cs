using api.Modules.Kobo.Repository;
using api.Modules.Kobo.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class KoboServices
    {
        public static IServiceCollection AddKoboServices(
            this IServiceCollection services
        )
        {
            services.AddScoped<ITmpBookBundleRepository, TmpBookBundleRepository>();
            services.AddScoped<IPendingBookRepository, PendingBookRepository>();
            services.AddScoped<TmpBookBundleCreator>();
            services.AddScoped<TmpBookBundleMapper>();
            services.AddHostedService<PendingBookCleanupService>();

            return services;
        }
    }
}