using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Threading;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KoboGg.Api;
using KoboGg.Services;

namespace KoboGg.ViewModels;

public sealed partial class UploadViewModel : ViewModelBase, IDisposable, ICancelableWork
{
    private readonly IFilePickerService _picker;
    private readonly IUploadOrchestrator _orchestrator;
    private readonly UploadSession _session;
    private readonly INavigationService _navigation;
    private readonly NotifyCollectionChangedEventHandler _onBooksChanged;

    private CancellationTokenSource _cts = new();
    private bool _disposed;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CanPick))]
    [NotifyPropertyChangedFor(nameof(CanContinue))]
    private bool _isBusy;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string? _errorMessage;

    public ObservableCollection<UploadItemViewModel> Items { get; } = new();

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool CanPick => !IsBusy;
    public bool CanContinue => !IsBusy && _session.Books.Count > 0;
    public bool HasItems => Items.Count > 0;

    public UploadViewModel(
        IFilePickerService picker,
        IUploadOrchestrator orchestrator,
        UploadSession session,
        INavigationService navigation)
    {
        _picker = picker;
        _orchestrator = orchestrator;
        _session = session;
        _navigation = navigation;

        // Rehydrate UI list from already-uploaded books (e.g. when the user navigates back).
        foreach (var book in _session.Books)
        {
            Items.Add(new UploadItemViewModel
            {
                FileName = book.FileName,
                SizeBytes = book.SizeBytes,
                Status = UploadItemStatus.Uploaded,
                BookId = book.Id,
                Progress = 1.0,
            });
        }

        _onBooksChanged = (_, _) =>
        {
            OnPropertyChanged(nameof(CanContinue));
            ContinueCommand.NotifyCanExecuteChanged();
        };
        _session.Books.CollectionChanged += _onBooksChanged;
        Items.CollectionChanged += (_, _) => OnPropertyChanged(nameof(HasItems));
    }

    [RelayCommand]
    private void DismissError() => ErrorMessage = null;

    [RelayCommand]
    private async Task ChooseFilesAsync()
    {
        if (IsBusy) return;

        ErrorMessage = null;
        IsBusy = true;
        ChooseFilesCommand.NotifyCanExecuteChanged();
        ContinueCommand.NotifyCanExecuteChanged();

        var ct = _cts.Token;
        try
        {
            var picked = await _picker.PickBooksAsync(ct);
            if (picked.Count == 0) return;

            foreach (var file in picked)
            {
                ct.ThrowIfCancellationRequested();

                var item = new UploadItemViewModel
                {
                    FileName = file.Name,
                    SizeBytes = file.Length,
                    Status = UploadItemStatus.Uploading,
                    Progress = 0,
                };
                Items.Add(item);

                var progress = new Progress<double>(p => item.Progress = p);
                try
                {
                    var uploaded = await _orchestrator.UploadAsync(file, progress, ct);
                    item.BookId = uploaded.Id;
                    item.Status = UploadItemStatus.Uploaded;
                    item.Progress = 1.0;
                    _session.Books.Add(uploaded);
                }
                catch (OperationCanceledException) when (ct.IsCancellationRequested)
                {
                    Items.Remove(item);
                    throw;
                }
                catch (UnsupportedFileException ex)
                {
                    item.Status = UploadItemStatus.Failed;
                    item.ErrorMessage = ex.Message;
                    ErrorMessage = ex.Message;
                }
                catch (ApiException ex)
                {
                    item.Status = UploadItemStatus.Failed;
                    item.ErrorMessage = ex.UserMessage;
                    ErrorMessage = $"Couldn't upload \"{file.Name}\": {ex.UserMessage}";
                }
                catch (Exception ex)
                {
                    item.Status = UploadItemStatus.Failed;
                    item.ErrorMessage = ex.Message;
                    ErrorMessage = $"Couldn't upload \"{file.Name}\": {ex.Message}";
                }
            }
        }
        catch (OperationCanceledException)
        {
            // User-initiated cancellation: silent.
        }
        catch (UnsupportedFileException ex)
        {
            ErrorMessage = ex.Message;
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
            ChooseFilesCommand.NotifyCanExecuteChanged();
            ContinueCommand.NotifyCanExecuteChanged();
        }
    }

    [RelayCommand]
    private void RemoveItem(UploadItemViewModel? item)
    {
        if (item is null) return;
        Items.Remove(item);
        if (item.BookId is { } id)
        {
            for (int i = _session.Books.Count - 1; i >= 0; i--)
            {
                if (_session.Books[i].Id == id)
                {
                    _session.Books.RemoveAt(i);
                    break;
                }
            }
        }
    }

    [RelayCommand(CanExecute = nameof(CanContinue))]
    private void Continue()
    {
        _navigation.NavigateTo<ReviewViewModel>();
    }

    public void CancelActiveWork()
    {
        // Cancel the in-flight pick/upload but keep the screen usable: swap in a fresh
        // token source so a subsequent pick (after the user returns) isn't born cancelled.
        var previous = _cts;
        _cts = new CancellationTokenSource();
        try { previous.Cancel(); } catch { /* ignored */ }
        previous.Dispose();
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        _session.Books.CollectionChanged -= _onBooksChanged;
        try { _cts.Cancel(); } catch { /* ignored */ }
        _cts.Dispose();
    }
}
