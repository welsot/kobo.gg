using Avalonia;
using Avalonia.Controls;
using KoboGg.Services;
using Microsoft.Extensions.DependencyInjection;

namespace KoboGg.Views;

public partial class MainView : UserControl
{
    public MainView()
    {
        InitializeComponent();
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);

        var top = TopLevel.GetTopLevel(this);
        if (top is null) return;

        if (Application.Current is App app && app.Services is { } services)
        {
            services.GetRequiredService<ITopLevelAccessor>().Current = top;
        }

        var insets = top.InsetsManager;
        if (insets is not null)
        {
            ApplySafeAreaPadding(insets.SafeAreaPadding);
            insets.SafeAreaChanged += (_, args) => ApplySafeAreaPadding(args.SafeAreaPadding);
        }
    }

    private void ApplySafeAreaPadding(Thickness insets)
    {
        if (RootGrid is { } grid)
        {
            grid.Margin = insets;
        }
    }
}
