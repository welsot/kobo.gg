using KoboGg.ViewModels;

namespace KoboGg.Services;

public interface INavigationService
{
    /// <summary>Whether there is a previous screen to return to.</summary>
    bool CanGoBack { get; }

    /// <summary>Navigate forward to a screen, pushing the current one onto the back stack.</summary>
    void NavigateTo<TViewModel>() where TViewModel : ViewModelBase;

    /// <summary>Navigate to a screen as the new root, clearing the back stack.</summary>
    void ResetTo<TViewModel>() where TViewModel : ViewModelBase;

    /// <summary>Navigate to the previous screen. Returns false if already at the root.</summary>
    bool GoBack();

    /// <summary>Cancel any in-flight work on the current screen (e.g. on app suspension).</summary>
    void CancelActiveWork();
}
