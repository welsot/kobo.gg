using System;

namespace KoboGg.Models;

public sealed class UploadedBook
{
    public UploadedBook(Guid id, string fileName, long sizeBytes)
    {
        Id = id;
        FileName = fileName;
        SizeBytes = sizeBytes;
    }

    public Guid Id { get; }
    public string FileName { get; }
    public long SizeBytes { get; }
}
