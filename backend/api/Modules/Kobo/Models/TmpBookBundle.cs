using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api.Modules.Common.Services;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.Kobo.Models;

[Table("tmp_book_bundle")]
[Index(nameof(ShortUrlCode), IsUnique = true)]
public class TmpBookBundle
{
    [Key]
    [Column]
    public Guid Id { get; private set; }

    [Required]
    [Column]
    [StringLength(10)]
    public string ShortUrlCode { get; private set; }

    [Column]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    [Column]
    public DateTime ExpiresAt { get; private set; }

    public virtual ICollection<Book> Books { get; private set; } = new List<Book>();

    private TmpBookBundle() { }

    public TmpBookBundle(Guid id, string shortUrlCode)
    {
        Id = id;
        ShortUrlCode = shortUrlCode;
        ExpiresAt = DateTime.UtcNow.AddHours(24);
    }
}