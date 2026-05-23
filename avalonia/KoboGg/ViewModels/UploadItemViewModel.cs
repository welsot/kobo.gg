using System;
using CommunityToolkit.Mvvm.ComponentModel;

namespace KoboGg.ViewModels;

public enum UploadItemStatus
{
    Pending,
    Uploading,
    Uploaded,
    Failed,
}

public sealed partial class UploadItemViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _fileName = string.Empty;

    [ObservableProperty]
    private long _sizeBytes;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsUploading))]
    [NotifyPropertyChangedFor(nameof(IsUploaded))]
    [NotifyPropertyChangedFor(nameof(IsFailed))]
    private UploadItemStatus _status;

    [ObservableProperty]
    private double _progress;

    [ObservableProperty]
    private string? _errorMessage;

    public Guid? BookId { get; set; }

    public bool IsUploading => Status == UploadItemStatus.Uploading;
    public bool IsUploaded => Status == UploadItemStatus.Uploaded;
    public bool IsFailed => Status == UploadItemStatus.Failed;

    public string SizeDisplay
    {
        get
        {
            var bytes = SizeBytes;
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024d:0.#} KB";
            return $"{bytes / (1024d * 1024d):0.#} MB";
        }
    }

    partial void OnSizeBytesChanged(long value) => OnPropertyChanged(nameof(SizeDisplay));
}
