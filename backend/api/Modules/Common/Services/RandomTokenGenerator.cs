using System.Security.Cryptography;

namespace api.Modules.Common.Services;

public static class RandomTokenGenerator
{
    public static string GenerateRandomToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var tokenData = new byte[16];
        rng.GetBytes(tokenData);
        return Convert.ToHexString(tokenData);
    }

    public static string GenerateOneTimePassword()
    {
        return Random.Shared.Next(0, 999999).ToString("D6");
    }
    
    public static string GenerateShortUrlCode(int length = 3)
    {
        // some chars removed to avoid confusion e.g lI1i0O
        const string chars = "abcdefghkmnopqrstuwxyz23456789";
        var stringChars = new char[length];
        var random = new Random();

        for (int i = 0; i < length; i++)
        {
            stringChars[i] = chars[random.Next(chars.Length)];
        }

        return new string(stringChars);
    }
}