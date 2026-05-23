using System.Threading.Tasks;

namespace KoboGg.Services;

public interface IClipboardService
{
    Task SetTextAsync(string text);
}
