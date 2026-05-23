using System;
using System.Collections.Generic;
using CommunityToolkit.Mvvm.ComponentModel;
using KoboGg.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg.ViewModels;

public sealed partial class MainWindowViewModel : ViewModelBase, INavigationService
{
    private readonly IServiceProvider _services;
    private readonly Stack<Type> _backStack = new();

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CanGoBack))]
    private ViewModelBase? _currentViewModel;

    public MainWindowViewModel(IServiceProvider services)
    {
        _services = services;
    }

    public bool CanGoBack => _backStack.Count > 0;

    public void Initialize() => ResetTo<UploadViewModel>();

    public void NavigateTo<TViewModel>() where TViewModel : ViewModelBase
    {
        if (CurrentViewModel is not null)
        {
            _backStack.Push(CurrentViewModel.GetType());
        }

        SetCurrent(typeof(TViewModel));
    }

    public void ResetTo<TViewModel>() where TViewModel : ViewModelBase
    {
        _backStack.Clear();
        SetCurrent(typeof(TViewModel));
    }

    public bool GoBack()
    {
        if (_backStack.Count == 0)
        {
            return false;
        }

        SetCurrent(_backStack.Pop());
        return true;
    }

    public void CancelActiveWork() => (CurrentViewModel as ICancelableWork)?.CancelActiveWork();

    private void SetCurrent(Type viewModelType)
    {
        var next = (ViewModelBase)_services.GetRequiredService(viewModelType);
        var previous = CurrentViewModel;
        CurrentViewModel = next;

        // Dispose the screen we just left so its CancellationTokenSource is cancelled and
        // its subscription to the shared UploadSession is detached (no leak across navigations).
        (previous as IDisposable)?.Dispose();
    }
}
