# CLAUDE.md - Assistant Guidelines for kobo.gg Backend

## Commands
- Build: `dotnet build api/api.csproj`
- Run: `dotnet run --project api/api.csproj`
- Docker: `docker-compose -f compose.yml up --build`
- Migrations: `dotnet ef migrations add [Name] --project api` and `dotnet ef database update --project api`

## Code Style
- **Imports**: System first, Microsoft second, project namespaces last
- **Formatting**: 4 spaces indentation, braces on same line
- **Types**: Use `var` when type is obvious, explicit types for properties
- **Naming**: PascalCase for classes/methods, camelCase for parameters, IPrefix for interfaces, _prefix for private fields
- **Error Handling**: Try-catch for external calls, return appropriate HTTP status codes
- **Architecture**: Modular with Controllers, Models, Repositories, DTOs separated
- **Database**: EF Core with PostgreSQL, snake_case table names
- **Dependencies**: Use dependency injection for all services

## Project Structure
The backend follows a modular approach with clear separation between layers:
- Controllers handle HTTP requests
- Repositories abstract data access
- Models define entities and validation
- DTOs for data transfer between layers