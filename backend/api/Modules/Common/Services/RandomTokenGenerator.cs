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
        return Random.Shared.Next(0, 999999).ToString("D6");
    }
}