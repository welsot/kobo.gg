using api.Modules.User.DTOs;
using api.Modules.User.Exceptions;
using api.Modules.User.Repository;

namespace api.Modules.User.Services;

public class UserMapper(IUserRepository users)
{
    public UserDto Map(Models.User user)
    {
        return new UserDto(
            Id: user.Id,
            Email: user.Email
        );
    }

    public async Task<UserDto> MapByUserId(string userId)
    {
        var user = await users.FindByIdAsync(userId);

        if (user == null) throw new UserNotFoundException();

        return Map(user);
    }
}