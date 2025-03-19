using api.Modules.Common.DTO;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace api.Modules.Common.Controllers;

public class ApiController : ControllerBase
{
    public IActionResult Created([ActionResultObjectValue] object value) => StatusCode(201, value);

    public IActionResult Error(string code) => Conflict(new ErrorResponse(code));
    
    public IActionResult Error(int statusCode, string code) => StatusCode(statusCode, new ErrorResponse(code));
}