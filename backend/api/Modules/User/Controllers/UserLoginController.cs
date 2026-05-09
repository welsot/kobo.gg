using api.Modules.Common.Controllers;
using api.Modules.Common.Data;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using api.Modules.User.Models;
using api.Modules.User.Repository;
using api.Modules.User.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserLoginController(
    Db db,
    ILogger<UserLoginController> logger,
    IOneTimePasswordRepository otpRepository,
    IApiTokenRepository apiTokenRepository,
    UserMapper mapper,
    IWebHostEnvironment env
) : ApiController
{
    [ProducesResponseType(typeof(ApiTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointName("apiUsersLogin")]
    [HttpPost("api/users/login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var user = await otpRepository.FindByEmailAndCodeAsync(dto.Email, dto.Code);

            if (user == null)
            {
                return Error(404, "invalid_credentials");
            }

            var apiToken = new ApiToken(user);
            apiTokenRepository.Add(apiToken);

            await db.SaveChangesAsync();
            var userDto = mapper.Map(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = env.IsProduction(),
                SameSite =  SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddYears(1)
            };

            Response.Cookies.Append("apiToken", apiToken.Token, cookieOptions);

            return Ok(
                new ApiTokenResponse(
                    Token: apiToken.Token,
                    User: userDto
                )
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error logging in user");
            return Error(500, "unexpected_server_error");
        }
    }
}