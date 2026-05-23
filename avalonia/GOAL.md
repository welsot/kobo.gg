# Kobo.gg Avalonia Mobile App — Implementation Plan

> **Audience:** the next coding agent. Read this entire document before touching any code.
> Goal: produce a **production-ready** Avalonia UI cross-platform app (Android + iOS,
> with Desktop kept as a free dev surface) that lets a user pick `.epub` / `.mobi` /
> `.pdf` / `.txt` / `.cbz` / `.cbr` files on their device and ship them to a Kobo
> e-reader via the existing `kobo.gg` backend. The end-of-flow result is a short
> code (e.g. `kobo.gg/ab12cd`) that the user types on the e-reader's browser.

---

## 1. Why this exists

The `kobo.gg` service already runs in production with three pieces:

- **Backend** — `backend/api` (ASP.NET Core, .NET 10). Issues short codes, signs S3
  uploads, runs `kepubify` server-side to produce a Kobo-friendly variant.
- **Web UI** — `frontend/` (React Router v7 + Tailwind). The reference UX.
- **Mobile** — `mobile/` (Tauri + React). Earlier attempt. Functional but ergonomically
  awkward on mobile (Tauri Android tooling friction, large dependency surface).
  **It will be replaced by this Avalonia app.** Do not modify it; only mine it for
  UX reference.

The Avalonia app must replicate the web flow exactly (bundle → presigned PUT →
confirm → finalize → short code) but with a UI tuned for touch.

## 2. Non-negotiables (read carefully)

These are hard constraints the user called out and the rest of this doc presumes them:

1. **Same flow as the web app.** No new endpoints, no flow shortcuts, no "let's
   change the contract." Mirror `frontend/app/components/BookUploader.tsx`.
2. **DTOs everywhere.** All over-the-wire payloads use C# `record` DTOs that
   mirror the backend's DTOs 1:1 (see §4). No anonymous types or `JsonElement`
   leakage into the ViewModel / View layers.
3. **Every error is shown to the user.** Network errors, S3 PUT failures,
   validation errors, file-too-large, no-internet, server 5xx — each must surface
   as a human-readable message inside the app. Never silently swallow. Never
   `throw` unhandled across an async boundary that touches the UI.
4. **Simple, minimal UI.** Three screens: Upload → Review → Success. No flashy
   animations, no particle backgrounds (the Tauri app overdid this). Use the
   default Avalonia `FluentTheme` and let it breathe.
5. **Great touch UX.** Big tap targets (≥ 48dp), one primary action per screen,
   safe-area-aware on iOS, system back button on Android works correctly.
6. **MVVM, no code-behind logic.** Views are XAML + minimal partial class. All
   state and behavior lives in `ViewModel`s using `CommunityToolkit.Mvvm`
   (`[ObservableProperty]`, `[RelayCommand]`).
7. **Cancellation tokens everywhere.** Every async API and IO call accepts a
   `CancellationToken`. Wire them so screen navigation / app suspension can cancel
   in-flight uploads cleanly.
8. **No secrets in the repo.** API base URL is configurable per build; sensible
   default is `https://kobo.gg`.

## 3. Backend contract (the only API surface this app uses)

Base URL: `https://kobo.gg` (prod). For local dev, the user runs the API on
`http://localhost:8080` (see root `README.md`). The API exposes a small,
unauthenticated surface for the upload flow.

### 3.1 Create bundle
- `POST /api/kobo/bundles`
- Request body: *(none)*
- Response `201 Created` → `TmpBookBundleDto`
  ```json
  { "id": "guid", "shortUrlCode": "ab12cd", "expiresAt": "2026-05-23T..." }
  ```
- Errors: `500` with `{ "code": "unexpected_server_error" }`.

### 3.2 Request presigned upload URL
- `POST /api/epub/upload-url`
- Request body (`EpubUploadUrlRequestDto`):
  ```json
  {
    "tmpBookBundleId": "guid",
    "fileName": "my book.epub",
    "contentType": "application/epub+zip"
  }
  ```
- Response `200 OK` (`EpubUploadUrlResponseDto`):
  ```json
  { "url": "https://...presigned...", "key": "bundleId/.../safe.epub", "pendingBookId": "guid" }
  ```
- Errors: `400` (`{ "code": "Invalid request parameters" }` or similar
  human-readable), `404` (bundle missing — usually means expired).

