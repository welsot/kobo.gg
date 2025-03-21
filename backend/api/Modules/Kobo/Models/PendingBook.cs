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
    public string S3Key { get; private set; }

    [Required]
    [ForeignKey("TmpBookBundleId")]
    public virtual TmpBookBundle TmpBookBundle { get; private set; }

    public Guid TmpBookBundleId { get; private set; }

    [Column]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    [Column]
    public DateTime ExpiresAt { get; private set; }

    private PendingBook() { }

    public PendingBook(Guid id, TmpBookBundle tmpBookBundle, string fileName, string s3Key)
    {
        Id = id;
        TmpBookBundle = tmpBookBundle;
        FileName = fileName;
        S3Key = s3Key;
        ExpiresAt = DateTime.UtcNow.AddHours(24);
    }
}