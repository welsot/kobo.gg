using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using api.Data;
using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Models;
using api.Modules.Kobo.Repository;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace api.Tests.Integration.Kobo.Controllers
{
    public class BookControllerTests : ApiTestBase
    {
        private readonly ApplicationDbContext _dbContext;
        
        public BookControllerTests(TestApiFactory factory) : base(factory)
        {
            _dbContext = CreateDbContext();
        }
        
        [Fact]
        public async Task FinalizeBooks_ShouldReturn200_WhenBundleExists()
        {
            // Arrange
            using var scope = Factory.Services.CreateScope();
            var tmpBundleRepo = scope.ServiceProvider.GetRequiredService<ITmpBookBundleRepository>();
            var pendingBookRepo = scope.ServiceProvider.GetRequiredService<IPendingBookRepository>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var bundle = new TmpBookBundle(Guid.NewGuid(), "abc123");
            tmpBundleRepo.Add(bundle);
            await dbContext.SaveChangesAsync();
            
            var pendingBook = await pendingBookRepo.CreateAsync(bundle, "test.epub", "test-key");
            
            // Act
            var response = await Client.PostAsJsonAsync(
                "/api/kobo/books/finalize", 
                new FinalizeBooksRequestDto(bundle.Id));
            
            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var result = await response.Content.ReadFromJsonAsync<FinalizeBooksResponseDto>();
            Assert.NotNull(result);
            Assert.Equal(bundle.Id, result!.TmpBookBundleId);
            // In the test environment, the actual S3 operations are often mocked
            // so we just check that a response with the correct bundle ID was returned
            Assert.Equal(1, result.ConvertedCount);
        }
        
        [Fact]
        public async Task FinalizeBooks_ShouldReturn404_WhenBundleDoesNotExist()
        {
            // Act
            var response = await Client.PostAsJsonAsync(
                "/api/kobo/books/finalize", 
                new FinalizeBooksRequestDto(Guid.NewGuid()));
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}