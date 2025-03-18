# Integration Tests for Kobo.gg API

This directory contains integration tests for the Kobo.gg API. These tests use:

1. **xUnit** - Testing framework
2. **TestContainers** - For spinning up PostgreSQL in Docker containers
3. **WebApplicationFactory** - For hosting the API during tests
4. **Respawn** - For cleaning the database between tests

## Test Setup

The tests are designed to run in isolation with the following characteristics:

1. Each test creates a PostgreSQL container using TestContainers
2. Tests run against a real database with EF Core migrations
3. Between tests, the database is reset using Respawn
4. Transactions wrap each test for isolation

## Running Tests

To run the tests:

```bash
dotnet test Tests/Integration/TestProject.csproj
```

## Note on Setup

Currently there are build issues with the test project due to project structure. 
For a real implementation, you should create a separate test project:

```bash
dotnet new xunit -n KoboTests
dotnet sln add KoboTests
```

Then add the proper references and imports.

## Test Example Implementation

The test files demonstrate:

1. `TestApiFactory.cs` - Sets up the API and database container
2. `ApiTestBase.cs` - Base class for all API tests with helper methods
3. `UserRegistrationControllerTests.cs` - Tests for the user registration endpoint

This follows the industry-standard approach with isolated tests that use real database interactions.