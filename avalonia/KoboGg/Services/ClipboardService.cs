using System.Threading.Tasks;
using Avalonia.Input.Platform;

namespace KoboGg.Services;

public sealed class ClipboardService : IClipboardService
{
    private readonly ITopLevelAccessor _topLevel;

    public ClipboardService(ITopLevelAccessor topLevel)
    {
        _topLevel = topLevel;
    }

    public async Task SetTextAsync(string text)
    {
        var clip = _topLevel.Current?.Clipboard;
        if (clip is null) return;
        await clip.SetTextAsync(text);
    }
}
