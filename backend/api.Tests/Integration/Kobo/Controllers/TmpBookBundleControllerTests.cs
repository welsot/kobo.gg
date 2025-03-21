using System.Net;
using System.Text.Json;

using api.Modules.Kobo.DTOs;

using Microsoft.EntityFrameworkCore;

namespace api.Tests.Integration.Kobo.Controllers;

public class TmpBookBundleControllerTests : ApiTestBase
{
    public TmpBookBundleControllerTests(TestApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Create_ReturnsCreatedWithGuid_WhenValid()
    {
        // Arrange
        var loginResponse = await LoginUserAsync(Client);
        Client.DefaultRequestHeaders.Add("X-API-TOKEN", loginResponse.Token);

        // Act
        var response = await Client.PostAsync("/api/kobo/bundles", null);
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TmpBookBundleDto>(
            responseContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.NotEmpty(result.ShortUrlCode);

        // Verify in database
        var dbContext = CreateDbContext();
        var bundle = await dbContext.TmpBookBundles.FirstOrDefaultAsync(b => b.Id == result.Id);

        Assert.NotNull(bundle);
        Assert.Equal(result.ShortUrlCode, bundle.ShortUrlCode);
    }

    [Fact]
    public async Task Create_CreatesUniqueShortUrlCodes_ForMultipleBundles()
    {
        // Arrange
        var loginResponse = await LoginUserAsync(Client);
        Client.DefaultRequestHeaders.Add("X-API-TOKEN", loginResponse.Token);

        // Act - Create first bundle
        var response1 = await Client.PostAsync("/api/kobo/bundles", null);
        var responseContent1 = await response1.Content.ReadAsStringAsync();
        var result1 = JsonSerializer.Deserialize<TmpBookBundleDto>(
            responseContent1,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        // Create second bundle
        var response2 = await Client.PostAsync("/api/kobo/bundles", null);
        var responseContent2 = await response2.Content.ReadAsStringAsync();
        var result2 = JsonSerializer.Deserialize<TmpBookBundleDto>(
            responseContent2,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        // Assert
        Assert.Equal(HttpStatusCode.Created, response1.StatusCode);
        Assert.Equal(HttpStatusCode.Created, response2.StatusCode);
        Assert.NotNull(result1);
        Assert.NotNull(result2);
        Assert.NotEqual(result1?.ShortUrlCode, result2?.ShortUrlCode);

        // Verify in database
        Assert.NotNull(result1);
        Assert.NotNull(result2);
        var id1 = result1!.Id;
        var id2 = result2!.Id;

        var dbContext = CreateDbContext();
        var bundle1 = await dbContext.TmpBookBundles.FirstOrDefaultAsync(b => b.Id == id1);
        var bundle2 = await dbContext.TmpBookBundles.FirstOrDefaultAsync(b => b.Id == id2);

        Assert.NotNull(bundle1);
        Assert.NotNull(bundle2);
        Assert.NotEqual(bundle1!.ShortUrlCode, bundle2!.ShortUrlCode);
    }
}