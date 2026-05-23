using System;
using System.Net.Http;
using KoboGg.Api;
using KoboGg.Services;
using KoboGg.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg;

/// <summary>
/// The application's composition root. Lives in the shared library (not in the Avalonia
/// <see cref="App"/>) so the container can be built and validated without bootstrapping
/// Avalonia — see <c>KoboGg.Tests.ServiceRegistrationTests</c>.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKoboGgServices(this IServiceCollection services)
    {
        services.AddSingleton<IAppConfig, AppConfig>();
        services.AddSingleton<HttpClient>(sp =>
        {
            var config = sp.GetRequiredService<IAppConfig>();
            return new HttpClient
            {
                BaseAddress = config.ApiBaseUrl,
                Timeout = TimeSpan.FromMinutes(10),
            };
        });
        services.AddSingleton<IKoboApiClient, KoboApiClient>();
        services.AddSingleton<IUploadOrchestrator, UploadOrchestrator>();
        services.AddSingleton<UploadSession>();
        services.AddSingleton<ITopLevelAccessor, TopLevelAccessor>();
        services.AddSingleton<IFilePickerService, FilePickerService>();
        services.AddSingleton<IClipboardService, ClipboardService>();

        services.AddSingleton<MainWindowViewModel>();
        services.AddSingleton<INavigationService>(sp => sp.GetRequiredService<MainWindowViewModel>());
        services.AddTransient<UploadViewModel>();
        services.AddTransient<ReviewViewModel>();
        services.AddTransient<SuccessViewModel>();

        return services;
    }
}
