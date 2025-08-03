using api.Modules.ApexToolbox.Config;
using api.Modules.ApexToolbox.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace api.Modules.ApexToolbox.Services;

public class ApexToolboxLogger : IApexToolboxLogger
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ApexToolboxSettings _settings;
    private readonly ILogger<ApexToolboxLogger> _logger;

    public ApexToolboxLogger(IHttpClientFactory httpClientFactory, IOptions<ApexToolboxSettings> settings, ILogger<ApexToolboxLogger> logger)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendLogAsync(HttpRequestData requestData, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("ApexToolboxLogger: SendLogAsync called. Enabled: {Enabled}, HasToken: {HasToken}", 
            _settings.Enabled, !string.IsNullOrEmpty(_settings.Token));
            
        if (!_settings.Enabled || string.IsNullOrEmpty(_settings.Token))
        {
            _logger.LogWarning("ApexToolboxLogger: Skipping - Enabled: {Enabled}, Token present: {HasToken}", 
                _settings.Enabled, !string.IsNullOrEmpty(_settings.Token));
            return;
        }

        try
        {
            using var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);
            
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

            _logger.LogInformation("ApexToolboxLogger: Sending POST to {Url}", _settings.EndpointUrl);
            
            using var response = await httpClient.SendAsync(request, cancellationToken);
            
            _logger.LogInformation("ApexToolboxLogger: Response received - Status: {StatusCode}", response.StatusCode);
            
            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("ApexToolboxLogger: Non-success response - {StatusCode}: {Content}", 
                    response.StatusCode, responseContent);
            }
        }
        catch (Exception ex)
        {
            // Log the error but don't throw - silent failure as per Symfony bundle behavior
            _logger.LogError(ex, "ApexToolboxLogger: Failed to send log data to ApexToolbox");
        }
    }
}