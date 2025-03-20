using api.Data;
using api.Modules.User.Auth;

using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Components = new OpenApiComponents
                {
                    SecuritySchemes = new Dictionary<string, OpenApiSecurityScheme>
                    {
                        ["ApiToken"] = new OpenApiSecurityScheme
                        {
                            Type = SecuritySchemeType.ApiKey,
                            In = ParameterLocation.Header,
                            Name = "X-API-TOKEN",
                            Description = "API token authentication"
                        }
                    },
                };

                document.SecurityRequirements = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "ApiToken" }
                            },
                            Array.Empty<string>()
                        }
                    }
                };
                
                return Task.CompletedTask;
            });
        });

        // Configure the database context
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Modules
        builder.Services.AddCommonServices();
        builder.Services.AddUserServices();
        builder.Services.AddEmailServices(builder.Configuration);

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        // Enable authentication and authorization
        //app.UseMiddleware<ApiExceptionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}