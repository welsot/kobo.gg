using System.Net;
using System.Net.Http.Json;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using Shouldly;
using Microsoft.EntityFrameworkCore;

namespace api.Tests.Integration.User.Controllers;

public class UserRegistrationControllerTests : ApiTestBase
{
    public UserRegistrationControllerTests(TestApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_WithValidEmail_CreatesUser()
    {
        var registrationDto = new UserRegistrationDto { Email = "test@example.com" };

        var response = await PostJsonAsync("/api/users/register", registrationDto);
        var content = await response.Content.ReadFromJsonAsync<GuidResponse>();

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        content.ShouldNotBeNull();
        content.Id.ShouldNotBe(Guid.Empty);

        var dbContext = CreateDbContext();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");

        user.ShouldNotBeNull();
        user.Id.ShouldBe(content.Id);
        user.IsEmailVerified.ShouldBeFalse();
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsOkWithUserId()
    {
        var registrationDto = new UserRegistrationDto { Email = "duplicate@example.com" };
    
        // First registration - should create the user
        var firstResponse = await PostJsonAsync("/api/users/register", registrationDto);
        var firstContent = await firstResponse.Content.ReadFromJsonAsync<GuidResponse>();
        firstResponse.StatusCode.ShouldBe(HttpStatusCode.Created);
        firstContent.ShouldNotBeNull();
        var userId = firstContent.Id;
        
        // Second registration with the same email - should return OK with the same user ID
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        var content = await response.Content.ReadFromJsonAsync<GuidResponse>();

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        content.ShouldNotBeNull();
        content.Id.ShouldBe(userId);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        var registrationDto = new UserRegistrationDto { Email = "invalid-email" };
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}