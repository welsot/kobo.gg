using api.Modules.Common.Controllers;
using api.Modules.Common.Data;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Repository;
using api.Modules.Kobo.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class TmpBookBundleController(
    ILogger<TmpBookBundleController> logger,
    TmpBookBundleCreator tmpBookBundleCreator,
    TmpBookBundleMapper mapper
) : ApiController
{
    [ProducesResponseType(typeof(TmpBookBundleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointName("apiTmpBookBundleCreate")]
    [HttpPost("api/kobo/bundles")]
    public async Task<IActionResult> Create()
    {
        try
        {
            var bundle = await tmpBookBundleCreator.CreateTmpBookBundleWithShortUrlCodeAsync();

            return Created(mapper.Map(bundle));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating temporary book bundle");
            return Error(500, "unexpected_server_error");
        }
    }
}