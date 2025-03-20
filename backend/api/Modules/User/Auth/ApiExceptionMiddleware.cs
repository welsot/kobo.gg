namespace api.Modules.User.Auth;

public class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ApiExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var authPolicy = ApiTokenAuthOptions.DefaultScheme;
            if (ex.Message.Contains($"The AuthorizationPolicy named: '{authPolicy}'") || 
                context.Response.StatusCode == 401)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { code = "auth_required" });
            }
            else
            {
                throw;
            }
        }
    }
}
