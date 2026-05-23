using System.Net;
using KoboGg.Api;
using Xunit;

namespace KoboGg.Tests;

public class ApiExceptionTests
{
    [Fact]
    public void FromHttp_known_machine_code_maps_to_friendly_message()
    {
        var ex = ApiException.FromHttp(HttpStatusCode.InternalServerError, "unexpected_server_error");
        Assert.Equal("Something went wrong on the server. Please retry.", ex.UserMessage);
    }

    [Fact]
    public void FromHttp_human_readable_code_is_surfaced_directly()
    {
        var ex = ApiException.FromHttp(HttpStatusCode.BadRequest, "That bundle has already expired.");
        Assert.Equal("That bundle has already expired.", ex.UserMessage);
    }

    [Fact]
    public void FromHttp_unknown_machine_code_falls_back_to_status_message()
    {
        // No space => treated as a machine code, so the status drives the message.
        var ex = ApiException.FromHttp(HttpStatusCode.BadRequest, "some_machine_code");
        Assert.Equal("The server rejected the request. Please retry.", ex.UserMessage);
    }

    [Theory]
    [InlineData(HttpStatusCode.NotFound, "Your upload session was not found. Start over.")]
    [InlineData(HttpStatusCode.TooManyRequests, "Too many requests. Wait a moment and retry.")]
    [InlineData(HttpStatusCode.InternalServerError, "Something went wrong on the server. Please retry.")]
    [InlineData(HttpStatusCode.ServiceUnavailable, "The server is temporarily unavailable. Please retry.")]
    public void FromHttp_status_fallbacks_when_no_code(HttpStatusCode status, string expected)
    {
        var ex = ApiException.FromHttp(status, code: null);
        Assert.Equal(expected, ex.UserMessage);
        Assert.Equal(status, ex.StatusCode);
    }

    [Fact]
    public void FromHttp_unmapped_status_uses_generic_fallback()
    {
        var ex = ApiException.FromHttp(HttpStatusCode.Conflict, code: null);
        Assert.Equal("Unexpected error (409). Please retry.", ex.UserMessage);
    }

    [Fact]
    public void Network_and_Timeout_factories_set_status_zero_and_messages()
    {
        var network = ApiException.Network(new System.Exception());
        var timeout = ApiException.Timeout(new System.Exception());

        Assert.Equal(0, (int)network.StatusCode);
        Assert.Equal("No internet connection. Check your network and try again.", network.UserMessage);
        Assert.Equal(0, (int)timeout.StatusCode);
        Assert.Equal("The request timed out. Try again.", timeout.UserMessage);
    }
}
