using System;
using System.Threading.Tasks;
using api.Modules.Common.Controllers;
using api.Modules.Common.DTO;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Repository;
using api.Modules.Storage.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class EpubUploadController : ApiController
{
    private readonly ITmpBookBundleRepository _tmpBookBundleRepository;
    private readonly IPendingBookRepository _pendingBookRepository;
    private readonly IS3Service _s3Service;
    private readonly ILogger<EpubUploadController> _logger;

    public EpubUploadController(
        ITmpBookBundleRepository tmpBookBundleRepository,
        IPendingBookRepository pendingBookRepository,
        IS3Service s3Service,
        ILogger<EpubUploadController> logger)
    {
        _tmpBookBundleRepository = tmpBookBundleRepository;
        _pendingBookRepository = pendingBookRepository;
        _s3Service = s3Service;
        _logger = logger;
    }

    [HttpPost("api/epub/upload-url")]
    [ProducesResponseType(typeof(EpubUploadUrlResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEpubUploadUrl([FromBody] EpubUploadUrlRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ErrorResponse("Invalid request parameters"));
        }

        // Get the TmpBookBundle
        var tmpBookBundle = await _tmpBookBundleRepository.FindByIdAsync(request.TmpBookBundleId);
        if (tmpBookBundle == null)
        {
            _logger.LogWarning("TmpBookBundle with ID {Id} not found", request.TmpBookBundleId);
            return NotFound(new ErrorResponse($"TmpBookBundle with ID {request.TmpBookBundleId} not found"));
        }

        // Ensure the file name has .epub extension
        string fileName = request.FileName;
        if (!fileName.EndsWith(".epub", StringComparison.OrdinalIgnoreCase))
        {
            fileName += ".epub";
        }

        // Generate a unique S3 key using the TmpBookBundle ID as the prefix
        var s3Key = $"{request.TmpBookBundleId}/{Guid.NewGuid()}/{fileName}";
        
        // Create a pending book record
        var pendingBook = await _pendingBookRepository.CreateAsync(
            tmpBookBundle,
            fileName,
            s3Key);

        // Generate the presigned URL
        var url = await _s3Service.GeneratePresignedUploadUrlAsync(s3Key, "application/epub+zip");
        
        return Ok(new EpubUploadUrlResponseDto
        {
            Url = url,
            Key = s3Key,
            PendingBookId = pendingBook.Id
        });
    }
}