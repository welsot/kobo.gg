namespace api.Modules.Email.Services;

public interface IRazorViewRenderer
{
    Task<string> RenderViewToStringAsync<TModel>(string viewName, TModel model);
}