# Kobo.gg Avalonia — Architecture & Conventions

> **Audience:** every developer (human or agent) adding features to this app.
> This document describes the patterns that are **already established and working** in the
> codebase and that you **must follow** when building new functionality. It is the
> "how we build here" companion to [`GOAL.md`](./GOAL.md) (the original product spec) and
> [`REFACTORING.md`](./REFACTORING.md) (known weaknesses and how to fix them).
>
> Rule of thumb: if you are about to write code that breaks a pattern below, stop and
> either follow the pattern or update this document with a deliberate, reviewed decision.

---

## 1. The layered architecture (non-negotiable)

The codebase enforces a strict, one-directional dependency flow:

```
Views (XAML + thin code-behind)
  │  bind only to ViewModel-exposed properties/commands
  ▼
ViewModels (CommunityToolkit.Mvvm)
  │  call Services; hold UI state; know Models, never DTOs
  ▼
Services (orchestration + platform wrappers)
  │  own the DTO ⇄ Model conversion boundary
  ▼
Api (HttpClient + record DTOs)
       knows nothing about UI, ViewModels, or Avalonia
```

**Hard rules:**

- **`Api/` is UI-agnostic.** It references no Avalonia type, no ViewModel, no Service. It
  speaks only `Api/Dtos/*` records and throws `ApiException`. See `Api/KoboApiClient.cs`.
- **DTOs do not leak upward.** `Api/Dtos/*` records are wire types. Services translate them
  into `Models/*` (e.g. `UploadOrchestrator.UploadAsync` returns a `UploadedBook` model, not
  a DTO). ViewModels work with `Models/*` and their own item-ViewModels.
- **ViewModels never `new` a Service or `HttpClient`.** Everything arrives via constructor
  injection. A ViewModel that compiles without the DI container is a ViewModel you can unit-test.
- **Views contain no business logic.** Code-behind is limited to `InitializeComponent()` and
  genuinely view-level concerns (e.g. safe-area insets in `MainView.axaml.cs`). No `if`
  branching on app state, no API calls, no navigation decisions in `*.axaml.cs`.

> One known, intentional relaxation: the Review screen binds its `ItemsControl` directly to
> `Model` instances (`UploadedBook`). Models are allowed in the View/ViewModel layers; DTOs are
> not. Prefer wrapping list items in an item-ViewModel (as `UploadView` does with
> `UploadItemViewModel`) — see `REFACTORING.md`.

---

## 2. Solution & project layout

| Project | Role | Notes |
|---|---|---|
| `KoboGg/` | The entire app: Views, ViewModels, Services, Api, Models | All real code lives here. Platform heads are thin shells. |
| `KoboGg.Desktop/` | Desktop head (`net10.0`) | **Primary inner-loop surface.** Must always run. |
| `KoboGg.Android/` | Android head (`net10.0-android`) | |
| `KoboGg.iOS/` | iOS head (`net10.0-ios`) | Full AOT + trimming on Release — see §11. |
| `KoboGg.Browser/` | WASM head | Free smoke test for platform-coupling regressions. Keep it building. |
| `KoboGg.Tests/` | xUnit tests (`net10.0`) | No Avalonia/Android bootstrap. Runs in milliseconds; the fast feedback loop for `Services`/`Api`/navigation logic. |

**Rule:** new code goes in `KoboGg/`. A platform head should only contain bootstrapping
(`Program.cs`, `MainActivity.cs`, `AppDelegate.cs`, manifests, icons). If you are tempted to
put logic in a head, you have a missing abstraction in `KoboGg/Services/` instead (see §10).

Packages are managed centrally in `Directory.Packages.props`. **Add a `<PackageVersion>` there
and a versionless `<PackageReference>` in the csproj** — never put a version in a csproj.

---

## 3. MVVM conventions

The stack is **`CommunityToolkit.Mvvm` only**. No ReactiveUI, no Prism, no DryIoc (see `GOAL.md §13`).

- **Source generators, not hand-rolled `INotifyPropertyChanged`.** Use `[ObservableProperty]`
  on private backing fields and `[RelayCommand]` on methods. Example: `UploadViewModel.cs`.
