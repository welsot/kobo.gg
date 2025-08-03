namespace api.Modules.ApexToolbox.Models;

public class ApexToolboxLogEntry
{
    public DateTime Time { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, object> Context { get; set; } = new();
}