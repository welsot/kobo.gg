using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace KoboGg.Services;

internal sealed class ProgressStream : Stream
{
    private readonly Stream _inner;
    private readonly long _total;
    private readonly IProgress<double>? _progress;
    private long _read;
    private double _lastReported = -1;

    public ProgressStream(Stream inner, long total, IProgress<double>? progress)
    {
        _inner = inner;
        _total = total;
        _progress = progress;
    }

    public override bool CanRead => _inner.CanRead;
    public override bool CanSeek => false;
    public override bool CanWrite => false;
    public override long Length => _total;
    public override long Position
    {
        get => _read;
        set => throw new NotSupportedException();
    }

    public override void Flush() => _inner.Flush();

    public override int Read(byte[] buffer, int offset, int count)
    {
        var n = _inner.Read(buffer, offset, count);
        Advance(n);
        return n;
    }

    public override async Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken ct)
    {
        var n = await _inner.ReadAsync(buffer.AsMemory(offset, count), ct);
        Advance(n);
        return n;
    }

    public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken ct = default)
    {
        var n = await _inner.ReadAsync(buffer, ct);
        Advance(n);
        return n;
    }

    private void Advance(int n)
    {
        if (n <= 0 || _total <= 0 || _progress is null) return;
        _read += n;
        var ratio = Math.Clamp((double)_read / _total, 0d, 1d);
        // Throttle: only emit when the integer-percent changes.
        if (ratio - _lastReported >= 0.01 || ratio >= 1.0)
        {
            _lastReported = ratio;
            _progress.Report(ratio);
        }
    }

    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
    public override void SetLength(long value) => throw new NotSupportedException();
    public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

    protected override void Dispose(bool disposing)
    {
        if (disposing) _inner.Dispose();
        base.Dispose(disposing);
    }
}
