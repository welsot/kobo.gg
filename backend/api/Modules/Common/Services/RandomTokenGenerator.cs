using System.Security.Cryptography;

namespace api.Modules.Common.Services;

public static class RandomTokenGenerator
{
    public static string GenerateRandomToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var tokenData = new byte[16];
        rng.GetBytes(tokenData);
        return Convert.ToBase64String(tokenData);
    }

    public static string GenerateOneTimePassword()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}