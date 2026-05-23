using System;

namespace KoboGg.Services;

public sealed class AppConfig : IAppConfig
{
    public Uri ApiBaseUrl { get; }
    public string ShortUrlHost => "kobo.gg";

    public AppConfig()
    {
        ApiBaseUrl = ResolveApiBaseUrl();
    }

    private static Uri ResolveApiBaseUrl()
    {
#if DEBUG
        if (OperatingSystem.IsAndroid())
        {
            // 10.0.2.2 is the Android emulator alias for the host machine.
            return new Uri("http://10.0.2.2:8080");
        }
        if (OperatingSystem.IsIOS() || OperatingSystem.IsMacCatalyst())
        {
            return new Uri("http://localhost:8080");
        }
        return new Uri("http://localhost:8080");
#else
        return new Uri("https://kobo.gg");
#endif
    }
}
