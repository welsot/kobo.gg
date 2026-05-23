using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Threading;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KoboGg.Api;
using KoboGg.Models;
using KoboGg.Services;

namespace KoboGg.ViewModels;

public sealed partial class ReviewViewModel : ViewModelBase, IDisposable, ICancelableWork
{
    private readonly IUploadOrchestrator _orchestrator;
    private readonly UploadSession _session;
    private readonly INavigationService _navigation;
    private readonly NotifyCollectionChangedEventHandler _onBooksChanged;
    private CancellationTokenSource _cts = new();
    private bool _disposed;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CanFinalize))]
    [NotifyPropertyChangedFor(nameof(CanGoBack))]
    private bool _isBusy;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string? _errorMessage;

    public ObservableCollection<UploadedBook> Books { get; }

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool CanFinalize => !IsBusy && Books.Count > 0;
    public bool CanGoBack => !IsBusy;

    public ReviewViewModel(
        IUploadOrchestrator orchestrator,
        UploadSession session,
        INavigationService navigation)
    {
        _orchestrator = orchestrator;
        _session = session;
        _navigation = navigation;
        Books = session.Books;
        _onBooksChanged = (_, _) =>
        {
            OnPropertyChanged(nameof(CanFinalize));
            FinalizeCommand.NotifyCanExecuteChanged();
        };
        Books.CollectionChanged += _onBooksChanged;
    }

    [RelayCommand]
    private void DismissError() => ErrorMessage = null;

    [RelayCommand]
    private void RemoveBook(UploadedBook? book)
    {
        if (book is null) return;
        Books.Remove(book);
    }

    [RelayCommand(CanExecute = nameof(CanGoBack))]
    private void Back()
    {
        _navigation.GoBack();
    }

    [RelayCommand(CanExecute = nameof(CanFinalize))]
    private async Task FinalizeAsync()
    {
        if (IsBusy) return;
        ErrorMessage = null;
        IsBusy = true;
        FinalizeCommand.NotifyCanExecuteChanged();
        BackCommand.NotifyCanExecuteChanged();

        // Capture the token: CancelActiveWork() may swap _cts mid-flight, and the catch
        // filter must test the token this operation actually ran with.
        var ct = _cts.Token;
        try
        {
            await _orchestrator.FinalizeAsync(ct);
            _navigation.NavigateTo<SuccessViewModel>();
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // silent
        }
        catch (ApiException ex)
        {
            ErrorMessage = ex.UserMessage;
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsBusy = false;
            FinalizeCommand.NotifyCanExecuteChanged();
            BackCommand.NotifyCanExecuteChanged();
        }
    }

    public void CancelActiveWork()
    {
        var previous = _cts;
        _cts = new CancellationTokenSource();
        try { previous.Cancel(); } catch { /* ignored */ }
        previous.Dispose();
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        Books.CollectionChanged -= _onBooksChanged;
        try { _cts.Cancel(); } catch { /* ignored */ }
        _cts.Dispose();
    }
}
