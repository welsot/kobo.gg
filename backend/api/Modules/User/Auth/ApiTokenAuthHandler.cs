using System.Security.Claims;
using System.Text.Encodings.Web;

using api.Modules.Common.DTO;
using api.Modules.User.Repository;

using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace api.Modules.User.Auth;

public class ApiTokenAuthHandler : AuthenticationHandler<ApiTokenAuthOptions>
{
    private const string ApiTokenHeader = "X-API-TOKEN";
    private const string ApiTokenCookie = "apiToken";
    private readonly IApiTokenRepository _apiTokenRepository;

    public ApiTokenAuthHandler(
        IOptionsMonitor<ApiTokenAuthOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IApiTokenRepository apiTokenRepository)
        : base(options, logger, encoder)
    {
        _apiTokenRepository = apiTokenRepository;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Look for the API token in header first
        string? apiToken = null;

        if (Request.Headers.TryGetValue(ApiTokenHeader, out var headerValue))
        {
            apiToken = headerValue.ToString();
        }
        // If not found in header, check cookies
        else if (Request.Cookies.TryGetValue(ApiTokenCookie, out var cookieValue))
        {
            apiToken = cookieValue;
        }

        // If no token found at all, return no result (not failure)
        if (string.IsNullOrEmpty(apiToken))
        {
            return AuthenticateResult.NoResult();
        }

        // Validate the token
        var user = await _apiTokenRepository.FindUserByTokenAsync(apiToken);

        if (user == null)
        {
            return AuthenticateResult.Fail("Invalid API token");
        }

        // Create user identity based on the user found
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Email, user.Email)
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = 401;
        Response.ContentType = "application/json";
        await Response.WriteAsJsonAsync(new ErrorResponse("auth_required"));
    }
    
    protected override Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = 403;
        Response.ContentType = "application/json";
        return Response.WriteAsJsonAsync(new ErrorResponse("access_denied"));
    }
}