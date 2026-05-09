using System.Net;
using System.Net.Http.Json;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using Shouldly;
using Microsoft.EntityFrameworkCore;

namespace api.Tests.Integration.User.Controllers;

public class UserLoginControllerTests : ApiTestBase
{
    public UserLoginControllerTests(TestApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // First register a user to ensure there's a valid account
        var registrationDto = new UserRegistrationDto { Email = "login-test@example.com" };
        await PostJsonAsync("/api/users/register", registrationDto);
        
        // Get OTP code from database
        var dbContext = CreateDbContext();
        var user = await dbContext.Users.FirstAsync(u => u.Email == "login-test@example.com");
        var otp = await dbContext.OneTimePasswords.FirstAsync(o => o.UserId == user.Id);
        
        // Login with the valid credentials
        var loginDto = new UserLoginDto { Email = "login-test@example.com", Code = otp.Code };
        var response = await PostJsonAsync("/api/users/login", loginDto);
        var content = await response.Content.ReadFromJsonAsync<ApiTokenResponse>();

        // Assertions
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        content.ShouldNotBeNull();
        content.Token.ShouldNotBeNullOrEmpty();
        
        // Verify token exists in database
        var apiToken = await dbContext.ApiTokens.FirstOrDefaultAsync(t => t.Token == content.Token);
        apiToken.ShouldNotBeNull();
        apiToken.UserId.ShouldBe(user.Id);
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsNotFound()
    {
        var loginDto = new UserLoginDto { Email = "nonexistent@example.com", Code = "123456" };
        var response = await PostJsonAsync("/api/users/login", loginDto);
        
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var errorContent = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        errorContent.ShouldNotBeNull();
        errorContent.Code.ShouldBe("invalid_credentials");
    }
    
    [Fact]
    public async Task Login_WithInvalidCode_ReturnsNotFound()
    {
        // First register a user
        var registrationDto = new UserRegistrationDto { Email = "wrong-code@example.com" };
        await PostJsonAsync("/api/users/register", registrationDto);
        
        // Try to login with wrong code
        var loginDto = new UserLoginDto { Email = "wrong-code@example.com", Code = "000000" };
        var response = await PostJsonAsync("/api/users/login", loginDto);
        
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        var errorContent = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        errorContent.ShouldNotBeNull();
        errorContent.Code.ShouldBe("invalid_credentials");
    }

    [Fact]
    public async Task Login_WithInvalidModelState_ReturnsBadRequest()
    {
        // Email format is invalid
        var loginDto = new UserLoginDto { Email = "invalid-email", Code = "123456" };
        var response = await PostJsonAsync("/api/users/login", loginDto);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        
        // Code format is invalid (too short)
        loginDto = new UserLoginDto { Email = "valid@example.com", Code = "12345" };
        response = await PostJsonAsync("/api/users/login", loginDto);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}