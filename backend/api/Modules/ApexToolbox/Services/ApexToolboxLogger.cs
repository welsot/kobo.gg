using api.Modules.ApexToolbox.Config;
using api.Modules.ApexToolbox.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace api.Modules.ApexToolbox.Services;

public class ApexToolboxLogger : IApexToolboxLogger
{
    private readonly HttpClient _httpClient;
    private readonly ApexToolboxSettings _settings;
    private readonly ILogger<ApexToolboxLogger> _logger;

    public ApexToolboxLogger(HttpClient httpClient, IOptions<ApexToolboxSettings> settings, ILogger<ApexToolboxLogger> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        
        _httpClient.Timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);
    }

    public async Task SendLogAsync(HttpRequestData requestData, CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled || string.IsNullOrEmpty(_settings.Token))
        {
            return;
        }

        try
        {
            var payload = new
            {
                method = requestData.Method,
                uri = requestData.Uri,
                headers = requestData.Headers,
                payload = requestData.Payload,
                status_code = requestData.StatusCode,
                response = requestData.Response,
                ip_address = requestData.IpAddress,
                duration = requestData.Duration,
                logs = requestData.Logs.Select(log => new
                {
                    time = log.Time,
                    level = log.Level,
                    message = log.Message,
                    context = log.Context
                }).ToArray()
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            using var request = new HttpRequestMessage(HttpMethod.Post, _settings.EndpointUrl)
            {
                Content = content
            };

            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _settings.Token);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            // Silent failure - we don't throw exceptions if the request fails
        }
        catch (Exception ex)
        {
            // Log the error but don't throw - silent failure as per Symfony bundle behavior
            _logger.LogWarning(ex, "Failed to send log data to ApexToolbox");
        }
    }
}