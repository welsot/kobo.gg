using Avalonia.Controls;

namespace KoboGg.Services;

public interface ITopLevelAccessor
{
    TopLevel? Current { get; set; }
}

public sealed class TopLevelAccessor : ITopLevelAccessor
{
    public TopLevel? Current { get; set; }
}
