using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Modules.Kobo.Models;

[Table("pending_book")]
public class PendingBook
{
    [Key]
    [Column]
    public Guid Id { get; private set; }

    [Required]
    [Column]
    [StringLength(255)]
    public string FileName { get; private set; }

    [Required]
    [Column]
    [StringLength(255)]
    public string OriginalFileName { get; private set; }

    [Required]
    [Column]
    public long FileSize { get; private set; }

    [Required]
    [Column]
    [StringLength(255)]
    public string S3Key { get; private set; }

    [Column]
    [StringLength(255)]
    public string? KepubS3Key { get; private set; }

    [Required]
    [ForeignKey("TmpBookBundleId")]
    public virtual TmpBookBundle TmpBookBundle { get; private set; }

    public Guid TmpBookBundleId { get; private set; }

    [Column]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    [Column]
    public DateTime ExpiresAt { get; private set; }

    private PendingBook() { }

    public PendingBook(Guid id, TmpBookBundle tmpBookBundle, string fileName, string originalFileName, long fileSize, string s3Key)
    {
        Id = id;
        TmpBookBundle = tmpBookBundle;
        FileName = fileName;
        OriginalFileName = originalFileName;
        FileSize = fileSize;
        S3Key = s3Key;
        ExpiresAt = DateTime.UtcNow.AddHours(24);
    }

    public void SetKepubS3Key(string kepubS3Key)
    {
        KepubS3Key = kepubS3Key;
    }
}