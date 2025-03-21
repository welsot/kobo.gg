using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Modules.Kobo.Models;

[Table("book")]
public class Book
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
    public string FilePath { get; private set; }

    [Required]
    [Column]
    public long FileSize { get; private set; }

    [Column]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    [Required]
    [ForeignKey("TmpBookBundleId")]
    public virtual TmpBookBundle TmpBookBundle { get; private set; }

    public Guid TmpBookBundleId { get; private set; }

    private Book() { }

    public Book(Guid id, TmpBookBundle tmpBookBundle, string fileName, string originalFileName, string filePath, long fileSize)
    {
        Id = id;
        FileName = fileName;
        OriginalFileName = originalFileName;
        FilePath = filePath;
        FileSize = fileSize;
        TmpBookBundle = tmpBookBundle;
    }
}