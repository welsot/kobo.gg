using api.Modules.Common.Controllers;
using api.Modules.Common.Data;
using api.Modules.Common.DTO;
using api.Modules.Email.Services;
using api.Modules.User.DTOs;
using api.Modules.User.Models;
using api.Modules.User.Repository;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserRegistrationController(
    Db db,
    ILogger<UserRegistrationController> logger,
    IUserRepository users,
    Mailer mailer
) : ApiController
{
    [ProducesResponseType(typeof(GuidResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(GuidResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [HttpPost("api/users/register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try {
            var user = await users.FindByEmailAsync(dto.Email);
            var isNewUser = false;

            if (user == null) {
                user = new Models.User(Guid.NewGuid(), dto.Email);
                users.Add(user);
                isNewUser = true;
            }

            var otp = new OneTimePassword(user);
            
            await db.SaveChangesAsync();
            await SendOneTimePassword(user.Email, isNewUser);
        
            return isNewUser 
                ? Created(new GuidResponse(user.Id))
                : Ok(new GuidResponse(user.Id));
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error registering user");
            return Error(500, "unexpected_server_error");
        }
    }

    private async Task SendOneTimePassword(string email, string otp, bool isNewUser)
    {
        await mailer.SendOneTimePasswordAsync(email, otp);
        logger.LogInformation("{Action} email sent to {Email}", 
            isNewUser ? "Registration" : "Login", email);
    }
}