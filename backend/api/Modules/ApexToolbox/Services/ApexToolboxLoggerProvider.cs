using api.Modules.ApexToolbox.Models;
using Microsoft.Extensions.Options;
using System.Collections.Concurrent;

namespace api.Modules.ApexToolbox.Services;

public class ApexToolboxLoggerProvider : ILoggerProvider
{
    private readonly ConcurrentDictionary<string, ApexToolboxLoggerWrapper> _loggers = new();
    private readonly IServiceProvider _serviceProvider;

    public ApexToolboxLoggerProvider(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return _loggers.GetOrAdd(categoryName, name => new ApexToolboxLoggerWrapper(name, _serviceProvider));
    }

    public void Dispose()
    {
        _loggers.Clear();
    }
}

public class ApexToolboxLoggerWrapper : ILogger
{
    private readonly string _categoryName;
    private readonly IServiceProvider _serviceProvider;

    public ApexToolboxLoggerWrapper(string categoryName, IServiceProvider serviceProvider)
    {
        _categoryName = categoryName;
        _serviceProvider = serviceProvider;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logLevel != LogLevel.None;
    }

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var httpContext = _serviceProvider.GetService<IHttpContextAccessor>()?.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        var requestId = httpContext.TraceIdentifier;
        var message = formatter(state, exception);

        var logEntry = new ApexToolboxLogEntry
        {
            Time = DateTime.UtcNow,
            Level = logLevel.ToString().ToLower(),
            Message = message,
            Context = new Dictionary<string, object>
            {
                ["category"] = _categoryName,
                ["eventId"] = eventId.Id,
                ["eventName"] = eventId.Name ?? ""
            }
        };

        if (exception != null)
        {
            logEntry.Context["exception"] = new
            {
                type = exception.GetType().Name,
                message = exception.Message,
                stackTrace = exception.StackTrace
            };
        }

        LogBuffer.AddLog(requestId, logEntry);
    }
}