using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using api.Modules.Common.Services;

namespace api.Modules.Kobo.Services;

public class FileNameConverter
{
    static readonly Dictionary<char, string> TransliterationMap = Transliteration.GetMap();

    public static string ConvertToSafeFileName(string originalFileName)
    {
        string extension = Path.GetExtension(originalFileName);
        var fileName = Path.GetFileNameWithoutExtension(originalFileName.ToLowerInvariant());

        // Clean the name before transliteration
        fileName = ShortenName(fileName);

        // Apply transliteration
        StringBuilder result = new ();
        foreach (char c in fileName)
        {
            if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'))
            {
                result.Append(c);
            }
            else if (TransliterationMap.TryGetValue(c, out string? replacement) && replacement != null)
            {
                result.Append(replacement);
            }
            else
            {
                string normalized = c.ToString().Normalize(NormalizationForm.FormD);
                bool nonMarkAppended = false;

                foreach (char nc in normalized)
                {
                    if (CharUnicodeInfo.GetUnicodeCategory(nc) != UnicodeCategory.NonSpacingMark)
                    {
                        if ((nc >= 'a' && nc <= 'z') || (nc >= '0' && nc <= '9'))
                        {
                            result.Append(nc);
                            nonMarkAppended = true;
                        }
                        else
                        {
                            result.Append('-');
                            nonMarkAppended = true;
                        }
                    }
                }

                if (!nonMarkAppended)
                {
                    result.Append('-');
                }
            }
        }

        string sanitized = Regex.Replace(result.ToString(), "-{2,}", "-");
        sanitized = sanitized.Trim('-');

        if (string.IsNullOrEmpty(sanitized))
        {
            sanitized = "unknown-file";
        }

        string randomCode = RandomTokenGenerator.GenerateShortUrlCode(3);
        var candidateBookTitle = $"{sanitized}-kobogg-{randomCode}{extension}";
        
        // if still pretty long - remove kobogg
        if (candidateBookTitle.Length > 200)
        {
            candidateBookTitle = $"{sanitized}-{randomCode}{extension}";
        }

        return candidateBookTitle;
    }

    private static string ShortenName(string input)
    {
        string output = input;

        // Remove ISBN numbers (typically 10 or 13 digits)
        output = Regex.Replace(output, @"\b\d{10,13}\b", "");

        // Remove likely hashes (32 or more hex characters)
        output = Regex.Replace(output, @"\b[a-f0-9]{32,}\b", "");

        // Replace double dashes with single dash
        output = output.Replace("--", "-");

        // Replace multiple spaces or dashes
        output = Regex.Replace(output, @"[-\s]{2,}", "-");

        // Trim again
        output = output.Trim('-', ' ');

        return output;
    }
}
