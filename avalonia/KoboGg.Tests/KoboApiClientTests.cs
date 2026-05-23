using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api;
using KoboGg.Api.Dtos;
using KoboGg.Tests.TestDoubles;
using Xunit;

namespace KoboGg.Tests;

public class KoboApiClientTests
{
    private static KoboApiClient NewClient(StubHttpMessageHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("https://api.example/") });

    private static HttpResponseMessage Json(HttpStatusCode status, string json) =>
        new(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    [Fact]
    public async Task CreateBundleAsync_maps_camelcase_json_to_dto()
    {
        var id = Guid.NewGuid();
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.OK,
            $$"""{"id":"{{id}}","shortUrlCode":"abc123","expiresAt":"2026-05-01T00:00:00Z"}"""));
        var client = NewClient(handler);

        var dto = await client.CreateBundleAsync(CancellationToken.None);

        Assert.Equal(id, dto.Id);
        Assert.Equal("abc123", dto.ShortUrlCode);
        Assert.Equal(HttpMethod.Post, handler.Requests[0].Method);
        Assert.Equal("/api/kobo/bundles", handler.Requests[0].RequestUri!.AbsolutePath);
    }

    [Fact]
    public async Task RequestUploadUrlAsync_serializes_request_camelcase_and_maps_response()
    {
        var pending = Guid.NewGuid();
        string? body = null;
        var handler = new StubHttpMessageHandler(async (req, ct) =>
        {
            body = await req.Content!.ReadAsStringAsync(ct);
            return Json(HttpStatusCode.OK,
                $$"""{"url":"https://s3/put","key":"k","pendingBookId":"{{pending}}"}""");
        });
        var client = NewClient(handler);

        var resp = await client.RequestUploadUrlAsync(
            new EpubUploadUrlRequestDto(Guid.NewGuid(), "book.epub", "application/epub+zip"),
            CancellationToken.None);

        Assert.Equal(pending, resp.PendingBookId);
        // Properties are serialized camelCase (the contract the backend expects).
        Assert.Contains("\"fileName\":\"book.epub\"", body);
        Assert.Contains("\"contentType\":", body);
        Assert.Contains("\"tmpBookBundleId\":", body);
    }

    [Fact]
    public async Task Non2xx_with_known_machine_code_maps_to_friendly_message()
    {
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.InternalServerError,
            """{"code":"unexpected_server_error"}"""));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("Something went wrong on the server. Please retry.", ex.UserMessage);
    }

    [Fact]
    public async Task Non2xx_404_without_code_maps_to_session_not_found()
    {
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.NotFound, "{}"));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("Your upload session was not found. Start over.", ex.UserMessage);
    }

    [Fact]
    public async Task Non2xx_with_human_readable_code_is_surfaced_directly()
    {
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.BadRequest,
            """{"code":"File is too large to upload."}"""));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("File is too large to upload.", ex.UserMessage);
    }

    [Fact]
    public async Task Empty_2xx_body_throws_empty_response()
    {
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.OK, "null"));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("Server returned an empty response. Please retry.", ex.UserMessage);
    }

    [Fact]
    public async Task Malformed_2xx_body_throws_read_error()
    {
        var handler = new StubHttpMessageHandler(_ => Json(HttpStatusCode.OK, "{ not json "));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("Couldn't read the server response. Please retry.", ex.UserMessage);
    }

    [Fact]
    public async Task Network_failure_maps_to_offline_message()
    {
        var handler = new StubHttpMessageHandler((_, _) =>
            Task.FromException<HttpResponseMessage>(new HttpRequestException("boom")));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal(0, (int)ex.StatusCode);
        Assert.Equal("No internet connection. Check your network and try again.", ex.UserMessage);
    }

    [Fact]
    public async Task Timeout_not_user_cancellation_maps_to_timeout_message()
    {
        var handler = new StubHttpMessageHandler((_, _) =>
            Task.FromException<HttpResponseMessage>(new TaskCanceledException("timeout")));
        var client = NewClient(handler);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.CreateBundleAsync(CancellationToken.None));
        Assert.Equal("The request timed out. Try again.", ex.UserMessage);
    }

    [Fact]
    public async Task User_cancellation_is_rethrown_not_wrapped()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        var handler = new StubHttpMessageHandler((_, ct) =>
        {
            ct.ThrowIfCancellationRequested();
            return Task.FromResult(Json(HttpStatusCode.OK, "{}"));
        });
        var client = NewClient(handler);

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => client.CreateBundleAsync(cts.Token));
    }

    [Fact]
    public async Task PutToPresignedUrl_success_sends_put_with_headers_and_does_not_throw()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK));
        var client = NewClient(handler);
        using var content = new MemoryStream(new byte[10]);

        await client.PutToPresignedUrlAsync("https://s3.example/put", content, 10, "application/epub+zip", CancellationToken.None);

        var req = handler.Requests[0];
        Assert.Equal(HttpMethod.Put, req.Method);
        Assert.Equal("application/epub+zip", req.Content!.Headers.ContentType!.MediaType);
        Assert.Equal(10, req.Content.Headers.ContentLength);
    }

    [Fact]
    public async Task PutToPresignedUrl_non2xx_throws_upload_failed()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.Forbidden));
        var client = NewClient(handler);
        using var content = new MemoryStream(new byte[10]);

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            client.PutToPresignedUrlAsync("https://s3.example/put", content, 10, "application/epub+zip", CancellationToken.None));
        Assert.Equal("Upload failed (403). Please retry.", ex.UserMessage);
    }
}
