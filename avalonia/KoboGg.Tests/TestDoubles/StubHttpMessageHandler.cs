using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace KoboGg.Tests.TestDoubles;

/// <summary>
/// A test <see cref="HttpMessageHandler"/> that returns whatever the supplied delegate produces,
/// and records every request it sees so tests can assert on method/URI/body.
/// </summary>
internal sealed class StubHttpMessageHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;

    public List<HttpRequestMessage> Requests { get; } = new();

    public StubHttpMessageHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler)
        => _handler = handler;

    public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
        : this((req, _) => Task.FromResult(handler(req)))
    {
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Requests.Add(request);
        return _handler(request, cancellationToken);
    }
}