- **Derived properties via `[NotifyPropertyChangedFor]`.** When a computed getter (e.g.
  `CanContinue`, `HasError`) depends on an observable field, annotate the field so the getter
  re-raises. See `UploadViewModel._isBusy`.
- **Every ViewModel derives from `ViewModelBase`** (`: ObservableObject`). The `ViewLocator`
  matches on `ViewModelBase`, so a ViewModel that skips the base class won't get a view.
- **List rows get their own item-ViewModel** when they have per-row state (progress, status,
  error). `UploadItemViewModel` is the model to copy: it owns `Status`, `Progress`,
  `ErrorMessage`, and exposes presentation helpers like `SizeDisplay`.
- **Formatting belongs in the ViewModel, not the View.** `UploadItemViewModel.SizeDisplay`
  turns bytes into "1.4 MB". Don't scatter `StringFormat` math across XAML.

### Compiled bindings are mandatory

`AvaloniaUseCompiledBindingsByDefault=true` is set in `KoboGg.csproj`. Every view declares
`x:DataType` (e.g. `x:DataType="vm:UploadViewModel"`). This gives compile-time-checked bindings
and is required for trimming/AOT to work on mobile. **Never** add a binding without a backing
`x:DataType`, and never use a `ReflectionBinding` to "make it work."

### Thin code-behind

```csharp
public partial class UploadView : UserControl
{
    public UploadView() => InitializeComponent();
}
```

That is the entire expected body of a view's code-behind, with the sole exception of
`MainView.axaml.cs`, which wires platform insets and the `TopLevel`. If you need behaviour,
put it in the ViewModel and bind to a command.

---

## 4. Dependency injection

