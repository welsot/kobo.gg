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

    public async Task<string> RenderViewToStringAsync<TDto>(string viewName, TDto dto)
    {
        string viewPath = $"api.Resources.EmailTemplates.{viewName}.cshtml";
        string result = await _engine.CompileRenderAsync(viewPath, dto);
        return result;
    }
}