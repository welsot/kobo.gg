using System.ComponentModel.DataAnnotations;

namespace api.Modules.Kobo.DTOs;

public record FinalizeBooksRequestDto(
    [Required] Guid TmpBookBundleId
);