using api.Modules.Common.Controllers;
using api.Modules.Common.DTO;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class BookController : ApiController
{
    private readonly BookConverter _bookConverter;
    private readonly ILogger<BookController> _logger;

    public BookController(
        BookConverter bookConverter,
        ILogger<BookController> logger)
    {
        _bookConverter = bookConverter;
        _logger = logger;
    }
    
    [EndpointName("apiFinalizeBooks")]
    [HttpPost("api/kobo/books/finalize")]
    [ProducesResponseType(typeof(FinalizeBooksResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> FinalizeBooks([FromBody] FinalizeBooksRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ErrorResponse("Invalid request parameters"));
        }

        try
        {
            var convertedCount = await _bookConverter.ConvertPendingBooksToBooks(request.TmpBookBundleId);
            
            return Ok(new FinalizeBooksResponseDto(
                ConvertedCount: convertedCount,
                TmpBookBundleId: request.TmpBookBundleId
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing books for TmpBookBundle {Id}", request.TmpBookBundleId);
            return Error(500, "unexpected_server_error");
        }
    }
}