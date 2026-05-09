## Commands

- **Run Tests:**
  ```bash
  dotnet test api.Tests
  ```

### Packages

#### Adding and Restoring Packages

To add and restore packages in a .NET project, use the following commands:

- **Add a package:**
  ```bash
  dotnet add package <PackageName>
  ```
- **Restore all packages (defined in the project file):**
  ```bash
  dotnet restore
  ```

### Database

#### Development Environment

- **Create a new migration:**
  ```bash
  dotnet ef migrations add <MigrationName>
  ```

- **Apply migrations and update the database:**
  ```bash
  dotnet ef database update
  ```

- **Remove the last migration (if not applied to the database yet):**
  ```bash
  dotnet ef migrations remove
  ```

- **Drop the database:**
  ```bash
  dotnet ef database drop
  ```

#### Production Environment

We use EF Core migration bundles for production deployment.

- **Generate a migration bundle:**
  ```bash
  ./generate-migration-bundle.sh
  ```

- **Apply migrations in production:**
  ```bash
  # Apply migrations using the migrations service
  docker compose --profile migrations up migrations
  ```

This runs the migrations service defined in compose.yml which uses the self-contained migration bundle.

```bash
dotnet add package Microsoft.EntityFrameworkCore.Tools
```