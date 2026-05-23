using System;
using System.Collections.Generic;
using KoboGg.ViewModels;
using Xunit;

namespace KoboGg.Tests;

public class NavigationHostTests
{
    private sealed class ProbeViewModel : ViewModelBase, IDisposable, ICancelableWork
    {
        public bool Disposed { get; private set; }
        public int CancelCalls { get; private set; }
        public void Dispose() => Disposed = true;
        public void CancelActiveWork() => CancelCalls++;
    }

    // Hands out a fresh ProbeViewModel for any requested type and remembers each one,
    // so a test can observe what the navigation host did to the screens it created.
    private sealed class ProbeServiceProvider : IServiceProvider
    {
        public List<ProbeViewModel> Created { get; } = new();

        public object GetService(Type serviceType)
        {
            var vm = new ProbeViewModel();
            Created.Add(vm);
            return vm;
        }
    }

    [Fact]
    public void Navigating_forward_disposes_the_outgoing_view_model()
    {
        var sp = new ProbeServiceProvider();
        var nav = new MainWindowViewModel(sp);

        nav.NavigateTo<ProbeViewModel>();   // Created[0] is current
        nav.NavigateTo<ProbeViewModel>();   // Created[1] is current; Created[0] left behind

        Assert.True(sp.Created[0].Disposed);
        Assert.False(sp.Created[1].Disposed);
        Assert.Same(sp.Created[1], nav.CurrentViewModel);
    }

    [Fact]
    public void First_screen_is_root_and_GoBack_returns_to_previous_screen()
    {
        var sp = new ProbeServiceProvider();
        var nav = new MainWindowViewModel(sp);

        nav.NavigateTo<ProbeViewModel>();
        Assert.False(nav.CanGoBack);        // the first screen is the root

        nav.NavigateTo<ProbeViewModel>();
        Assert.True(nav.CanGoBack);

        Assert.True(nav.GoBack());
        Assert.False(nav.CanGoBack);
        Assert.False(nav.GoBack());         // nothing left to pop
    }

    [Fact]
    public void ResetTo_clears_the_back_stack()
    {
        var sp = new ProbeServiceProvider();
        var nav = new MainWindowViewModel(sp);

        nav.NavigateTo<ProbeViewModel>();
        nav.NavigateTo<ProbeViewModel>();
        Assert.True(nav.CanGoBack);

        nav.ResetTo<ProbeViewModel>();
        Assert.False(nav.CanGoBack);
    }

    [Fact]
    public void CancelActiveWork_delegates_to_the_current_screen()
    {
        var sp = new ProbeServiceProvider();
        var nav = new MainWindowViewModel(sp);
        nav.NavigateTo<ProbeViewModel>();

        nav.CancelActiveWork();

        Assert.Equal(1, sp.Created[^1].CancelCalls);
    }
}
