using System.Net;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Tests.Integration;

public class UserRegistrationControllerTests : ApiTestBase
{
    public UserRegistrationControllerTests(TestApiFactory factory) : base(factory)
    {
    }
    
    [Fact]
    public async Task Register_WithValidEmail_CreatesUser()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            Email = "test@example.com"
        };
        
        // Act
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        var content = await response.Content.ReadFromJsonAsync<GuidResponse>();
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        content.Should().NotBeNull();
        content!.Id.Should().NotBeEmpty();
        
        // Verify in database
        await using var dbContext = await CreateDbContextAsync();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        
        user.Should().NotBeNull();
        user!.Id.Should().Be(content.Id);
        user.IsEmailVerified.Should().BeFalse();
    }
    
    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            Email = "duplicate@example.com"
        };
        
        // Register first user
        await PostJsonAsync("/api/users/register", registrationDto);
        
        // Act - Try to register with same email
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        var errorContent = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        errorContent.Should().NotBeNull();
        errorContent!.Code.Should().Be("already_registered");
    }
    
    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            Email = "invalid-email"
        };
        
        // Act
        var response = await PostJsonAsync("/api/users/register", registrationDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}