namespace KoboGg.ViewModels;

/// <summary>
/// Implemented by view models that own cancellable in-flight work (e.g. an upload).
/// The navigation host (and, through it, the platform lifecycle) calls
/// <see cref="CancelActiveWork"/> to stop active work — for example on app
/// suspension or memory pressure — without tearing the view model down, so the
/// screen stays usable when the user returns.
/// </summary>
public interface ICancelableWork
{
    void CancelActiveWork();
}
