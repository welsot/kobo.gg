using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KoboGg.Services;

namespace KoboGg.ViewModels;

public sealed partial class SuccessViewModel : ViewModelBase
{
    private readonly IClipboardService _clipboard;
    private readonly IUploadOrchestrator _orchestrator;
    private readonly UploadSession _session;
    private readonly INavigationService _navigation;
    private readonly IAppConfig _config;

    [ObservableProperty]
    private string _shortCode = string.Empty;

    [ObservableProperty]
    private string _shortUrl = string.Empty;

    [ObservableProperty]
    private string? _toast;

    public SuccessViewModel(
        IClipboardService clipboard,
        IUploadOrchestrator orchestrator,
        UploadSession session,
        INavigationService navigation,
        IAppConfig config)
    {
        _clipboard = clipboard;
        _orchestrator = orchestrator;
        _session = session;
        _navigation = navigation;
        _config = config;

        var bundle = _orchestrator.CurrentBundle;
        if (bundle is not null)
        {
            ShortCode = bundle.ShortUrlCode;
            ShortUrl = $"{_config.ShortUrlHost}/{bundle.ShortUrlCode}";
        }
    }

    [RelayCommand]
    private async Task CopyCodeAsync()
    {
        if (string.IsNullOrEmpty(ShortCode)) return;
        await _clipboard.SetTextAsync(ShortCode);
        await ShowToastAsync("Code copied");
    }

    [RelayCommand]
    private async Task CopyUrlAsync()
    {
        if (string.IsNullOrEmpty(ShortUrl)) return;
        await _clipboard.SetTextAsync(ShortUrl);
        await ShowToastAsync("URL copied");
    }

    [RelayCommand]
    private void SendMoreBooks()
    {
        _session.Clear();
        _orchestrator.Reset();
        // Start a fresh flow: Upload becomes the root again, so a back press here exits
        // the app rather than returning to the finalized Review/Success screens.
        _navigation.ResetTo<UploadViewModel>();
    }

    private async Task ShowToastAsync(string message)
    {
        Toast = message;
        await Task.Delay(2000);
        if (Toast == message) Toast = null;
    }
}
