using System;

namespace KoboGg.Services;

public interface IAppConfig
{
    Uri ApiBaseUrl { get; }
    string ShortUrlHost { get; }
}
