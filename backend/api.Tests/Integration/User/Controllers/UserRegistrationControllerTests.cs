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
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        var registrationDto = new UserRegistrationDto { Email = "duplicate@example.com" };
    
        await PostJsonAsync("/api/users/register", registrationDto);
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        var errorContent = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        errorContent.ShouldNotBeNull();
        errorContent.Code.ShouldBe("already_registered");
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        var registrationDto = new UserRegistrationDto { Email = "invalid-email" };
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}