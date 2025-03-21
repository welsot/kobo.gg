using api.Modules.Common.DTO;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Models;
using api.Tests.Integration;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Xunit;

namespace api.Tests.Integration.Kobo.Controllers;

public class TmpBookBundleControllerTests : ApiTestBase
{
    [Fact]
    public async Task Create_ReturnsCreatedWithGuid_WhenValid()
    {
        // Arrange
        var factory = new TestApiFactory();
        var client = factory.CreateClient();
        
        // First, login to get token
        var loginResponse = await LoginUserAsync(client);
        var apiToken = loginResponse.Token;
        
        client.DefaultRequestHeaders.Add("X-API-TOKEN", apiToken);
        
        var dto = new TmpBookBundleDto
        {
            ShortUrlCode = "test123"
        };
        
        var content = new StringContent(
            JsonConvert.SerializeObject(dto),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await client.PostAsync("/api/kobo/bundles", content);
        var responseString = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<GuidResponse>(responseString);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotEqual(Guid.Empty, result.Id);
        
        // Verify in database
        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var bundle = await dbContext.TmpBookBundles.FirstOrDefaultAsync(b => b.Id == result.Id);
        
        Assert.NotNull(bundle);
        Assert.Equal("test123", bundle.ShortUrlCode);
    }
    
    [Fact]
    public async Task Create_ReturnsConflict_WhenShortUrlCodeExists()
    {
        // Arrange
        var factory = new TestApiFactory();
        var client = factory.CreateClient();
        
        // Create first bundle
        var loginResponse = await LoginUserAsync(client);
        var apiToken = loginResponse.Token;
        
        client.DefaultRequestHeaders.Add("X-API-TOKEN", apiToken);
        
        var dto = new TmpBookBundleDto
        {
            ShortUrlCode = "duplicate"
        };
        
        var content = new StringContent(
            JsonConvert.SerializeObject(dto),
            Encoding.UTF8,
            "application/json");
            
        await client.PostAsync("/api/kobo/bundles", content);
        
        // Try to create second bundle with same code
        var secondContent = new StringContent(
            JsonConvert.SerializeObject(dto),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await client.PostAsync("/api/kobo/bundles", secondContent);
        var responseString = await response.Content.ReadAsStringAsync();
        var error = JsonConvert.DeserializeObject<ErrorResponse>(responseString);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("short_url_code_already_exists", error.Error);
    }
}