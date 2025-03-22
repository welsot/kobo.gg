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
            services.AddScoped<IBookRepository, BookRepository>();

            services.AddScoped<TmpBookBundleCreator>();
            services.AddScoped<TmpBookBundleMapper>();
            services.AddScoped<BookConverter>();

            services.AddSingleton<KepubifyService>(sp =>
            {
                string execPath = Environment.OSVersion.Platform == PlatformID.Unix
                    ? "/usr/local/bin/kepubify"
                    : Path.Combine(AppContext.BaseDirectory, "kepubify.exe");

                var logger = sp.GetRequiredService<ILogger<KepubifyService>>();
                return new KepubifyService(execPath, logger);
            });

            services.AddScoped<EpubConverter>();

            services.AddHostedService<PendingBookCleanupService>();
            services.AddHostedService<TmpBookBundleCleanupService>();

            return services;
        }
    }
}