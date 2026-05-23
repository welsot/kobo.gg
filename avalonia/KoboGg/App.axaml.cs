using System;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using KoboGg.ViewModels;
using KoboGg.Views;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg;

public partial class App : Application
{
    public IServiceProvider? Services { get; private set; }

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        Services = BuildServices();

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            var mainVm = Services.GetRequiredService<MainWindowViewModel>();
            mainVm.Initialize();
            desktop.MainWindow = new MainWindow { DataContext = mainVm };
        }
        else if (ApplicationLifetime is IActivityApplicationLifetime activityLifetime)
        {
            activityLifetime.MainViewFactory = () =>
            {
                var vm = Services!.GetRequiredService<MainWindowViewModel>();
                vm.Initialize();
                return new MainView { DataContext = vm };
            };
        }
        else if (ApplicationLifetime is ISingleViewApplicationLifetime singleView)
        {
            var vm = Services.GetRequiredService<MainWindowViewModel>();
            vm.Initialize();
            singleView.MainView = new MainView { DataContext = vm };
        }

        base.OnFrameworkInitializationCompleted();
    }

    private static IServiceProvider BuildServices() =>
        new ServiceCollection()
            .AddKoboGgServices()
            .BuildServiceProvider();
}
