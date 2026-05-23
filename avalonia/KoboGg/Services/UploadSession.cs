using System.Collections.ObjectModel;
using KoboGg.Models;

namespace KoboGg.Services;

public sealed class UploadSession
{
    public ObservableCollection<UploadedBook> Books { get; } = new();

    public void Clear() => Books.Clear();
}
