using api.Modules.ApexToolbox.Models;
using api.Modules.ApexToolbox.Services;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace api.Modules.ApexToolbox.Middleware;

public class ApexToolboxMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApexToolboxMiddleware> _logger;

    public ApexToolboxMiddleware(RequestDelegate next, ILogger<ApexToolboxMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = context.TraceIdentifier;
        var stopwatch = Stopwatch.StartNew();
        
        _logger.LogInformation("ApexToolbox: Processing request {Method} {Path}", context.Request.Method, context.Request.Path);
        
        // Capture request data
        var requestData = await CaptureRequestDataAsync(context.Request);
        
        // Create a custom response stream to capture response data
        var originalResponseBody = context.Response.Body;
        using var responseBodyStream = new MemoryStream();
        context.Response.Body = responseBodyStream;

        try
        {
            // Continue with the request pipeline
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // Capture response data
            var responseData = await CaptureResponseDataAsync(context.Response, responseBodyStream);
            
            // Copy response back to original stream
            responseBodyStream.Seek(0, SeekOrigin.Begin);
            await responseBodyStream.CopyToAsync(originalResponseBody);
            context.Response.Body = originalResponseBody;

            // Prepare and send log data
            var httpRequestData = new HttpRequestData
            {
                Method = context.Request.Method,
                Uri = GetFullUrl(context.Request),
                Headers = context.Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToArray()),
                Payload = requestData,
                StatusCode = context.Response.StatusCode,
                Response = responseData,
                IpAddress = GetRealIpAddress(context),
                Duration = stopwatch.Elapsed.TotalSeconds,
                Logs = LogBuffer.FlushLogs(requestId)
            };

            _logger.LogInformation("ApexToolbox: Captured request data - {Method} {Uri} {StatusCode} Duration: {Duration}s", 
                httpRequestData.Method, httpRequestData.Uri, httpRequestData.StatusCode, httpRequestData.Duration);
            
            // Debug log for headers
            var userAgent = httpRequestData.Headers.ContainsKey("User-Agent") ? 
                string.Join(", ", httpRequestData.Headers["User-Agent"]) : "Not found";
            _logger.LogInformation("ApexToolbox: User-Agent: {UserAgent}, IP: {IpAddress}", userAgent, httpRequestData.IpAddress);

            // Resolve the service before the background task to avoid context disposal issues
            var apexLogger = context.RequestServices.GetRequiredService<IApexToolboxLogger>();
            
            // Send log data asynchronously without blocking the response
            _ = Task.Run(async () =>
            {
                try
                {
                    _logger.LogInformation("ApexToolbox: Sending log data to ApexToolbox");
                    await apexLogger.SendLogAsync(httpRequestData);
                    _logger.LogInformation("ApexToolbox: Successfully sent log data");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "ApexToolbox: Failed to send log data");
                }
            });
        }
    }

    private async Task<object?> CaptureRequestDataAsync(HttpRequest request)
    {
        if (!request.HasFormContentType && request.ContentType?.Contains("application/json") == true)
        {
            request.EnableBuffering();
            var body = await new StreamReader(request.Body).ReadToEndAsync();
            request.Body.Position = 0;

            if (!string.IsNullOrEmpty(body))
            {
                try
                {
                    return JsonSerializer.Deserialize<object>(body);
                }
                catch
                {
                    return body;
                }
            }
        }
        else if (request.HasFormContentType)
        {
            return request.Form.ToDictionary(f => f.Key, f => f.Value.ToString());
        }

        return null;
    }

    private async Task<object?> CaptureResponseDataAsync(HttpResponse response, MemoryStream responseBodyStream)
    {
        if (responseBodyStream.Length == 0)
        {
            return null;
        }

        responseBodyStream.Seek(0, SeekOrigin.Begin);
        var responseContent = await new StreamReader(responseBodyStream).ReadToEndAsync();
        responseBodyStream.Seek(0, SeekOrigin.Begin);

        if (string.IsNullOrEmpty(responseContent))
        {
            return null;
        }

        // Try to parse as JSON
        if (response.ContentType?.Contains("application/json") == true)
        {
            try
            {
                return JsonSerializer.Deserialize<object>(responseContent);
            }
            catch
            {
                return responseContent;
            }
        }

        return responseContent;
    }

    private string GetFullUrl(HttpRequest request)
    {
        return $"{request.Scheme}://{request.Host}{request.PathBase}{request.Path}{request.QueryString}";
    }

    private string GetRealIpAddress(HttpContext context)
    {
        var headers = new[]
        {
            "CF-Connecting-IP",
            "X-Forwarded-For",
            "X-Real-IP",
            "X-Client-IP"
        };

        foreach (var header in headers)
        {
            if (context.Request.Headers.TryGetValue(header, out var value) && !string.IsNullOrEmpty(value))
            {
                var ip = value.ToString().Split(',')[0].Trim();
                if (System.Net.IPAddress.TryParse(ip, out var parsedIp) && !IsPrivateIpAddress(parsedIp))
                {
                    return ip;
                }
            }
        }

        var remoteIp = context.Connection.RemoteIpAddress?.ToString();
        
        // Convert IPv6 localhost to IPv4 localhost for better display
        if (remoteIp == "::1")
        {
            return "127.0.0.1";
        }
        
        return remoteIp ?? "127.0.0.1";
    }

    private bool IsPrivateIpAddress(System.Net.IPAddress ipAddress)
    {
        var bytes = ipAddress.GetAddressBytes();
        
        if (ipAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
        {
            return bytes[0] == 10 ||
                   (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) ||
                   (bytes[0] == 192 && bytes[1] == 168) ||
                   bytes[0] == 127;
        }
        
        return false;
    }
}