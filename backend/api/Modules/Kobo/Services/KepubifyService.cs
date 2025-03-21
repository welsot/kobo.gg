using System.Diagnostics;

namespace api.Modules.Kobo.Services;

public class KepubifyService 
{
    private readonly string _executablePath;
    
    public KepubifyService(string executablePath) 
    {
        _executablePath = executablePath;
    }
    
    public async Task ConvertAsync(string inputPath, string outputPath) 
    {
        var process = new Process 
        {
            StartInfo = new ProcessStartInfo 
            {
                FileName = _executablePath,
                Arguments = $"\"{inputPath}\" \"{outputPath}\"",
                RedirectStandardOutput = true,
                UseShellExecute = false
            }
        };
        
        process.Start();
        await process.WaitForExitAsync();
    }
}
