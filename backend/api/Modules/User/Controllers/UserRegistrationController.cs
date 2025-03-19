using api.Modules.Common.Data;
using api.Modules.Common.DTO;
using api.Modules.Email.Services;
using api.Modules.Email.Templates;
using api.Modules.User.DTOs;
using api.Modules.User.Repository;
using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserRegistrationController(
    Db db,
    ILogger<UserRegistrationController> logger,
    IUserRepository users,
    IEmailService emailService
) : ControllerBase
{
    [ProducesResponseType(typeof(GuidResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [HttpPost("api/users/register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Check if email already exists
            var existingUser = await users.FindByEmailAsync(registrationDto.Email);
            if (existingUser != null)
            {
                return Conflict(new ErrorResponse("already_registered"));
            }

            // Create new user
            var user = new Models.User(Guid.NewGuid(), registrationDto.Email);

            users.Add(user);
            await db.SaveChangesAsync();

            // Generate verification link (this would be implemented properly with token generation)
            string verificationToken = Guid.NewGuid().ToString();
            var verificationLink =
                $"https://kobo.gg/verify-email?email={Uri.EscapeDataString(user.Email)}&token={verificationToken}";

            // Send welcome email
            var emailModel = new UserRegistrationEmailModel
            {
                Email = user.Email,
                VerificationLink = verificationLink
            };

            await emailService.SendTemplatedEmailAsync(
                to: user.Email,
                subject: "Welcome to Kobo.gg! Please verify your email",
                templateName: "UserRegistration",
                model: emailModel
            );

            logger.LogInformation("Registration email sent to {Email}", user.Email);

            return StatusCode(StatusCodes.Status201Created, new GuidResponse(user.Id));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error registering user");
            return StatusCode(500, new ErrorResponse("unexpected_server_error"));
        }
    }
}