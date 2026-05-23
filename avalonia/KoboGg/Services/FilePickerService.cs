using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Avalonia.Platform.Storage;
using KoboGg.Models;

namespace KoboGg.Services;

public sealed class FilePickerService : IFilePickerService
{
    // Extension -> content-type. Mirrors backend EpubUploadController.SupportedFileTypes.
    public static readonly IReadOnlyDictionary<string, string> SupportedTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".txt",   "text/plain" },
            { ".epub",  "application/epub+zip" },
            { ".kepub", "application/epub+zip" },
            { ".mobi",  "application/x-mobipocket-ebook" },
            { ".pdf",   "application/pdf" },
            { ".cbz",   "application/vnd.comicbook+zip" },
            { ".cbr",   "application/vnd.comicbook-rar" },
        };

    private readonly ITopLevelAccessor _topLevel;

    public FilePickerService(ITopLevelAccessor topLevel)
    {
        _topLevel = topLevel;
    }

    public static string? GetContentTypeFor(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) return null;
        return SupportedTypes.TryGetValue(ext, out var contentType) ? contentType : null;
    }

    public async Task<IReadOnlyList<PickedFile>> PickBooksAsync(CancellationToken ct)
    {
        var top = _topLevel.Current
            ?? throw new InvalidOperationException("File picker is not available before the view has loaded.");

        var ebookType = new FilePickerFileType("eBooks")
        {
            Patterns = new[] { "*.epub", "*.kepub", "*.mobi", "*.pdf", "*.txt", "*.cbz", "*.cbr" },
            MimeTypes = new[]
            {
                "application/epub+zip",
                "application/x-mobipocket-ebook",
                "application/pdf",
                "text/plain",
                "application/vnd.comicbook+zip",
                "application/vnd.comicbook-rar",
            },
            AppleUniformTypeIdentifiers = new[]
            {
                "org.idpf.epub-container",
                "com.adobe.pdf",
                "public.plain-text",
                "public.data",
            },
        };

        var files = await top.StorageProvider.OpenFilePickerAsync(new FilePickerOpenOptions
        {
            Title = "Pick books to send",
            AllowMultiple = true,
            FileTypeFilter = new[] { ebookType, FilePickerFileTypes.All },
        });

        ct.ThrowIfCancellationRequested();

        if (files is null || files.Count == 0)
        {
            return Array.Empty<PickedFile>();
        }

        var result = new List<PickedFile>(files.Count);
        foreach (var file in files)
        {
            ct.ThrowIfCancellationRequested();

            string name = file.Name;
            long length = 0;
            try
            {
                var props = await file.GetBasicPropertiesAsync();
                length = checked((long)(props.Size ?? 0UL));
            }
            catch
            {
                length = 0;
            }

            var contentType = GetContentTypeFor(name)
                ?? throw new UnsupportedFileException(name);

            var fileRef = file;
            async Task<Stream> Open(CancellationToken innerCt)
            {
                innerCt.ThrowIfCancellationRequested();
                return await fileRef.OpenReadAsync();
            }

            result.Add(new PickedFile(name, length, contentType, Open));
        }

        return result;
    }
}

public sealed class UnsupportedFileException : Exception
{
    public string FileName { get; }

    public UnsupportedFileException(string fileName)
        : base($"\"{fileName}\" is not a supported book file. Accepted: .epub, .kepub, .mobi, .pdf, .txt, .cbz, .cbr.")
    {
        FileName = fileName;
    }
}
