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

        // Convert to lowercase first (important for transliteration lookup)
        var fileName = Path.GetFileNameWithoutExtension(originalFileName.ToLowerInvariant());

        // Apply transliteration
        StringBuilder result = new StringBuilder();
        foreach (char c in fileName)
        {
            if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'))
            {
                // ASCII alphanumeric characters pass through unchanged
                result.Append(c);
            }
            else if (TransliterationMap.TryGetValue(c, out string? replacement) && replacement != null)
            {
                // Use our custom transliteration map
                result.Append(replacement);
            }
            else
            {
                // Try standard Unicode normalization to handle other diacritics
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
                            // Replace any other character with a hyphen
                            result.Append('-');
                            nonMarkAppended = true;
                        }
                    }
                }

                // If nothing was appended (completely unsupported character), add a hyphen
                if (!nonMarkAppended)
                {
                    result.Append('-');
                }
            }
        }

        // Replace consecutive hyphens with a single hyphen
        string sanitized = Regex.Replace(result.ToString(), "-{2,}", "-");

        // Trim any leading or trailing hyphens
        sanitized = sanitized.Trim('-');

        // If after all sanitization the string is empty, use a fallback
        if (string.IsNullOrEmpty(sanitized))
        {
            sanitized = "unknown-file";
        }

        // Generate random 3-character code
        string randomCode = RandomTokenGenerator.GenerateShortUrlCode(3);

        // Return the transformed filename with kobogg prefix and random code
        return $"{sanitized}-kobogg-{randomCode}{extension}";
    }
}