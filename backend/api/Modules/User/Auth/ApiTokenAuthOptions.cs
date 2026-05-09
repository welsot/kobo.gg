using Microsoft.AspNetCore.Authentication;

namespace api.Modules.User.Auth;

public class ApiTokenAuthOptions : AuthenticationSchemeOptions
{
    public const string DefaultScheme = "ApiToken";
    public string Scheme => DefaultScheme;
    public string AuthenticationType = DefaultScheme;
}