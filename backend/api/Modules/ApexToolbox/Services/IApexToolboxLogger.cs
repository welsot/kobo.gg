using api.Modules.ApexToolbox.Models;

namespace api.Modules.ApexToolbox.Services;

public interface IApexToolboxLogger
{
    Task SendLogAsync(HttpRequestData requestData, CancellationToken cancellationToken = default);
}