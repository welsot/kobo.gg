using System.Security.Claims;

using api.Modules.Common.Controllers;
using api.Modules.User.Auth;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
[Route("api/protected")]
public class ProtectedController : ApiController
{
    [HttpGet]
    [ApiTokenRequired]
    public IActionResult Get()
    {
        // Get the authenticated user's ID from claims
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        
        return Ok(new { 
            Message = "You have access to protected data!", 
            UserId = userId,
            Email = userEmail
        });
    }
    
    [HttpGet("public")]
    public IActionResult GetPublic()
    {
        return Ok(new { Message = "This is public data that doesn't require authentication" });
    }
}