The container is `Microsoft.Extensions.DependencyInjection`. All registrations live in **one
composition root**, the `AddKoboGgServices()` extension (`ServiceCollectionExtensions.cs`), which
`App.OnFrameworkInitializationCompleted` → `BuildServices()` (`App.axaml.cs`) calls once, before the
first view is constructed. Keeping the registrations out of the Avalonia `App` lets the container be
built and validated with no UI bootstrap — see [§14 Testing](#14-testing).

**Rule:** add new registrations to `AddKoboGgServices()`, never inline in `App`. That keeps the
composition root in one testable place.

**Lifetime conventions in use:**

| Lifetime | Use for | Examples |
|---|---|---|
| `Singleton` | Process-wide services and **shared session state** | `HttpClient`, `IKoboApiClient`, `IUploadOrchestrator`, `UploadSession`, `IAppConfig`, `IFilePickerService`, `IClipboardService`, `ITopLevelAccessor`, `MainWindowViewModel` |
| `Transient` | Per-navigation screen ViewModels | `UploadViewModel`, `ReviewViewModel`, `SuccessViewModel` |

**Rules:**

- **Screen ViewModels are `Transient`** so each navigation gets a fresh instance with clean
  state. They rehydrate shared state from singletons (`UploadSession`, `IUploadOrchestrator`)
  on construction — see `UploadViewModel`'s constructor rebuilding `Items` from `_session.Books`.
- **Shared state lives in a singleton service**, never in a ViewModel. `UploadSession.Books`
  and `UploadOrchestrator.CurrentBundle` survive navigation precisely because the screen VMs are
  recreated and the state services are not.
- **Register against the interface**, resolve the interface (`IFilePickerService`, not
  `FilePickerService`). The one place a concrete type is registered is `MainWindowViewModel`,
  which is also exposed as `INavigationService` via a factory:
  ```csharp
  services.AddSingleton<MainWindowViewModel>();
  services.AddSingleton<INavigationService>(sp => sp.GetRequiredService<MainWindowViewModel>());
  ```
- **Prefer constructor injection over the service locator.** Resolving from
  `IServiceProvider` at call time (as `MainWindowViewModel.NavigateTo` does) is tolerated only
  for the navigation host, because it must create arbitrary VM types on demand. Do not copy that
  pattern into feature code — inject what you need. (`REFACTORING.md` proposes a typed VM factory.)

### ⚠ Keep ViewModel constructors side-effect-free

Do not run logic in a ViewModel constructor beyond storing injected dependencies. In
particular, **never resolve another ViewModel from the container during construction** —
either directly or indirectly through a service like `INavigationService`. Doing so risks a
silent, undebuggable hang on Android.

We hit this once. `MainWindowViewModel` is the navigation host **and** is also registered
as `INavigationService`. Its constructor called `NavigateTo<UploadViewModel>()`, which
resolved `UploadViewModel`. `UploadViewModel`'s constructor takes `INavigationService` →
back to the partially-constructed `MainWindowViewModel`. MS DI detected the cycle and
threw `InvalidOperationException` — but the throw originated **inside Avalonia's
`MainViewFactory` lambda**, which `Avalonia.Android` silently catches. The phone sat on
the splash drawable with **zero error logs**.

**Convention:** if a VM needs a "first paint" step, expose an `Initialize()` method and
call it from `App.OnFrameworkInitializationCompleted` *after* the singleton is fully
constructed. `MainWindowViewModel.Initialize()` is the canonical example — it does the
initial `NavigateTo<UploadViewModel>()` that used to live in the constructor.

Symptom to recognise: launch reaches `OnFrameworkInitializationCompleted`,
`MainViewFactory` is invoked, but the activity never reaches `Drawn` state. If you see
that pattern, suspect a swallowed factory-time exception first.

**Guard:** `ServiceRegistrationTests` (§14) builds the container with `ValidateOnBuild` **and
resolves every registered service**. Because resolving runs each constructor, a reintroduced
constructor-time cycle surfaces there as a fast `InvalidOperationException` ("circular dependency
detected") in <1s on the desktop test runner — instead of a silent hang on a phone. Run the tests
before assuming a DI change is safe.

---

## 5. Navigation

Navigation is a single content swap with a back stack, not a framework:

- `MainWindowViewModel` is the navigation host. It holds `[ObservableProperty] CurrentViewModel`,
  a `Stack<Type>` back stack, and implements `INavigationService`.
- `MainView.axaml` hosts a `ContentControl` bound to `CurrentViewModel`; the `ViewLocator`
  resolves the matching `*View`.
- ViewModels trigger navigation by depending on `INavigationService`. They never touch
  `MainWindowViewModel` directly.

**`INavigationService` surface — pick the right verb:**

| Method | Use when | Back stack |
|---|---|---|
| `NavigateTo<T>()` | Going forward to the next screen | Pushes the current screen |
| `GoBack()` | Returning to the previous screen (back button) | Pops; returns `false` at the root |
| `ResetTo<T>()` | Starting a flow over (e.g. "Send more books") | **Cleared** — `T` becomes the new root |
| `CanGoBack` | Gating a back affordance | — |
| `CancelActiveWork()` | Stopping in-flight work on app suspension | — |

**The host disposes the screen you leave.** Every `SetCurrent` swap calls `(previous as
IDisposable)?.Dispose()`. That is *the* mechanism that (a) cancels the outgoing VM's
`CancellationTokenSource` and (b) detaches its subscription to the singleton `UploadSession`.
Because of this, a transient screen VM that subscribes to a singleton's event **must** unsubscribe
in `Dispose()` (store the handler in a field — see `UploadViewModel`/`ReviewViewModel`). Make
`Dispose()` idempotent (a `_disposed` guard); the host may dispose a VM whose async command is
still unwinding on the stack.

**When adding a screen:** create `FooViewModel : ViewModelBase` + `FooView.axaml`
(with `x:DataType="vm:FooViewModel"`), register the VM as `Transient`, and navigate to it via
`INavigationService`. The name-based `ViewLocator` (`FooViewModel` → `FooView`) wires the rest. If
the screen owns cancellable work, see §9 for `IDisposable` + `ICancelableWork`.

---

## 6. The API layer

`IKoboApiClient` / `KoboApiClient` is the **only** place that talks HTTP. Conventions:

- **One `HttpClient` per process**, injected (long-lived singleton with `BaseAddress` set to
  `IAppConfig.ApiBaseUrl`). Relative URIs hit the backend; the S3 presigned `PUT` uses an
  absolute URI, which overrides `BaseAddress`. No default/`Authorization` headers are attached.
- **`System.Net.Http.Json`** (`JsonContent.Create`, `ReadFromJsonAsync`) with shared
  `JsonSerializerOptions` (`CamelCase`, case-insensitive). The backend serializes camelCase.
- **DTOs are immutable `record`s** in `Api/Dtos/`, mirroring backend DTOs 1:1. Positional
  records, one per file. No anonymous types, no `JsonElement` past this layer.
- **Every method takes a `CancellationToken`** as its last parameter. No exceptions.
- **All failure converges on `ApiException`** (§8). The client never returns `null`, never
  returns a raw `HttpResponseMessage`, never lets an `HttpRequestException` escape.
- **`HttpCompletionOption` is chosen deliberately:** `ResponseHeadersRead` for the S3 `PUT`
  (empty body), `ResponseContentRead` for JSON endpoints.

When you add an endpoint: add the DTO record(s), add a method to `IKoboApiClient` +
`KoboApiClient`, route every error through `ApiException`, thread the `CancellationToken`.

---

## 7. The Services layer

Services are the seam between UI and the API, and the home of all multi-step logic.

- **`IUploadOrchestrator` owns the upload "dance"** so ViewModels stay thin: `EnsureBundleAsync`
  (lazy, lock-guarded, cached), `UploadAsync` (upload-url → PUT → confirm), `FinalizeAsync`.
  A ViewModel calls one orchestrator method and reacts to the result/exception — it does not
  sequence API calls itself.
- **The orchestrator is the DTO→Model boundary.** `UploadAsync` consumes a `PickedFile` model
  and returns an `UploadedBook` model; the DTOs stay inside.
- **Lazy, idempotent resource creation.** `EnsureBundleAsync` uses a `SemaphoreSlim` + double-
  checked cache so concurrent file picks don't create duplicate bundles. Copy this pattern for
  any "create once, reuse" server resource.
- **Platform APIs are wrapped behind interfaces** (`IFilePickerService`, `IClipboardService`,
  `ITopLevelAccessor`). ViewModels depend on the interface so they remain unit-testable and
  platform-free. The Avalonia-specific code (`StorageProvider`, `Clipboard`, `TopLevel`) lives
  only in the concrete implementation.

---

## 8. Error handling (every error is visible)

This is a product requirement (`GOAL.md §3.3`, §8), and the codebase implements it as a pattern:

1. **One exception type crosses the API boundary: `ApiException`.** It carries `StatusCode`,
   raw `Code`, and a ready-to-display `UserMessage`. Network and timeout failures become
   `ApiException.Network(...)` / `ApiException.Timeout(...)`.
2. **The status/code → user-message mapping is centralized** in `ApiException.MapMessage`.
   Views and ViewModels never branch on HTTP status codes. If a new backend error code needs a
   friendlier message, add it there — nowhere else.
3. **ViewModels catch in a fixed order:** user cancellation first (silent), then domain
   exceptions (`UnsupportedFileException`), then `ApiException` (show `UserMessage`), then a
   catch-all. See `UploadViewModel.ChooseFilesAsync`.
4. **Errors surface as a dismissible banner**, driven by an `ErrorMessage` string +
   `HasError` bool on the ViewModel. The banner markup (red `Border` + text + ✕) is duplicated
   per screen today; keep it consistent if you copy it (or factor it — see `REFACTORING.md`).
5. **Per-item failures don't abort the batch.** In `UploadAsync`'s loop, one file failing marks
   that `UploadItemViewModel` as `Failed` and continues; already-uploaded files are preserved.

**Rule:** never swallow an exception silently except genuine user-initiated cancellation
(`OperationCanceledException` when the token is the one you cancelled). Never show a raw stack
trace; show a `UserMessage`.

---

## 9. Async, cancellation & progress

- **Async all the way.** No `.Result`, no `.Wait()`, no `async void` (except framework event
  handlers). Commands that do I/O are `async Task` methods decorated with `[RelayCommand]`
  (which generates an `AsyncRelayCommand` that disables itself while running).
- **`CancellationToken` is threaded end-to-end** — ViewModel → orchestrator → API client → HTTP.
  Each screen VM owns a `CancellationTokenSource`, cancelled when the host disposes the VM on
  navigation away (§5). Capture the token into a local at the start of an async command and test
  *that* token in the `catch ... when (ct.IsCancellationRequested)` filter — `CancelActiveWork()`
  may swap the field's CTS mid-flight, so the field is not reliable inside a running operation.
- **Two distinct "stop" signals, one infrastructure.** Leaving a screen → `Dispose()` cancels the
  CTS permanently (the VM is gone). App suspension/memory pressure → `ICancelableWork.
  CancelActiveWork()` cancels the *current* operation but swaps in a fresh CTS so the screen is
  still usable when the user returns. Screen VMs that own cancellable work implement both
  `IDisposable` and `ICancelableWork`; the platform lifecycle reaches them through
  `INavigationService.CancelActiveWork()` (§11). New work that can be cancelled should follow the
  same pair.
- **Progress is reported via `IProgress<double>` (0.0–1.0).** Construct the `Progress<T>` on the
  UI thread so callbacks marshal back automatically; the upload loop does this (`new
  Progress<double>(p => item.Progress = p)`).
- **Stream, don't buffer.** Large file uploads wrap the source stream in `ProgressStream`, which
  reports bytes-read against total length and throttles updates (~1% steps). Never read a whole
  book into a `byte[]`. File length comes from `GetBasicPropertiesAsync()`, not from the stream.

---

## 10. Configuration

`IAppConfig` exposes exactly two values: `ApiBaseUrl` and `ShortUrlHost`. `AppConfig` resolves
the base URL at runtime via `OperatingSystem.IsAndroid()/IsIOS()` + `#if DEBUG`
(`10.0.2.2:8080` for the Android emulator, `localhost:8080` for desktop/iOS sim, `https://kobo.gg`
in Release). **Do not** introduce `appsettings.json`, env vars, or a user-editable URL — this is
a single-purpose app and that is a deliberate constraint (`GOAL.md §10, §13`).

---

## 11. Platform & mobile concerns

- **Heads are thin.** `Program.cs` / `MainActivity` / `Application` / `AppDelegate` only build
  the Avalonia app, apply fonts, and forward **platform lifecycle events** into the shared
  `INavigationService`. They contain no app logic.
- **The platform back/lifecycle hooks route through `INavigationService`** (resolved from
  `App.Services`):
  - **Android back button** (`MainActivity.OnBackPressed`) → `GoBack()`; only falls through to the
    default (exit) when `CanGoBack` is false (root screen).
  - **Android memory pressure** (`OnTrimMemory`, `RunningCritical`/`Complete`) → `CancelActiveWork()`.
  - **iOS backgrounding** (`AppDelegate.DidEnterBackground`) → `CancelActiveWork()`.
  - **Caveat — don't cancel on `OnPause`/`OnStop`.** Android's Storage Access Framework file
    picker pauses/stops the activity, so cancelling there would abort an in-progress file pick.
    iOS's document picker is modal in-process and does *not* fire `DidEnterBackground`, so that
    hook is safe. When adding lifecycle handling, prefer signals that mean "genuinely leaving",
    not "something is on top of us".
- **The `App` owns the DI container**; `MainView.axaml.cs` pushes the live `TopLevel` into
  `ITopLevelAccessor` on attach, and applies safe-area insets via `InsetsManager`. Touch
  platform plumbing belongs here, behind the `ITopLevelAccessor` abstraction.
- **iOS Release is full-AOT + trimmed.** Reflection-based code is fragile there. The default
  `ViewLocator` (`Type.GetType` + `Activator.CreateInstance`) and reflection-based
  `System.Text.Json` are flagged risks (`ViewLocator` is annotated `[RequiresUnreferencedCode]`).
  When adding serialization, prefer a source-generated `JsonSerializerContext`; when adding views,
  keep to the predictable `*ViewModel`→`*View` naming so the locator (or its eventual replacement)
  resolves them. See `REFACTORING.md` for the planned hardening.
- **Networking:** Android allows cleartext to the dev host via `network_security_config.xml`;
  iOS allows local networking via `NSAllowsLocalNetworking`. Release talks HTTPS to `kobo.gg`.

---

## 12. Styling & theme

- **`FluentTheme` defaults**, light/dark follows system. No custom control library.
- **Brand tokens live in `App.axaml`** as resources (`KoboAccent`, `KoboError`, …) and override
  `SystemAccentColor` per theme variant. Reference them with `{StaticResource KoboAccentBrush}`.
- **Reusable button/typography styles are class selectors** (`Button.primary`,
  `Button.secondary`, `TextBlock.h1`). Apply with `Classes="primary"`. Add new shared visual
  rules as styles in `App.axaml`, not as inline copy-paste across views.
- **Touch targets ≥ 48 dp** (primary/secondary buttons use `MinHeight="52"`). Keep one primary
  action per screen.

---

## 13. Checklist: adding a new feature/screen

- [ ] New screen = `FooViewModel : ViewModelBase` (`Transient`) + `FooView.axaml`
      (`x:DataType="vm:FooViewModel"`, compiled bindings) + 3-line code-behind.
- [ ] State that must survive navigation goes in a **singleton service**, not the VM.
- [ ] New backend call = DTO `record`(s) in `Api/Dtos/` + method on `IKoboApiClient` taking a
      `CancellationToken`, with all failures routed through `ApiException`.
- [ ] Multi-step logic goes in an orchestrator/service, returning **Models**, not DTOs.
- [ ] Platform API access goes behind an interface in `Services/`.
- [ ] Every error path produces a user-visible `UserMessage` (banner), never a silent swallow
      or raw exception text.
- [ ] Async + `CancellationToken` threaded through; no blocking calls; stream large payloads.
- [ ] Shared visuals use `App.axaml` styles/resources; touch targets ≥ 48 dp.
- [ ] If the feature touches `Services`/`Api`/navigation or adds a DI registration, add/extend
      tests in `KoboGg.Tests` (§14) and keep them green.
- [ ] `dotnet test KoboGg.Tests/KoboGg.Tests.csproj` passes and `KoboGg.Desktop` builds & runs
      the full flow.

---

## 14. Testing

`KoboGg.Tests` (xUnit, `net10.0`) is the fast safety net. It references only `KoboGg`, so it runs
in milliseconds with **no Avalonia or Android bootstrap** — the deliberate payoff of the UI-free
`Services`/`Api` layers and the standalone composition root (§4).

**What's covered, and the pattern to copy:**

- **`ServiceRegistrationTests`** — builds the container via `AddKoboGgServices()` with
  `ValidateOnBuild`/`ValidateScopes`, then resolves every registered service. This is the cheapest,
  highest-signal test in the suite: it catches "registered a type whose dependency isn't
  registered" and constructor-time DI cycles (§4) before they become a runtime hang. **Touch DI →
  run this.**
- **`KoboApiClientTests`** — exercise the client against a `StubHttpMessageHandler`
  (`TestDoubles/`), never a live socket. Cover success mapping, empty/malformed bodies, each
  non-2xx → `UserMessage`, network/timeout, user-cancellation rethrow, and the S3 `PUT`.
- **`UploadOrchestratorTests`** — drive the orchestrator with a `FakeKoboApiClient` that records
  call order. Assert bundle-created-once under concurrency, the upload-url → PUT → confirm sequence,
  and finalize-without-bundle.
- **`ApiExceptionTests`** — pin the status/code → message mapping that the whole "every error is
  visible" rule (§8) depends on.
- **`NavigationHostTests`** — a tiny probe `IServiceProvider`/`ViewModelBase` verifies the host
  disposes the outgoing VM, maintains the back stack, clears it on `ResetTo`, and forwards
  `CancelActiveWork()`.

**Conventions:** prefer hand-rolled fakes in `TestDoubles/` over a mocking library (fewer deps,
clearer intent); one behaviour per `[Fact]`; assert on the user-facing `UserMessage`, not internal
state, for error paths. Test packages are declared in `Directory.Packages.props` like every other
dependency.
