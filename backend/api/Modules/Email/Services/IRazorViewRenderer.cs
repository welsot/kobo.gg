namespace api.Modules.Email.Services;

public interface IRazorViewRenderer
{
    Task<string> RenderViewToStringAsync<TDto>(string viewName, TDto dto);
}