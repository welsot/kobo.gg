using System;
using System.ComponentModel.DataAnnotations;

namespace api.Modules.Kobo.DTOs;

public class EpubUploadUrlRequestDto
{
    [Required]
    public Guid TmpBookBundleId { get; set; }
    
    [Required]
    [StringLength(255)]
    public string FileName { get; set; }
    
    [Required]
    [StringLength(255)]
    public string ContentType { get; set; }
}