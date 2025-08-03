using api.Modules.ApexToolbox.Models;
using System.Collections.Concurrent;

namespace api.Modules.ApexToolbox.Services;

public static class LogBuffer
{
    private static readonly ConcurrentDictionary<string, List<ApexToolboxLogEntry>> _requestLogs = new();

    public static void AddLog(string requestId, ApexToolboxLogEntry logEntry)
    {
        _requestLogs.AddOrUpdate(requestId, 
            new List<ApexToolboxLogEntry> { logEntry },
            (key, existingLogs) =>
            {
                lock (existingLogs)
                {
                    existingLogs.Add(logEntry);
                }
                return existingLogs;
            });
    }

    public static List<ApexToolboxLogEntry> FlushLogs(string requestId)
    {
        if (_requestLogs.TryRemove(requestId, out var logs))
        {
            return logs;
        }
        
        return new List<ApexToolboxLogEntry>();
    }

    public static void ClearLogs(string requestId)
    {
        _requestLogs.TryRemove(requestId, out _);
    }
}