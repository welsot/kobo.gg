using api.Modules.User.DTOs;

namespace api.Modules.Common.DTO;

public record ApiTokenResponse(string Token, UserDto User);