using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api.Dtos;

namespace KoboGg.Api;

public sealed class KoboApiClient : IKoboApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    private readonly HttpClient _http;

    public KoboApiClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<TmpBookBundleDto> CreateBundleAsync(CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "api/kobo/bundles");
        return await SendJsonAsync<TmpBookBundleDto>(request, ct);
    }

    public async Task<EpubUploadUrlResponseDto> RequestUploadUrlAsync(
        EpubUploadUrlRequestDto request,
        CancellationToken ct)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "api/epub/upload-url")
        {
            Content = JsonContent.Create(request, options: JsonOptions),
        };
        return await SendJsonAsync<EpubUploadUrlResponseDto>(message, ct);
    }

    public async Task PutToPresignedUrlAsync(
        string presignedUrl,
        Stream content,
        long contentLength,
        string contentType,
        CancellationToken ct)
    {
        using var message = new HttpRequestMessage(HttpMethod.Put, presignedUrl);
        var streamContent = new StreamContent(content);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        streamContent.Headers.ContentLength = contentLength;
        message.Content = streamContent;

        HttpResponseMessage response;
        try
        {
            // ResponseHeadersRead — the body for an S3 PUT is empty / negligible.
            response = await _http.SendAsync(message, HttpCompletionOption.ResponseHeadersRead, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (TaskCanceledException ex)
        {
            throw ApiException.Timeout(ex);
        }
        catch (HttpRequestException ex)
        {
            throw ApiException.Network(ex);
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                throw new ApiException(
                    statusCode: response.StatusCode,
                    code: null,
                    userMessage: $"Upload failed ({(int)response.StatusCode}). Please retry.");
            }
        }
    }

    public async Task<ConfirmUploadResponseDto> ConfirmUploadAsync(Guid pendingBookId, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"api/epub/confirm-upload/{pendingBookId}");
        return await SendJsonAsync<ConfirmUploadResponseDto>(request, ct);
    }

    public async Task<FinalizeBooksResponseDto> FinalizeAsync(
        FinalizeBooksRequestDto request,
        CancellationToken ct)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "api/kobo/books/finalize")
        {
            Content = JsonContent.Create(request, options: JsonOptions),
        };
        return await SendJsonAsync<FinalizeBooksResponseDto>(message, ct);
    }

    private async Task<T> SendJsonAsync<T>(HttpRequestMessage request, CancellationToken ct)
    {
        HttpResponseMessage response;
        try
        {
            response = await _http.SendAsync(request, HttpCompletionOption.ResponseContentRead, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (TaskCanceledException ex)
        {
            throw ApiException.Timeout(ex);
        }
        catch (HttpRequestException ex)
        {
            throw ApiException.Network(ex);
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                string? code = null;
                try
                {
                    var err = await response.Content.ReadFromJsonAsync<ErrorResponseDto>(JsonOptions, ct);
                    code = err?.Code;
                }
                catch
                {
                    // Body was not JSON or parse failed — fall back to status-only message.
                }

                throw ApiException.FromHttp(response.StatusCode, code);
            }

            try
            {
                var dto = await response.Content.ReadFromJsonAsync<T>(JsonOptions, ct);
                if (dto is null)
                {
                    throw new ApiException(
                        statusCode: response.StatusCode,
                        code: null,
                        userMessage: "Server returned an empty response. Please retry.");
                }
                return dto;
            }
            catch (JsonException ex)
            {
                throw new ApiException(
                    statusCode: response.StatusCode,
                    code: null,
                    userMessage: "Couldn't read the server response. Please retry.",
                    inner: ex);
            }
        }
    }
}
