namespace api.Modules.Kobo.DTOs;

public class EpubUploadUrlResponseDto
{
    public string Url { get; set; }
    public string Key { get; set; }
    public System.Guid PendingBookId { get; set; }
}