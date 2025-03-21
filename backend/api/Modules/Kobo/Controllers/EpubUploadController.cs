using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

using api.Modules.Common.Controllers;
using api.Modules.Common.DTO;
using api.Modules.Common.Services;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Repository;
using api.Modules.Kobo.Services;
using api.Modules.Storage.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class EpubUploadController : ApiController
{
    private readonly ITmpBookBundleRepository _tmpBookBundleRepository;
    private readonly IPendingBookRepository _pendingBookRepository;
    private readonly IS3Service _s3Service;
    private readonly EpubConverter _epubConverter;
    private readonly ILogger<EpubUploadController> _logger;

    // Dictionary mapping file extensions to MIME types
    private static readonly Dictionary<string, string> SupportedFileTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".txt", "text/plain" },
        { ".epub", "application/epub+zip" },
        { ".kepub", "application/epub+zip" }, // Kobo EPUB format
        { ".mobi", "application/x-mobipocket-ebook" },
        { ".pdf", "application/pdf" },
        { ".cbz", "application/vnd.comicbook+zip" },
        { ".cbr", "application/vnd.comicbook-rar" }
    };

    public EpubUploadController(
        ITmpBookBundleRepository tmpBookBundleRepository,
        IPendingBookRepository pendingBookRepository,
        IS3Service s3Service,
        EpubConverter epubConverter,
        ILogger<EpubUploadController> logger)
    {
        _tmpBookBundleRepository = tmpBookBundleRepository;
        _pendingBookRepository = pendingBookRepository;
        _s3Service = s3Service;
        _epubConverter = epubConverter;
        _logger = logger;
    }

    [EndpointName("apiGetEpubUploadUrl")]
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
        string originalFileName = fileName; // Store the original filename
        string extension = Path.GetExtension(fileName);

        // Check if the file has a supported extension
        if (string.IsNullOrEmpty(extension) || !SupportedFileTypes.ContainsKey(extension))
        {
            // Default to .epub if no valid extension found
            fileName += ".epub";
            extension = ".epub";
        }

        // Transform filename to safe version
        string transformedFileName = TransformFileNameForS3(Path.GetFileNameWithoutExtension(fileName), extension);

        // Get the content type for the file
        string contentType = SupportedFileTypes[extension];

        // Generate a unique S3 key using the TmpBookBundle ID as the prefix
        var s3Key = $"{tmpBookBundle.Id}/{Guid.NewGuid()}/{transformedFileName}";

        // Create a pending book record with the new fields
        var pendingBook = await _pendingBookRepository.CreateAsync(
            tmpBookBundle,
            fileName,
            originalFileName,
            0, // FileSize will be updated after upload
            s3Key);

        // Generate the presigned URL with the appropriate content type
        var url = await _s3Service.GeneratePresignedUploadUrlAsync(s3Key, contentType);

        return Ok(new EpubUploadUrlResponseDto(Url: url, Key: s3Key, PendingBookId: pendingBook.Id));
    }

    [EndpointName("apiConfirmUpload")]
    [HttpPost("api/epub/confirm-upload/{pendingBookId}")]
    [ProducesResponseType(typeof(GuidResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmUpload(Guid pendingBookId)
    {
        // Get the pending book
        var pendingBook = await _pendingBookRepository.FindByIdAsync(pendingBookId);
        if (pendingBook == null)
        {
            _logger.LogWarning("PendingBook with ID {Id} not found", pendingBookId);
            return NotFound(new ErrorResponse($"PendingBook with ID {pendingBookId} not found"));
        }

        // Verify the file exists in S3
        bool fileExists = await _s3Service.KeyExistsAsync(pendingBook.S3Key);
        if (!fileExists)
        {
            _logger.LogWarning("File with S3 key {Key} not found", pendingBook.S3Key);
            return BadRequest(new ErrorResponse("The uploaded file could not be found"));
        }

        try
        {
            // If the file is an EPUB, convert it to KEPUB format
            string extension = Path.GetExtension(pendingBook.FileName).ToLowerInvariant();
            if (extension == ".epub")
            {
                _logger.LogInformation("Converting EPUB file {FileName} to KEPUB format", pendingBook.FileName);
                string kepubS3Key = await _epubConverter.ConvertToKepubAsync(pendingBook.S3Key, pendingBook.FileName);

                // Update the pending book with the KEPUB S3 key
                await _pendingBookRepository.UpdateKepubS3KeyAsync(pendingBookId, kepubS3Key);

                _logger.LogInformation("Successfully converted EPUB to KEPUB: {FileName}", pendingBook.FileName);
            }

            return Ok(new GuidResponse(pendingBookId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing uploaded file: {Message}", ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new ErrorResponse($"Error processing uploaded file: {ex.Message}"));
        }
    }

    /// <summary>
    /// Transforms a filename to be safe for S3 storage by:
    /// 1. Transliterating non-Latin characters to their Latin equivalents
    /// 2. Converting to lowercase
    /// 3. Removing non-alphanumeric characters and replacing with hyphens
    /// 4. Adding "kobogg-" and a random 3-character code before the extension
    /// </summary>
    private string TransformFileNameForS3(string fileName, string extension)
    {
        Dictionary<char, string> transliterationMap = Transliteration.GetMap();

        // Convert to lowercase first (important for transliteration lookup)
        fileName = fileName.ToLowerInvariant();

        // Apply transliteration
        StringBuilder result = new StringBuilder();
        foreach (char c in fileName)
        {
            if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'))
            {
                // ASCII alphanumeric characters pass through unchanged
                result.Append(c);
            }
            else if (transliterationMap.TryGetValue(c, out string? replacement) && replacement != null)
            {
                // Use our custom transliteration map
                result.Append(replacement);
            }
            else
            {
                // Try standard Unicode normalization to handle other diacritics
                string normalized = c.ToString().Normalize(NormalizationForm.FormD);
                bool nonMarkAppended = false;

                foreach (char nc in normalized)
                {
                    if (CharUnicodeInfo.GetUnicodeCategory(nc) != UnicodeCategory.NonSpacingMark)
                    {
                        if ((nc >= 'a' && nc <= 'z') || (nc >= '0' && nc <= '9'))
                        {
                            result.Append(nc);
                            nonMarkAppended = true;
                        }
                        else
                        {
                            // Replace any other character with a hyphen
                            result.Append('-');
                            nonMarkAppended = true;
                        }
                    }
                }

                // If nothing was appended (completely unsupported character), add a hyphen
                if (!nonMarkAppended)
                {
                    result.Append('-');
                }
            }
        }

        // Replace consecutive hyphens with a single hyphen
        string sanitized = Regex.Replace(result.ToString(), "-{2,}", "-");

        // Trim any leading or trailing hyphens
        sanitized = sanitized.Trim('-');

        // If after all sanitization the string is empty, use a fallback
        if (string.IsNullOrEmpty(sanitized))
        {
            sanitized = "unknown-file";
        }

        // Generate random 3-character code
        string randomCode = RandomTokenGenerator.GenerateShortUrlCode(3);

        // Return the transformed filename with kobogg prefix and random code
        return $"{sanitized}-kobogg-{randomCode}{extension}";
    }
}