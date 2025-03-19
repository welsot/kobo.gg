using api.Data;
using api.Modules.Common.DTO;
using api.Modules.User.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserRegistrationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserRegistrationController> _logger;

    public UserRegistrationController(ApplicationDbContext context, ILogger<UserRegistrationController> logger)
    {
        _context = context;
        _logger = logger;
    }

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
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registrationDto.Email);
            if (existingUser != null)
            {
                return Conflict(new ErrorResponse("already_registered"));
            }

            // Create new user
            var user = new Models.User(Guid.NewGuid(), registrationDto.Email);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new GuidResponse(user.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new ErrorResponse("unexpected_server_error"));
        }
    }
}