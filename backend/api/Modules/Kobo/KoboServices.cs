using api.Modules.Kobo.Repository;
using api.Modules.Kobo.Services;
using api.Modules.Storage.Services;

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
            
            services.AddSingleton<IKepubifyService, KepubifyService>(sp => 
            {
                string execPath = Environment.OSVersion.Platform == PlatformID.Unix ? 
                    "/usr/local/bin/kepubify" : 
                    Path.Combine(AppContext.BaseDirectory, "kepubify.exe");
                    
                var s3Service = sp.GetRequiredService<IS3Service>();
                var logger = sp.GetRequiredService<ILogger<KepubifyService>>();
                
                return new KepubifyService(execPath, s3Service, logger);
            });
            
            services.AddHostedService<PendingBookCleanupService>();

            return services;
        }
    }
}