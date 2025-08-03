namespace api.Modules.ApexToolbox.Config;

public class ApexToolboxSettings
{
    public string Token { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public string EndpointUrl { get; set; } = "https://apextoolbox.com/api/v1/logs";
    public int TimeoutSeconds { get; set; } = 1;
}