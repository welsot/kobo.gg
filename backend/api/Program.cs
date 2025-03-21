using api.Data;
using api.Modules.Storage;
using api.Modules.User.Auth;

using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.IO;

namespace api;

public class Program
{
    public static void Main(string[] args)
    {
        // Load .env file if it exists
        var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
        if (File.Exists(envFile))
        {
            DotNetEnv.Env.Load(envFile);
        }
        
        var builder = WebApplication.CreateBuilder(args);
        
        // Add environment variables to configuration
        builder.Configuration.AddEnvironmentVariables();

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
        builder.Services.AddStorageServices(builder.Configuration);

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseMiddleware<ApiExceptionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseCors(corsBuilder => corsBuilder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());

        app.MapControllers();

        app.Run();
    }
}