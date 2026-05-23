using System.Linq;
using KoboGg;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace KoboGg.Tests;

/// <summary>
/// Guards the composition root (<see cref="ServiceCollectionExtensions.AddKoboGgServices"/>).
/// Runs in milliseconds with no Avalonia/Android bootstrap, yet catches the entire class of
/// "registered a service whose dependency isn't registered" bugs that otherwise only surface
/// as a runtime <see cref="System.InvalidOperationException"/> the first time the app navigates.
/// </summary>
public class ServiceRegistrationTests
{
    [Fact]
    public void Container_builds_with_validation_and_resolves_every_registered_service()
    {
        var services = new ServiceCollection().AddKoboGgServices();

        // ValidateOnBuild verifies every constructor's dependencies are registered;
        // ValidateScopes catches captive/scoped-from-root mistakes.
        using var provider = services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateOnBuild = true,
            ValidateScopes = true,
        });

        // ValidateOnBuild doesn't run factory delegates (HttpClient, INavigationService),
        // so resolve every distinct service type to exercise those code paths too.
        foreach (var serviceType in services.Select(d => d.ServiceType).Distinct())
        {
            var instance = provider.GetService(serviceType);
            Assert.NotNull(instance);
        }
    }
}
