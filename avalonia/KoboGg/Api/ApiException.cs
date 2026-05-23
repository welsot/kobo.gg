using System;
using System.Net;

namespace KoboGg.Api;

public sealed class ApiException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string? Code { get; }
    public string UserMessage { get; }

    public ApiException(HttpStatusCode statusCode, string? code, string userMessage, Exception? inner = null)
        : base(userMessage, inner)
    {
        StatusCode = statusCode;
        Code = code;
        UserMessage = userMessage;
    }

    public static ApiException Network(Exception inner) => new(
        statusCode: 0,
        code: null,
        userMessage: "No internet connection. Check your network and try again.",
        inner: inner);

    public static ApiException Timeout(Exception inner) => new(
        statusCode: 0,
        code: null,
        userMessage: "The request timed out. Try again.",
        inner: inner);

    public static ApiException FromHttp(HttpStatusCode status, string? code) => new(
        statusCode: status,
        code: code,
        userMessage: MapMessage(status, code));

    private static string MapMessage(HttpStatusCode status, string? code)
    {
        if (!string.IsNullOrWhiteSpace(code))
        {
            switch (code)
            {
                case "unexpected_server_error":
                    return "Something went wrong on the server. Please retry.";
            }

            // Backend returns human-readable strings for most validation/404 errors —
            // surface them directly when they don't look like a machine code.
            if (LooksHumanReadable(code))
            {
                return code!;
            }
        }

        return status switch
        {
            HttpStatusCode.BadRequest => "The server rejected the request. Please retry.",
            HttpStatusCode.NotFound => "Your upload session was not found. Start over.",
            HttpStatusCode.RequestTimeout => "The request timed out. Try again.",
            HttpStatusCode.TooManyRequests => "Too many requests. Wait a moment and retry.",
            HttpStatusCode.InternalServerError => "Something went wrong on the server. Please retry.",
            HttpStatusCode.BadGateway or HttpStatusCode.ServiceUnavailable or HttpStatusCode.GatewayTimeout =>
                "The server is temporarily unavailable. Please retry.",
            _ => $"Unexpected error ({(int)status}). Please retry."
        };
    }

    private static bool LooksHumanReadable(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        return code.Contains(' ', StringComparison.Ordinal);
    }
}
