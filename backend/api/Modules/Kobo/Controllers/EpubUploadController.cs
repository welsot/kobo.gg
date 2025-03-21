using api.Modules.Common.Controllers;
using api.Modules.Common.DTO;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Repository;
using api.Modules.Storage.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class EpubUploadController : ApiController
{
    private readonly ITmpBookBundleRepository _tmpBookBundleRepository;
    private readonly IPendingBookRepository _pendingBookRepository;
    private readonly IS3Service _s3Service;
    private readonly ILogger<EpubUploadController> _logger;

    // Dictionary mapping file extensions to MIME types
    private static readonly Dictionary<string, string> SupportedFileTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".txt", "text/plain" },
        { ".epub", "application/epub+zip" },
        { ".kepub", "application/epub+zip" },  // Kobo EPUB format
        { ".mobi", "application/x-mobipocket-ebook" },
        { ".pdf", "application/pdf" },
        { ".cbz", "application/vnd.comicbook+zip" },
        { ".cbr", "application/vnd.comicbook-rar" }
    };

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

        // Validate and process the file name
        string fileName = request.FileName;
        string extension = Path.GetExtension(fileName);

        // Check if the file has a supported extension
        if (string.IsNullOrEmpty(extension) || !SupportedFileTypes.ContainsKey(extension))
        {
            // Default to .epub if no valid extension found
            fileName += ".epub";
            extension = ".epub";
        }

        // Get the content type for the file
        string contentType = SupportedFileTypes[extension];

        // Generate a unique S3 key using the TmpBookBundle ID as the prefix
        var s3Key = $"{tmpBookBundle.Id}/{Guid.NewGuid()}/{fileName}";

        // Create a pending book record
        var pendingBook = await _pendingBookRepository.CreateAsync(
            tmpBookBundle,
            fileName,
            s3Key);

        // Generate the presigned URL with the appropriate content type
        var url = await _s3Service.GeneratePresignedUploadUrlAsync(s3Key, contentType);

        return Ok(new EpubUploadUrlResponseDto(Url: url, Key: s3Key, PendingBookId: pendingBook.Id));
    }
}