### 3.3 Upload the file (direct to S3/LocalStack)
- `PUT <presigned url>` with body = raw file bytes
- Header: `Content-Type: <same value sent to /upload-url>`
- Response: `2xx` on success. **No JSON body.** Anything else is an upload failure
  the user must see.

### 3.4 Confirm upload (triggers server-side kepubify)
- `POST /api/epub/confirm-upload/{pendingBookId}`
- Request body: *(none)*
- Response `200 OK` → `{ "id": "<pendingBookId>" }`
- Errors: `400` if S3 object missing, `404` if pendingBook missing, `500` if
  kepubify conversion blows up.

### 3.5 Finalize bundle
- `POST /api/kobo/books/finalize`
- Request body (`FinalizeBooksRequestDto`):
  ```json
  { "tmpBookBundleId": "guid" }
  ```
- Response `200 OK` (`FinalizeBooksResponseDto`):
  ```json
  { "convertedCount": 3, "tmpBookBundleId": "guid" }
  ```
- Errors: `400`, `404`, `500`.

### 3.6 Error response shape
All non-2xx JSON responses from the API use:
```json
{ "code": "machine_or_human_string" }
```
Note that some endpoints return the error in a human-readable form and others
return a code (`unexpected_server_error`). The client should display `code` as
is, but **map known codes** (e.g. `unexpected_server_error` → "Something went
wrong on the server, please retry.") before showing.

### 3.7 Content types — single source of truth
File extension → `Content-Type` mapping (must match
`EpubUploadController.SupportedFileTypes`):

| ext   | content type                       |
|-------|------------------------------------|
| .txt  | text/plain                         |
| .epub | application/epub+zip               |
| .kepub| application/epub+zip               |
| .mobi | application/x-mobipocket-ebook     |
| .pdf  | application/pdf                    |
| .cbz  | application/vnd.comicbook+zip      |
| .cbr  | application/vnd.comicbook-rar      |

Files with unknown extensions are rejected client-side with a clear error.
(The server tolerates them but renames to `.epub`; we want to be explicit.)

## 4. Solution structure

```
avalonia/
├── GOAL.md                       <-- this document
├── README.md                     <-- short build / run guide (write this)
├── .gitignore                    <-- standard dotnet ignore
├── Directory.Packages.props      <-- central package versions
├── KoboGg.slnx                   <-- solution
│
├── KoboGg/                       <-- shared library (the actual app)
│   ├── KoboGg.csproj             (TargetFramework=net10.0)
│   ├── App.axaml / .cs           (already scaffolded — wire DI here)
│   ├── ViewLocator.cs            (already scaffolded)
│   ├── Assets/                   (icons, fonts; replace avalonia-logo.ico)
│   │
│   ├── Api/                      <-- HTTP layer
│   │   ├── IKoboApiClient.cs
│   │   ├── KoboApiClient.cs
│   │   ├── ApiException.cs       (one exception, carries StatusCode + Code + UserMessage)
│   │   └── Dtos/
│   │       ├── TmpBookBundleDto.cs
│   │       ├── EpubUploadUrlRequestDto.cs
│   │       ├── EpubUploadUrlResponseDto.cs
│   │       ├── ConfirmUploadResponseDto.cs   (wraps GuidResponse)
│   │       ├── FinalizeBooksRequestDto.cs
│   │       ├── FinalizeBooksResponseDto.cs
│   │       └── ErrorResponseDto.cs
│   │
│   ├── Services/                 <-- app-level services
│   │   ├── IFilePickerService.cs       (abstracts IStorageProvider)
│   │   ├── FilePickerService.cs
│   │   ├── IUploadOrchestrator.cs      (bundle → upload-url → PUT → confirm)
│   │   ├── UploadOrchestrator.cs
│   │   ├── IClipboardService.cs
│   │   ├── ClipboardService.cs
│   │   ├── IAppConfig.cs               (exposes ApiBaseUrl, AppEnv)
│   │   └── AppConfig.cs
│   │
│   ├── Models/                   <-- in-memory model types (NOT DTOs)
│   │   ├── PickedFile.cs               (Name, Length, Stream factory, ContentType)
│   │   └── UploadedBook.cs             (Id, FileName, SizeBytes, Status)
│   │
│   ├── ViewModels/
│   │   ├── ViewModelBase.cs
│   │   ├── MainWindowViewModel.cs       (hosts navigation stack)
│   │   ├── UploadViewModel.cs           (screen 1)
│   │   ├── ReviewViewModel.cs           (screen 2)
│   │   └── SuccessViewModel.cs          (screen 3)
│   │
│   └── Views/
│       ├── MainWindow.axaml             (desktop chrome)
│       ├── MainView.axaml               (mobile + desktop content host)
│       ├── UploadView.axaml
│       ├── ReviewView.axaml
│       └── SuccessView.axaml
│
├── KoboGg.Android/               <-- Android head (net10.0-android)
├── KoboGg.iOS/                   <-- iOS head (net10.0-ios)
├── KoboGg.Desktop/               <-- Desktop head (net10.0)
└── KoboGg.Browser/               <-- Browser head — KEEP, free smoke test surface
```

Delete the scaffolded `KoboGg/ViewModels/MainViewModel.cs` and the stock
`Greeting` binding once your new ViewModels are in place. Replace
`Assets/avalonia-logo.ico` with the kobo logo (`frontend/public/img/icon.512.png`
is a good source).

## 5. Architecture rules (must follow)

### 5.1 Layering
```
Views   →   ViewModels   →   Services   →   Api (HTTP + DTOs)
```
- Views import only `ViewModels` types.
- ViewModels import `Services` and `Models`. **They never reference `Api/Dtos`
  directly.** Services are the boundary that converts DTO ⇄ Model.
- Services import `Api` and `Models`.
- `Api/` knows nothing about ViewModels or UI.

### 5.2 DI
Use `Microsoft.Extensions.DependencyInjection`. Build the container in
`App.OnFrameworkInitializationCompleted` before constructing the first view.

```csharp
var services = new ServiceCollection();
services.AddSingleton<IAppConfig, AppConfig>();
services.AddSingleton<HttpClient>(_ => new HttpClient { BaseAddress = new Uri(config.ApiBaseUrl) });
services.AddSingleton<IKoboApiClient, KoboApiClient>();
services.AddSingleton<IUploadOrchestrator, UploadOrchestrator>();
services.AddSingleton<IFilePickerService, FilePickerService>();
services.AddSingleton<IClipboardService, ClipboardService>();
services.AddTransient<UploadViewModel>();
services.AddTransient<ReviewViewModel>();
services.AddTransient<SuccessViewModel>();
services.AddSingleton<MainWindowViewModel>();
ServiceProvider = services.BuildServiceProvider();
```

The `ViewLocator` already maps `FooViewModel` → `FooView` by name — keep that.

### 5.3 HTTP client
- **One** `HttpClient` per process (long-lived). Pass it into `KoboApiClient`.
- Use `System.Net.Http.Json` (`PostAsJsonAsync`, `ReadFromJsonAsync`).
- Use snake-free PascalCase DTOs; configure `JsonSerializerOptions` with
  `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (the backend serializes
  camelCase — verified in the existing frontend schemas).
- Every method on `IKoboApiClient` takes a `CancellationToken`.
- Failure mapping (centralized in `KoboApiClient`):
  - 2xx + parseable JSON → return DTO.
  - 2xx + empty body → return `Unit` / nothing.
  - non-2xx → try to parse `ErrorResponseDto`; throw `ApiException` with
    `StatusCode`, raw `Code`, and a **user-facing message** (mapped from known
    codes or defaulted by status).
  - Network exception (`HttpRequestException`, `TaskCanceledException` that is
    NOT user cancellation) → throw `ApiException` with `StatusCode = 0` and
    `UserMessage = "No internet connection. Check your network and try again."`
- The S3 PUT goes through the same `HttpClient` but with an **absolute** URL
  (the presigned URL). Do not send `Authorization` or default headers on it.
  Only send `Content-Type`. Avalonia's stream upload should be `StreamContent`.

### 5.4 Upload orchestrator
`IUploadOrchestrator` owns the multi-step dance so ViewModels stay thin:

```csharp
public interface IUploadOrchestrator
{
    Task<TmpBookBundleDto> EnsureBundleAsync(CancellationToken ct);
    Task<UploadedBook> UploadAsync(
        TmpBookBundleDto bundle,
        PickedFile file,
        IProgress<double> progress,
        CancellationToken ct);
    Task<FinalizeBooksResponseDto> FinalizeAsync(
        TmpBookBundleDto bundle, CancellationToken ct);
}
```

`UploadAsync` does, in order:
1. Resolve `Content-Type` from extension (use §3.7 table; reject unknown).
2. `POST /api/epub/upload-url`.
3. `PUT` the presigned URL with the file stream and progress reporting.
4. `POST /api/epub/confirm-upload/{pendingBookId}`.
5. Return an `UploadedBook` shaped for the UI.

If any step throws, surface the error and **do not** retry implicitly. Let the
user retry from the UI.

### 5.5 Progress reporting
Use `IProgress<double>` (0.0–1.0). For the S3 PUT, wrap the file stream in a
`ProgressStream` that reports bytes-read against total length. Do NOT use
`XmlHttpRequest`-style fudges; pure `HttpClient` + custom stream works fine on
all heads.

### 5.6 Cancellation & lifecycle
- Each ViewModel owns a `CancellationTokenSource` reset on screen entry.
- On screen exit / app suspension, cancel it.
- Android: handle `OnTrimMemory` / `OnPause` to cancel large uploads gracefully
  (the orchestrator already responds to `CancellationToken`).

### 5.7 File picking
- Use `TopLevel.GetTopLevel(control).StorageProvider.OpenFilePickerAsync(...)`.
- Pass `AllowMultiple = true` and `FileTypeFilter` constructed from the §3.7
  ext list. Provide a single "eBooks" filter and an "All files" fallback.
- For each `IStorageFile`, open a stream via `OpenReadAsync()`. Determine
  `Length` from properties (`GetBasicPropertiesAsync().Size`) — do NOT buffer
  the whole file into memory. Stream straight to S3.

## 6. Dependencies to add

Add to `Directory.Packages.props`:

```xml
<PackageVersion Include="Microsoft.Extensions.DependencyInjection" Version="9.0.0" />
<PackageVersion Include="Microsoft.Extensions.Http" Version="9.0.0" />
<PackageVersion Include="System.Net.Http.Json" Version="9.0.0" />
```

(`CommunityToolkit.Mvvm` is already there. `HttpClient` and friends are in the
BCL but we use the DI integration packages for clean wiring.)

Add `<PackageReference Include="..." />` (no version) to `KoboGg/KoboGg.csproj`.

## 7. UX specification

### 7.1 Screen 1 — Upload
- Title: "Send books to your Kobo"
- Subtitle: "Pick e-books to upload. We'll give you a short code to open on your e-reader."
- Big primary button: **"Choose files"** (full-width on mobile, centered on desktop).
- Below: live list of already-picked-and-uploaded files in this session, each
  with name + size + an X to remove (calls `apiConfirmUpload` is **not** undone
  server-side; client just hides the file from the review list. Acceptable
  trade-off — same as the web app).
- Bottom: secondary button **"Continue →"** disabled until ≥ 1 file uploaded.
- Bundle creation happens lazily on first file pick (NOT on app start) so the
  user doesn't burn bundles by opening the app. Cache the bundle in
  `UploadOrchestrator` so subsequent picks reuse it.
- During upload: show file name + progress bar. Disable picker.
- Error banner: red, dismissible, with full message + a "Retry" affordance
  where it makes sense.

### 7.2 Screen 2 — Review
- Title: "Review"
- Subtitle: "These books will be sent to your e-reader."
- List of uploaded books (name, size, remove).
- Two buttons:
  - "← Add more" (back to Upload)
  - **"Send to Kobo"** primary — calls `Finalize`.
- During finalize: button spins, disable both buttons.
- On success: navigate to Screen 3.
- On error: show error banner, keep user on Review so they can retry.

### 7.3 Screen 3 — Success
- Big check icon.
- "Your books are ready"
- Two large copy-to-clipboard targets:
  - **Short code:** `ab12cd` (display in a big mono font)
  - **Full URL:** `kobo.gg/ab12cd`
- Tap-to-copy on either; show toast "Copied" for 2s.
- Instruction text: "Open kobo.gg on your e-reader and enter the short code."
- Button: "Send more books" → resets state (new bundle next time) and goes to
  Screen 1.

### 7.4 Look & feel
- Use `FluentTheme` defaults. Light/dark follows system.
- Accent: kobo purple `#7C4DFF` (Tauri app uses similar). Apply via
  `Application.Resources` overriding `SystemAccentColor`.
- Spacing: 16 dp default padding; 24 dp between sections.
- Typography: keep Avalonia's `Inter` font default. Headings `H1` 24sp, body 16sp.
- Buttons: minimum height 48 dp; primary buttons use `Theme="{StaticResource AccentButton}"`.
- Safe areas (iOS notch / Android system bars): wrap root view in
  `SafeAreaPadding` (Avalonia 12 exposes `TopLevel.InsetsManager`). Subscribe
  and apply padding in code-behind of `MainView`.

## 8. Error handling strategy (be exhaustive)

| Scenario                                       | UX                                                    |
|------------------------------------------------|-------------------------------------------------------|
| No network at app start                        | First action that needs the network shows an error banner with retry. Don't hard-fail at startup. |
| `POST /bundles` 500                            | Banner: "Couldn't start a new upload session. Retry?"  |
| Bundle expired mid-flow (`/upload-url` 404)    | Banner: "Your upload session expired. Start over." → button resets state. |
| Unsupported file picked                        | Banner naming the file + listing accepted extensions. |
| S3 PUT non-2xx                                 | Banner: "Couldn't upload <file>. Retry?" Keep already-uploaded files. |
| Confirm 400 ("file not found")                 | Banner: "Upload didn't reach our storage. Retry?"     |
| Confirm 500 (kepubify failed)                  | Banner: "We couldn't process <file>. It may be corrupt." Keep the file marked failed; do NOT abort the bundle. Allow continuing. |
| Finalize 4xx/5xx                               | Banner on Review screen, stay put, allow retry.       |
| User cancels (background, screen exit)         | Silent, no banner.                                    |
| App relaunched mid-upload                      | State is in-memory only; user starts over. (Acceptable per current web parity.) |

Each banner gets a "Dismiss" X. Banners use `Avalonia.Controls.TextBlock`
wrapped in a styled `Border` — no custom controls needed.

Centralize the "exception → user message" mapping in
`ApiException.GetUserMessage()` so views never branch on status codes.

## 9. Platform notes

### 9.1 Android
- Min SDK 23 (template default). Bump to 24 if any used API requires it.
- The template's `AndroidPackageFormat=apk` is fine for dev. For Play Store
  release, switch to `aab`.
- `MainActivity` already extends `AvaloniaMainActivity<App>`. No edits needed
  for the MVP.
- Permissions: file picker uses Storage Access Framework — no explicit
  `READ_EXTERNAL_STORAGE` permission needed on modern Android.
- Build: `dotnet workload install android` is required (the user will need to
  run this — flag it in `README.md`).

### 9.2 iOS
- Build: `dotnet workload install ios` required.
- `Info.plist` already exists. Add:
  - `NSDocumentsFolderUsageDescription` = "Kobo.gg uses Files to read the books you choose to send to your Kobo."
- Provisioning is out of scope for this agent — leave `KoboGg.iOS.csproj`
  buildable, defer signing to the user.

### 9.3 Desktop
- Keep as the primary inner-loop platform. `dotnet run --project
  KoboGg.Desktop/KoboGg.Desktop.csproj` should always work and use the same
  `MainView`.

### 9.4 Browser
- The template scaffolds it; do not delete it. It's a free WASM build that
  helps catch platform-coupling regressions. Don't optimize for it; just keep
  it building.

## 10. Configuration

`AppConfig` exposes:
- `ApiBaseUrl` — `https://kobo.gg` in Release, `http://10.0.2.2:8080` for
  Android emulator dev (the alias to the host machine), `http://localhost:8080`
  for Desktop dev, `http://localhost:8080` for iOS simulator. Decide at runtime
  using `OperatingSystem.IsAndroid()` / `IsIOS()` + `#if DEBUG`.

Hard-code these defaults in `AppConfig.cs`. Do NOT introduce `appsettings.json`
or env-var plumbing for the MVP — Avalonia mobile apps have no clean settings
pipeline and this is overkill for two URLs.

## 11. Build & run commands

Put these in `avalonia/README.md`:

```bash
# One-time setup (host machine)
dotnet workload install android
dotnet workload install ios       # macOS only for device builds
dotnet new install Avalonia.Templates  # already done if you scaffolded

# Restore
dotnet restore KoboGg.slnx

# Desktop dev loop
dotnet run --project KoboGg.Desktop/KoboGg.Desktop.csproj

# Android (emulator must be running)
dotnet build KoboGg.Android/KoboGg.Android.csproj -t:Run

# iOS simulator (macOS)
dotnet build KoboGg.iOS/KoboGg.iOS.csproj -t:Run

# Browser
dotnet run --project KoboGg.Browser/KoboGg.Browser.csproj
```

## 12. Definition of done

The next agent's PR is done when **all** of these are true:

- [ ] `dotnet build KoboGg.slnx` succeeds on all heads (after workloads installed).
- [ ] Desktop run: full flow works against `https://kobo.gg` and against a local
      backend (`http://localhost:8080`).
- [ ] Android emulator run: full flow works against `http://10.0.2.2:8080`.
- [ ] iOS simulator run: build succeeds; flow works against `http://localhost:8080`.
      (Device run is the user's responsibility — provisioning.)
- [ ] Every error path from §8 has been manually exercised (kill network mid
      upload, pick `.docx`, etc.) and produces a clear in-app message.
- [ ] No `Console.WriteLine` debug spew, no commented-out code, no TODOs in
      hot paths.
- [ ] `KoboGg/Api/Dtos/*` records exactly match backend DTOs (verify against
      `backend/api/Modules/Kobo/DTOs/`).
- [ ] No business logic in code-behind. ViewModels are testable in isolation
      (constructor injection only).
- [ ] App icon set on Android (`Resources/drawable/Icon.png`) and iOS
      (`Resources/Assets.xcassets`). Use `frontend/public/img/icon.512.png`.
- [ ] Bundle creation is lazy (first file pick), not eager (app start).
- [ ] No third-party MVVM frameworks beyond `CommunityToolkit.Mvvm`. No
      Prism / ReactiveUI / DryIoc.

## 13. What NOT to do

- ❌ Don't reach for `ReactiveUI`. The template ships with
  `CommunityToolkit.Mvvm` — that's the chosen stack.
- ❌ Don't copy the Tauri app's animated background / framer-motion vibes.
  The user explicitly asked for minimalistic.
- ❌ Don't introduce a settings file, env vars, or build-time config injection.
  Two URLs in `AppConfig.cs`.
- ❌ Don't make the API base URL user-editable. It's a single-purpose app.
- ❌ Don't store any local cache / DB. State is in-memory.
- ❌ Don't change anything in `backend/`, `frontend/`, or `mobile/`. This is a
  greenfield client.
- ❌ Don't implement auth. The relevant endpoints are anonymous.
- ❌ Don't add unit tests for trivial getters; do add tests for
  `UploadOrchestrator` and `KoboApiClient` (mocking `HttpMessageHandler`).
  Tests project name: `KoboGg.Tests`, framework xUnit, kept tiny.

## 14. Recommended implementation order

1. Replace the scaffolded `MainViewModel`/`MainView` with the navigation host
   (`MainWindowViewModel` for desktop, `MainView` containing a `ContentControl`
   that swaps between the three screen ViewModels).
2. Drop in DTOs (§4 file list) — these are pure records, fastest to verify.
3. Build `KoboApiClient` + `ApiException`. Unit test it against
   `HttpMessageHandler` fakes covering each error path.
4. Build `UploadOrchestrator` on top. Unit test the orchestration.
5. Build `FilePickerService` and `ClipboardService` (thin Avalonia wrappers).
6. Build `UploadView` + `UploadViewModel`. Wire DI. Hit "Choose files" against
   the real backend.
7. Build `ReviewView` + `ReviewViewModel`. Finalize against the real backend.
8. Build `SuccessView` + `SuccessViewModel`. Verify on a Kobo device.
9. Polish: icons, safe areas, accent color, banners.
10. Manual error matrix run-through (§8).

## 15. References (inside this repo)

- Backend DTOs: `backend/api/Modules/Kobo/DTOs/`
- Backend controllers: `backend/api/Modules/Kobo/Controllers/`
- Reference web flow: `frontend/app/components/BookUploader.tsx`
- Reference web schemas: `frontend/app/api/apiSchemas.ts` (camelCase-on-wire)
- Tauri mobile (do NOT modify): `mobile/src/App.tsx`,
  `mobile/src/components/BookList.tsx`, `mobile/src/components/SuccessScreen.tsx`
- Icons: `frontend/public/img/icon.*.png`

---

**Scaffolding status when this doc was written**

- `avalonia/` was created via `dotnet new avalonia.xplat -n KoboGg` (Avalonia
  templates `12.0.3`). Solution `KoboGg.slnx` and four heads are in place.
- `KoboGg.Desktop` builds clean (`dotnet build KoboGg.Desktop/KoboGg.Desktop.csproj`).
- Android / iOS heads have NOT been built yet — they require workloads.
- Central package management (`Directory.Packages.props`) is set up; add new
  packages there, not in individual csproj files.
