namespace api.Modules.ApexToolbox.Models;

public class HttpRequestData
{
    public string Method { get; set; } = string.Empty;
    public string Uri { get; set; } = string.Empty;
    public Dictionary<string, string[]> Headers { get; set; } = new();
    public object? Payload { get; set; }
    public int StatusCode { get; set; }
    public object? Response { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public double Duration { get; set; }
    public List<ApexToolboxLogEntry> Logs { get; set; } = new();
}