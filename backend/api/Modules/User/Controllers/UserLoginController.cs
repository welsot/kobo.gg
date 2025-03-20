using api.Modules.Common.Controllers;
using api.Modules.Common.Data;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using api.Modules.User.Models;
using api.Modules.User.Repository;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserLoginController(
    Db db,
    ILogger<UserLoginController> logger,
    IOneTimePasswordRepository otpRepository,
    IApiTokenRepository apiTokenRepository
) : ApiController
{
    [ProducesResponseType(typeof(ApiTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
            
            return Ok(new ApiTokenResponse(apiToken.Token));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error logging in user");
            return Error(500, "unexpected_server_error");
        }
    }
}