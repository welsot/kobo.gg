using Foundation;
using UIKit;
using Avalonia;
using Avalonia.Controls;
using Avalonia.iOS;
using Avalonia.Media;
using KoboGg.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg.iOS;

// The UIApplicationDelegate for the application. This class is responsible for launching the 
// User Interface of the application, as well as listening (and optionally responding) to 
// application events from iOS.
[Register("AppDelegate")]
#pragma warning disable CA1711 // Identifiers should not have incorrect suffix
public partial class AppDelegate : AvaloniaAppDelegate<App>
#pragma warning restore CA1711 // Identifiers should not have incorrect suffix
{
    protected override AppBuilder CustomizeAppBuilder(AppBuilder builder)
    {
        return base.CustomizeAppBuilder(builder)
            .WithInterFont();
    }

    // Genuine backgrounding: cancel in-flight uploads so a connection that's about to drop
    // (or an OS suspend) doesn't strand a multi-MB transfer. The iOS document picker is
    // presented modally in-process and does NOT trigger this, so an active file pick is safe.
    public override void DidEnterBackground(UIApplication application)
    {
        Navigation?.CancelActiveWork();
        base.DidEnterBackground(application);
    }

    private static INavigationService? Navigation =>
        (Avalonia.Application.Current as App)?.Services?.GetService<INavigationService>();
}
