using Microsoft.AspNetCore.Authorization;

namespace api.Modules.User.Auth;

public class ApiTokenRequiredAttribute : AuthorizeAttribute
{
    public ApiTokenRequiredAttribute() : base(ApiTokenAuthOptions.DefaultScheme)
    {
    }
}