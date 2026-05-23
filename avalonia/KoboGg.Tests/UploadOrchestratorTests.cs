using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Models;
using KoboGg.Services;
using KoboGg.Tests.TestDoubles;
using Xunit;

namespace KoboGg.Tests;

public class UploadOrchestratorTests
{
    private static PickedFile EpubFile(string name = "book.epub", long length = 8) =>
        new(name, length, "application/epub+zip", _ => Task.FromResult<Stream>(new MemoryStream(new byte[length])));

    [Fact]
    public async Task EnsureBundleAsync_creates_bundle_exactly_once_under_concurrency()
    {
        var api = new FakeKoboApiClient { CreateBundleDelay = TimeSpan.FromMilliseconds(50) };
        var orchestrator = new UploadOrchestrator(api);

        var results = await Task.WhenAll(
            Enumerable.Range(0, 16).Select(_ => orchestrator.EnsureBundleAsync(CancellationToken.None)));

        Assert.Equal(1, api.CreateBundleCalls);
        Assert.All(results, r => Assert.Equal(api.Bundle.Id, r.Id));
        Assert.Equal(api.Bundle.Id, orchestrator.CurrentBundle!.Id);
    }

    [Fact]
    public async Task UploadAsync_calls_endpoints_in_order_and_returns_uploaded_book()
    {
        var api = new FakeKoboApiClient();
        var orchestrator = new UploadOrchestrator(api);

        var book = await orchestrator.UploadAsync(EpubFile("book.epub", 8), progress: null, CancellationToken.None);

        Assert.Equal(new[] { "CreateBundle", "RequestUploadUrl", "Put", "Confirm" }, api.Calls);
        Assert.Equal(api.ConfirmedId, book.Id);
        Assert.Equal("book.epub", book.FileName);
        Assert.Equal(8, book.SizeBytes);
    }

    [Fact]
    public async Task UploadAsync_reports_completion_progress()
    {
        var api = new FakeKoboApiClient();
        var orchestrator = new UploadOrchestrator(api);
        double last = -1;
        var progress = new Progress<double>(p => Volatile.Write(ref last, p));

        await orchestrator.UploadAsync(EpubFile(length: 8), progress, CancellationToken.None);

        // Progress<T> marshals callbacks asynchronously; give the final report a moment to land.
        var deadline = DateTime.UtcNow.AddSeconds(2);
        while (Volatile.Read(ref last) < 1.0 && DateTime.UtcNow < deadline)
            await Task.Delay(10);
        Assert.Equal(1.0, Volatile.Read(ref last), precision: 3);
    }

    [Fact]
    public async Task UploadAsync_unsupported_file_throws_before_any_api_call()
    {
        var api = new FakeKoboApiClient();
        var orchestrator = new UploadOrchestrator(api);

        await Assert.ThrowsAsync<UnsupportedFileException>(() =>
            orchestrator.UploadAsync(EpubFile("notes.docx"), progress: null, CancellationToken.None));
        Assert.Empty(api.Calls);
    }

    [Fact]
    public async Task FinalizeAsync_without_bundle_throws()
    {
        var orchestrator = new UploadOrchestrator(new FakeKoboApiClient());

        await Assert.ThrowsAsync<InvalidOperationException>(() => orchestrator.FinalizeAsync(CancellationToken.None));
    }

    [Fact]
    public async Task FinalizeAsync_with_bundle_calls_api_with_bundle_id()
    {
        var api = new FakeKoboApiClient();
        var orchestrator = new UploadOrchestrator(api);
        await orchestrator.EnsureBundleAsync(CancellationToken.None);

        var result = await orchestrator.FinalizeAsync(CancellationToken.None);

        Assert.Contains("Finalize", api.Calls);
        Assert.Equal(api.Bundle.Id, result.TmpBookBundleId);
    }

    [Fact]
    public async Task Reset_clears_current_bundle()
    {
        var api = new FakeKoboApiClient();
        var orchestrator = new UploadOrchestrator(api);
        await orchestrator.EnsureBundleAsync(CancellationToken.None);
        Assert.NotNull(orchestrator.CurrentBundle);

        orchestrator.Reset();

        Assert.Null(orchestrator.CurrentBundle);
    }
}
