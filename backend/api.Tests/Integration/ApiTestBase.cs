using System.Net.Http.Json;
using api.Data;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace api.Tests.Integration;

public abstract class ApiTestBase : IClassFixture<TestApiFactory>
{
    protected readonly TestApiFactory Factory;
    protected readonly HttpClient Client;

    protected ApiTestBase(TestApiFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }
    
    protected async Task<ApiTokenResponse> LoginUserAsync(HttpClient client)
    {
        // Create a test user
        var registrationDto = new UserRegistrationDto { Email = "test-bundle@example.com" };
        await client.PostAsJsonAsync("/api/users/register", registrationDto);

        // Get OTP from database
        var dbContext = CreateDbContext();
        var user = await dbContext.Users.FirstAsync(u => u.Email == "test-bundle@example.com");
        var otp = await dbContext.OneTimePasswords.FirstAsync(o => o.UserId == user.Id);

        // Login with the valid credentials
        var loginDto = new UserLoginDto { Email = "test-bundle@example.com", Code = otp.Code };
        var response = await client.PostAsJsonAsync("/api/users/login", loginDto);

        var result = await response.Content.ReadFromJsonAsync<ApiTokenResponse>();
        if (result == null) throw new InvalidOperationException("Failed to deserialize API token response");
        return result;
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