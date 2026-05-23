using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Models;

namespace KoboGg.Services;

public interface IFilePickerService
{
    Task<IReadOnlyList<PickedFile>> PickBooksAsync(CancellationToken ct);
}
