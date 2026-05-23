using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.Runtime;
using Avalonia.Android;
using KoboGg.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg.Android;

[Activity(
    Label = "kobo.gg",
    Theme = "@style/MyTheme.NoActionBar",
    Icon = "@drawable/icon",
    MainLauncher = true,
    ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.UiMode)]
public class MainActivity : AvaloniaMainActivity
{
    // System/hardware back button: navigate within the app instead of exiting. Only fall
    // through to the default behaviour (exit) when we're already on the root screen.
    public override void OnBackPressed()
    {
        if (Navigation is { CanGoBack: true } navigation)
        {
            navigation.GoBack();
            return;
        }

        // CA1416: Avalonia annotates OnBackPressed() as supported on API 24+, but minSdk is 23.
        // Activity.OnBackPressed() itself exists since API 1, so the default (exit) behaviour is
        // safe on 23. CA1422: the method is obsoleted on API 33+, but it remains the right hook
        // for minSdk 23 (OnBackPressedDispatcher is only on the framework Activity from API 33).
#pragma warning disable CA1416, CA1422
        base.OnBackPressed();
#pragma warning restore CA1416, CA1422
    }

    // Memory pressure: the OS is signalling it may reclaim this (likely backgrounded) app.
    // Cancel in-flight uploads so we don't burn battery/data on work that's about to die.
    // We intentionally do NOT cancel on OnPause/OnStop — the Storage Access Framework file
    // picker pauses this activity, and cancelling there would abort an in-progress file pick.
    public override void OnTrimMemory([GeneratedEnum] TrimMemory level)
    {
        base.OnTrimMemory(level);
        if (level is TrimMemory.RunningCritical or TrimMemory.Complete)
        {
            Navigation?.CancelActiveWork();
        }
    }

    private static INavigationService? Navigation =>
        (Avalonia.Application.Current as App)?.Services?.GetService<INavigationService>();
}
