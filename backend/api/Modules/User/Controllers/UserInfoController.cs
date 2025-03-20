using api.Modules.Common.Controllers;
using api.Modules.User.Auth;
using api.Modules.User.Http.Response;
using api.Modules.User.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.User.Controllers;

[ApiController]
public class UserInfoController(
    UserMapper mapper
) : ApiController
{
    [ApiTokenRequired]
    [ProducesResponseType(typeof(UserInfoResponse), StatusCodes.Status200OK)]
    [EndpointName("apiGetCurrentUser")]
    [HttpGet("/api/users/me")]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        var userDto = await mapper.MapByUserId(userId);

        return Ok(new UserInfoResponse(User: userDto));
    }
}