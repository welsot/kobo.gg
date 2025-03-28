using System.Security.Claims;

using api.Modules.Common.DTO;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace api.Modules.Common.Controllers;

public class ApiController : ControllerBase
{
    protected Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null) return Guid.Empty; // or better throw an exception?
        return Guid.Parse(userIdStr);
    }

    protected IActionResult Created([ActionResultObjectValue] object value) => StatusCode(201, value);

    protected IActionResult Error(string code) => Conflict(new ErrorResponse(code));

    protected IActionResult Error(int statusCode, string code) => StatusCode(statusCode, new ErrorResponse(code));
}