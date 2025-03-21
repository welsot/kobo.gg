FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["api.csproj", "./"]
RUN dotnet restore "api.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
# Generate migration bundle
RUN dotnet tool restore
RUN dotnet ef migrations bundle --project "api.csproj" --configuration Release --self-contained --force -o /app/migration-bundle --target-runtime linux-x64

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=publish /app/migration-bundle ./migration-bundle

# Switch to root to install kepubify
USER root
RUN apt-get update && apt-get install -y curl
RUN curl -L https://github.com/pgaskin/kepubify/releases/download/v4.0.4/kepubify-linux-64bit -o /usr/local/bin/kepubify && \
    chmod +x /usr/local/bin/kepubify
# Switch back to non-root user
USER $APP_UID

ENTRYPOINT ["dotnet", "api.dll"]
