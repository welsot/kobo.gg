## Commands

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

```bash
dotnet add package Microsoft.EntityFrameworkCore.Tools
```