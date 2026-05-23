using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace KoboGg.Models;

public sealed class PickedFile
{
    private readonly Func<CancellationToken, Task<Stream>> _openRead;

    public PickedFile(string name, long length, string contentType, Func<CancellationToken, Task<Stream>> openRead)
    {
        Name = name;
        Length = length;
        ContentType = contentType;
        _openRead = openRead;
    }

    public string Name { get; }
    public long Length { get; }
    public string ContentType { get; }

    public Task<Stream> OpenReadAsync(CancellationToken ct) => _openRead(ct);
}
