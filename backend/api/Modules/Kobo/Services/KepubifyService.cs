using System.Diagnostics;
using System.Text;

namespace api.Modules.Kobo.Services;

public class KepubifyService
{
    private readonly string _executablePath;
    private readonly ILogger<KepubifyService> _logger;

    public KepubifyService(
        string executablePath,
        ILogger<KepubifyService> logger
    )
    {
        _executablePath = executablePath;
        _logger = logger;
    }

    public async Task ConvertAsync(string inputPath, string outputPath)
    {
        if (!File.Exists(inputPath))
        {
            throw new FileNotFoundException($"Input file not found at path: {inputPath}");
        }

        // Verify file has proper extension
        if (!inputPath.EndsWith(".epub", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Input file does not have .epub extension: {Path}", inputPath);
        }

        // For kepubify v4.0.4, we can specify the exact output path
        _logger.LogDebug("Running kepubify with input: {InputPath}, output: {OutputPath}", 
            inputPath, outputPath);
            
        // Ensure output directory exists
        string outputDir = Path.GetDirectoryName(outputPath) ?? Path.GetTempPath();
        if (!Directory.Exists(outputDir))
        {
            Directory.CreateDirectory(outputDir);
        }
        
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = _executablePath,
                // v4.0.4 uses -o to specify the output file directly with verbose flag
                Arguments = $"-v -o \"{outputPath}\" \"{inputPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false
            }
        };

        StringBuilder output = new();
        StringBuilder error = new();

        process.OutputDataReceived += (sender, args) =>
        {
            if (args.Data != null)
            {
                output.AppendLine(args.Data);
            }
        };

        process.ErrorDataReceived += (sender, args) =>
        {
            if (args.Data != null)
            {
                error.AppendLine(args.Data);
            }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            _logger.LogError("Kepubify conversion failed with exit code {ExitCode}. Error: {Error}",
                process.ExitCode, error.ToString());
            throw new Exception($"Kepubify conversion failed with exit code {process.ExitCode}. Error: {error}");
        }

        // Kepubify creates output with the pattern: {original-name}.kepub.epub
        // Let's find the actual output file
        string inputFileName = Path.GetFileNameWithoutExtension(inputPath);
        string expectedOutputFile = Path.Combine(
            Path.GetDirectoryName(outputPath) ?? Path.GetTempPath(),
            $"{inputFileName}.kepub.epub");
            
        if (!File.Exists(expectedOutputFile))
        {
            _logger.LogError("Output file was not created at expected path: {Path}", expectedOutputFile);
            
            // Try to find any .kepub.epub file in the output directory
            string finalOutputDir = Path.GetDirectoryName(outputPath) ?? Path.GetTempPath();
            var kepubFiles = Directory.GetFiles(finalOutputDir, "*-kepub.epub");
            
            if (kepubFiles.Length > 0)
            {
                _logger.LogInformation("Found alternative kepub file: {Path}", kepubFiles[0]);
                expectedOutputFile = kepubFiles[0];
            }
            else
            {
                var tmpFiles = Directory.GetFiles(finalOutputDir);
                var tmpFilesString = string.Join(", ", tmpFiles);
                throw new FileNotFoundException($"Output file was not created at path: {expectedOutputFile} or any of the following: {tmpFilesString}");
            }
        }
        
        // If file exists but it's different from what we expected, rename it
        if (expectedOutputFile != outputPath && File.Exists(expectedOutputFile))
        {
            File.Copy(expectedOutputFile, outputPath, true);
            _logger.LogDebug("Renamed kepub file from {Source} to {Destination}", expectedOutputFile, outputPath);
            
            // Delete the original file after successful copy
            try
            {
                File.Delete(expectedOutputFile);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete original kepub file: {Path}", expectedOutputFile);
            }
        }

        _logger.LogInformation("Kepubify conversion successful. Output: {Output}", output.ToString().Trim());
    }
}