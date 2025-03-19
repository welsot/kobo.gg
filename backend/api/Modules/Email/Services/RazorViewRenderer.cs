using RazorLight;
using System.Reflection;

namespace api.Modules.Email.Services;

public class RazorViewRenderer : IRazorViewRenderer
{
    private readonly RazorLightEngine _engine;

    public RazorViewRenderer()
    {
        _engine = new RazorLightEngineBuilder()
            .UseEmbeddedResourcesProject(Assembly.GetAssembly(typeof(RazorViewRenderer)))
            .UseMemoryCachingProvider()
            .Build();
    }

    public async Task<string> RenderViewToStringAsync<TModel>(string viewName, TModel model)
    {
        string viewPath = $"EmailTemplates/{viewName}.cshtml";
        string result = await _engine.CompileRenderAsync(viewPath, model);
        return result;
    }
}