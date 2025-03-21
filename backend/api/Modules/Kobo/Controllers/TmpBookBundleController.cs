using api.Modules.Common.Controllers;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Http.Response;
using api.Modules.Kobo.Repository;
using api.Modules.Kobo.Services;
using api.Modules.Storage.Services;

using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Kobo.Controllers;

[ApiController]
public class TmpBookBundleController(
    ILogger<TmpBookBundleController> logger,
    TmpBookBundleCreator tmpBookBundleCreator,
    TmpBookBundleMapper mapper,
    ITmpBookBundleRepository tmpBookBundleRepository,
    IS3Service s3Service
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

    [ProducesResponseType(typeof(BundleBooksResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointName("apiBundleGetBooks")]
    [HttpGet("api/kobo/bundles/{shortUrlCode}/books")]
    public async Task<IActionResult> GetBooksByShortUrlCode(string shortUrlCode)
    {
        try
        {
            var bundle = await tmpBookBundleRepository.FindByShortUrlCodeAsync(shortUrlCode);

            if (bundle == null)
            {
                return NotFound();
            }

            var bookDtos = new List<BookDto>();

            foreach (var book in bundle.Books)
            {
                var downloadUrl = await s3Service.GeneratePresignedDownloadUrlAsync(book.S3Key);
                string? kepubDownloadUrl = null;

                if (book.KepubS3Key != null)
                {
                    kepubDownloadUrl = await s3Service.GeneratePresignedDownloadUrlAsync(book.KepubS3Key);
                }

                bookDtos.Add(new BookDto(
                    Id: book.Id,
                    FileName: book.FileName,
                    OriginalFileName: book.OriginalFileName,
                    FileSize: book.FileSize,
                    DownloadUrl: downloadUrl,
                    KepubDownloadUrl: kepubDownloadUrl
                ));
            }

            return Ok(
                new BundleBooksResponse(
                    Books: bookDtos,
                    ExpiresAt: bundle.ExpiresAt
                )
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting books for bundle with short URL code {ShortUrlCode}", shortUrlCode);
            return Error(500, "unexpected_server_error");
        }
    }
}