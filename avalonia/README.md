# Kobo.gg — Avalonia Mobile App

Cross-platform .NET (Avalonia UI) client for the kobo.gg backend. Targets
Android, iOS, Desktop, and Browser. Read [`GOAL.md`](./GOAL.md) before
implementing — it is the source of truth for architecture, API contract,
UX, and error handling.

## Quick start

```bash
# One-time
dotnet workload install android
dotnet workload install ios          # macOS only for device builds
dotnet new install Avalonia.Templates # already done if this repo built

# Restore
dotnet restore KoboGg.slnx

# Desktop (fastest dev loop)
dotnet run --project KoboGg.Desktop/KoboGg.Desktop.csproj

# Android (emulator must be running; API base URL becomes http://10.0.2.2:8080 in dev)
dotnet build KoboGg.Android/KoboGg.Android.csproj -t:Run

# iOS simulator (macOS only)
dotnet build KoboGg.iOS/KoboGg.iOS.csproj -t:Run

# Browser (WASM smoke test)
dotnet run --project KoboGg.Browser/KoboGg.Browser.csproj
```

## Layout

- `KoboGg/` — shared app (ViewModels, Views, Services, Api, DTOs).
- `KoboGg.Desktop/` — Windows/Linux/macOS head.
- `KoboGg.Android/` — Android head.
- `KoboGg.iOS/` — iOS head.
- `KoboGg.Browser/` — WASM head.
- `Directory.Packages.props` — central package versions. Add NuGets here.
- `KoboGg.slnx` — solution file (modern .slnx format).

## API contract

Defined by the backend at `backend/api/Modules/Kobo/` — see
[`GOAL.md` §3](./GOAL.md#3-backend-contract-the-only-api-surface-this-app-uses).
The flow is: create bundle → presigned upload URL → PUT to S3 → confirm →
finalize → display short code.

## Status

MVP implemented. The shared `KoboGg` library contains the three-screen flow
(Upload → Review → Success) on top of an `UploadOrchestrator` that drives the
real `kobo.gg` backend (bundle → presigned PUT → confirm → finalize).

- `KoboGg.Desktop` and `KoboGg.Browser` build clean.
- `KoboGg.Android` and `KoboGg.iOS` build once you `dotnet workload install android`
  (and `ios` on macOS).
- Dev API base URL is `http://localhost:8080` for desktop / iOS simulator,
  `http://10.0.2.2:8080` for the Android emulator. Release builds talk to
  `https://kobo.gg`.

See [`GOAL.md`](./GOAL.md) for the architecture and contract specs.
