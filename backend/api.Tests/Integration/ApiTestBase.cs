using System.Net.Http.Json;
using api.Data;
using Microsoft.Extensions.DependencyInjection;

namespace api.Tests.Integration;

public abstract class ApiTestBase : IClassFixture<TestApiFactory>, IAsyncLifetime
{
    protected readonly TestApiFactory Factory;
    protected readonly HttpClient Client;

    protected ApiTestBase(TestApiFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    public virtual async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public virtual Task DisposeAsync() => Task.CompletedTask;

    protected async Task<T?> GetJsonAsync<T>(string url)
    {
        return await Client.GetFromJsonAsync<T>(url);
    }

    protected async Task<HttpResponseMessage> PostJsonAsync<T>(string url, T data)
    {
        return await Client.PostAsJsonAsync(url, data);
    }

    protected ApplicationDbContext CreateDbContext()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }
}