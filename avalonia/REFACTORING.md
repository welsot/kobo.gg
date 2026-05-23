# Kobo.gg Avalonia — Refactoring Backlog

> Improvements to the existing implementation, ordered by impact. Each item states the
> **current** behaviour (with file references), **why** it's a problem, and the **recommended**
> approach with the reasoning for why it's better. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> first — these are deviations from, or hardenings of, the patterns described there.
>
> The overall architecture is sound (clean layering, compiled bindings, centralized error
> mapping, streaming uploads, cancellation plumbed through). Most items below are about wiring
> things that were *built but never connected*, closing `GOAL.md` mandates that were skipped, and
> hardening for mobile (AOT/trimming, the Android back button).
>
> **Priority key:** 🔴 correctness / promised-but-missing · 🟠 maintainability / mobile-readiness · 🟢 polish · ✅ done
>
> **Status (2026-05-23):** items **1–4 are done** (the tests + lifecycle/back-button/cancellation
> cluster). Items 5–13 remain open. The next cheap wins are #6 and #7 (orchestrator/session
> cleanup), now safe to do behind the test suite added in #2.

---

## ✅ 1. ViewModel `Dispose()` is never called — cancellation & cleanup don't happen

> **Resolved 2026-05-23.** `MainWindowViewModel.SetCurrent` now disposes the outgoing VM on every
> navigation; `UploadViewModel`/`ReviewViewModel` store their `UploadSession.Books` handler in a
> field and detach it in an idempotent `Dispose()` that also cancels the CTS. Verified by
> `NavigationHostTests.Navigating_forward_disposes_the_outgoing_view_model`. See `ARCHITECTURE.md §5`.

**Current.** `UploadViewModel` and `ReviewViewModel` implement `IDisposable`, own a
`CancellationTokenSource`, and subscribe to the singleton `UploadSession.Books.CollectionChanged`
(`UploadViewModel.cs:61`, `ReviewViewModel.cs:44`). But navigation just swaps the content:

```csharp
// MainWindowViewModel.NavigateTo<T>()
var vm = (TViewModel)_services.GetService(typeof(TViewModel))!;
CurrentViewModel = vm;   // outgoing VM is never disposed
```

Verified: `Dispose()` is defined but has **no caller** anywhere in the project.

**Why it matters.**
- **Cancellation is plumbed but dead.** `GOAL.md §5.6` requires in-flight uploads to cancel on
  screen exit. Because the CTS is only cancelled in `Dispose()`, leaving the Upload screen mid-
  upload cancels nothing — the upload keeps running against a VM the user has navigated away from.
- **Memory/logic leak.** Each navigation creates a fresh transient VM that subscribes to the
  singleton `UploadSession.Books.CollectionChanged` and never unsubscribes. After
  Upload→Review→Upload→…, multiple dead `UploadViewModel`s stay alive and react to collection
  changes. On a long mobile session this accumulates.

**Recommended.** Make the navigation host dispose the outgoing VM, and unsubscribe in `Dispose()`.

```csharp
// MainWindowViewModel
public void NavigateTo<TViewModel>() where TViewModel : ViewModelBase
{
    var next = (TViewModel)_services.GetRequiredService(typeof(TViewModel));
    var previous = CurrentViewModel;
    CurrentViewModel = next;
    (previous as IDisposable)?.Dispose();   // cancels CTS + unsubscribes
}
```
And in each VM's `Dispose()`, detach the `CollectionChanged` handler (store it in a field so it
can be removed). **Why better:** the cancellation tokens that are already threaded everywhere
finally do their job, screen exit cancels uploads as promised, and transient VMs stop leaking.

---

## ✅ 2. No unit tests, despite `GOAL.md §13` requiring them

> **Resolved 2026-05-23.** Added `KoboGg.Tests` (xUnit, `net10.0`, 33 tests) covering
> `KoboApiClient` (against a stub `HttpMessageHandler`), `UploadOrchestrator`, `ApiException`
> mapping, the navigation host, and a container-validation test that resolves every registered
> service. Run with `dotnet test KoboGg.Tests/KoboGg.Tests.csproj`. See `ARCHITECTURE.md §14`.

**Current.** There is no `KoboGg.Tests` project (verified — no `*.Tests.csproj`, no test files).
`GOAL.md §13` explicitly mandates tests for `UploadOrchestrator` and `KoboApiClient` (mocking
`HttpMessageHandler`).

**Why it matters.** These two classes hold all the error-mapping and orchestration logic — exactly
the code where a regression silently breaks the "every error is visible" guarantee or the
upload→confirm→finalize ordering. They were deliberately designed to be testable (interfaces,
constructor injection, a pure static `GetContentTypeFor`) and that investment is currently unused.

**Recommended.** Add an `xUnit` project `KoboGg.Tests` and cover:
- `KoboApiClient` against a fake `HttpMessageHandler`: 2xx JSON → DTO; 2xx empty body; each
  non-2xx → correct `ApiException.UserMessage`; `HttpRequestException` → network message;
  `TaskCanceledException` (not user) → timeout message; S3 `PUT` non-2xx.
- `UploadOrchestrator`: bundle is created once under concurrent `EnsureBundleAsync` calls; the
  full `UploadAsync` sequence calls upload-url → PUT → confirm in order; `FinalizeAsync` throws
  cleanly when no bundle exists.
- `ApiException.MapMessage`: known code, human-readable code, status fallbacks.

**Why better:** locks in the contract the whole UX depends on, and makes the orchestrator safe to
refactor (it's touched by several items below).

---

## ✅ 3. Android system back button exits the app instead of navigating back

> **Resolved 2026-05-23.** `INavigationService` gained a back stack (`NavigateTo`/`GoBack`/
> `ResetTo`/`CanGoBack`); `MainActivity.OnBackPressed` calls `GoBack()` and only exits at the root.
> `ReviewViewModel.Back` now routes through `GoBack()`; `SuccessViewModel` uses `ResetTo` so a new
> flow's root exits cleanly. Android head builds clean; logic covered by `NavigationHostTests`.

**Current.** `MainActivity` is empty (`MainActivity.cs`) — no `OnBackPressed` override and no
`OnBackPressedDispatcher` callback. The navigation host has no concept of a back stack.

**Why it matters.** `GOAL.md §5` lists "system back button on Android works correctly" as a
non-negotiable. Today, pressing back on the Review or Success screen **closes the app** rather than
returning to the previous screen — a jarring, data-losing experience on the platform where it
matters most.

**Recommended.**
- Give `INavigationService` a notion of "can go back" / `GoBack()` (a simple stack of VM types in
  `MainWindowViewModel`, or expose the current VM so the activity can ask it).
- In `MainActivity`, register an `OnBackPressedDispatcher` callback that calls the navigation
  service; only fall through to default (exit) when on the root Upload screen.

**Why better:** matches platform expectations and the explicit spec, and prevents accidental loss
of an in-progress bundle. (Pairs naturally with item #1's lifecycle work.)

---

## ✅ 4. App-lifecycle events don't cancel uploads (`OnPause` / `OnTrimMemory`)

> **Resolved 2026-05-23.** Added `ICancelableWork` + `INavigationService.CancelActiveWork()`
> (cancels the current operation and swaps in a fresh CTS so the screen stays usable). Wired from
> Android `OnTrimMemory` (`RunningCritical`/`Complete`) and iOS `DidEnterBackground`. **Deliberately
> not** hooked to `OnPause`/`OnStop` — the SAF file picker pauses the activity and that would abort
> an in-progress pick (the caveat is documented in `ARCHITECTURE.md §11`). Covered by
> `NavigationHostTests.CancelActiveWork_delegates_to_the_current_screen`.

**Current.** No `OnPause`/`OnStop`/`OnTrimMemory` handling in `MainActivity`, and no
`ControlledApplicationLifetime` shutdown hook. `GOAL.md §5.6` calls for cancelling large uploads
on app suspension/memory pressure.

**Why it matters.** On mobile, a backgrounded app with an in-flight multi-MB upload can be killed
by the OS or waste battery/data on a connection that's about to drop. The orchestrator already
honours `CancellationToken`; nothing triggers it on suspension.

**Recommended.** Expose a "cancel active work" path from the navigation host / orchestrator and
call it from `MainActivity.OnPause`/`OnTrimMemory` (Android) and the iOS lifecycle. Combine with
item #1 so there is a single, well-defined "stop in-flight work" entry point.

**Why better:** the cancellation infrastructure that's already in place becomes genuinely useful,
and the app behaves well under the OS lifecycle instead of fighting it.

---

## 🟠 5. `Microsoft.Extensions.Http` is referenced but unused; `HttpClient` is hand-registered

**Current.** `Microsoft.Extensions.Http` is in `Directory.Packages.props` and referenced by
`KoboGg.csproj`, but nothing calls `AddHttpClient`/`IHttpClientFactory` (verified). Instead
`App.axaml.cs` registers a raw singleton `HttpClient` with a 10-minute timeout applied globally.

**Why it matters.** A dead dependency is misleading (it implies a factory pattern that isn't
there). More importantly, the single shared `HttpClient` is used for **both** backend JSON calls
and the S3 presigned `PUT`, so the 10-minute timeout meant for large uploads also applies to small
control-plane calls like `CreateBundle`/`Finalize` — a hung bundle request now takes 10 minutes to
surface instead of seconds.

**Recommended.** Either:
- **(a)** Use a typed client: `services.AddHttpClient<IKoboApiClient, KoboApiClient>(c => { c.BaseAddress = …; })`
  and a separate named/typed client for the S3 upload with the long timeout; or
- **(b)** If you prefer the current single-client simplicity, **remove the unused
  `Microsoft.Extensions.Http` package** and set per-request timeouts via a `CancellationTokenSource`
  with `CancelAfter` rather than one global 10-minute `HttpClient.Timeout`.

**Why better:** control-plane calls fail fast while uploads still get a generous window; the
dependency list reflects reality; and `IHttpClientFactory` brings correct handler lifetime
management for free if you go with (a).

---

## 🟠 6. Content-type is resolved twice; the orchestrator reaches into a sibling service's statics

**Current.** `FilePickerService.PickBooksAsync` already resolves and validates the content type,
storing it on `PickedFile.ContentType` (`FilePickerService.cs:97`). Yet
`UploadOrchestrator.UploadAsync` ignores that and re-resolves it by calling the **static**
`FilePickerService.GetContentTypeFor(file.Name)` again (`UploadOrchestrator.cs:48`).

**Why it matters.**
- **Dead/duplicated logic:** the file can never reach the orchestrator with an unknown type (the
  picker already threw `UnsupportedFileException`), so the orchestrator's re-check and
  `?? throw` is unreachable in normal flow, and `PickedFile.ContentType` is computed but unused.
- **Layering smell:** a Service (`UploadOrchestrator`) depends on a concrete sibling Service's
  static method, coupling them and making the orchestrator harder to test in isolation.

**Recommended.** Use the value already on the model: `var contentType = file.ContentType;`. Move
the extension→content-type table and `GetContentTypeFor` out of `FilePickerService` into a small
standalone type (e.g. `SupportedFileTypes` static class or an injected `IFileTypeRegistry`) that
both the picker and any future caller share.

**Why better:** single source of truth, no unreachable branches, and the orchestrator no longer
depends on the file-picker implementation — it just consumes a fully-formed `PickedFile`.

---

## 🟠 7. Session state is split across two singletons

**Current.** The "current upload session" is spread over `UploadSession` (holds
`ObservableCollection<UploadedBook> Books`) and `UploadOrchestrator` (holds the `TmpBookBundleDto?
_bundle`). Resetting requires calling both `_session.Clear()` **and** `_orchestrator.Reset()`
(`SuccessViewModel.SendMoreBooks`), and it's easy to forget one.

**Why it matters.** Two owners of one logical concept invites desync: a future code path could
clear the books but keep a stale bundle, or vice-versa. The reset is already a two-call ritual.

**Recommended.** Consolidate into one session-state object that owns both the bundle and the book
list, with a single `Reset()`. The orchestrator then takes that state as a dependency and performs
*operations* on it, separating "state" from "behaviour".

**Why better:** one place to reset, one source of truth for "what's in this session", and the
orchestrator becomes a stateless-ish operator that's trivial to test.

---

## 🟠 8. Reflection-based view location and JSON are AOT/trimming risks on iOS

**Current.** `ViewLocator` resolves views via `Type.GetType(name)` + `Activator.CreateInstance`
and is annotated `[RequiresUnreferencedCode]`. `KoboApiClient` uses reflection-based
`System.Text.Json` (no `JsonSerializerContext`). iOS Release builds are full-AOT and trimmed.

**Why it matters.** Under aggressive trimming/AOT, types resolved only by string name or
serialized only via reflection can be removed or fail at runtime — the classic "works on Desktop,
crashes on a physical iPhone in Release" trap. The `[RequiresUnreferencedCode]` attribute is the
compiler telling you this.

**Recommended.**
- **JSON:** add a source-generated context and use it on every (de)serialize call:
  ```csharp
  [JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
  [JsonSerializable(typeof(TmpBookBundleDto))]
  [JsonSerializable(typeof(EpubUploadUrlRequestDto))]
  // … one per DTO
  internal partial class KoboJsonContext : JsonSerializerContext;
  ```
- **Views:** either keep the name-based locator but add a trimming root/`DynamicDependency` for the
  view types, or switch to an explicit `ViewModel→View` map / source-generated locator.

**Why better:** removes the two most common mobile-AOT failure modes, makes serialization faster
and allocation-free, and lets you eventually flip on `PublishTrimmed`/AOT with confidence.

---

## 🟠 9. The error banner is duplicated per screen

**Current.** The red error `Border` (text + ✕ dismiss + the `KoboError*` brushes) is copy-pasted
into `UploadView.axaml` and `ReviewView.axaml`, and each VM repeats `ErrorMessage` + `HasError` +
`DismissErrorCommand`.

**Why it matters.** Three+ screens will drift (padding, wording, behaviour) and every new screen
re-implements the same thing. It's the most-copied block in the UI.

**Recommended.** Extract a small reusable `ErrorBanner` `UserControl` (or a styled template) that
binds to a message + dismiss command, and lift the `ErrorMessage`/`HasError`/`DismissError`
members into a `ScreenViewModelBase : ViewModelBase`. New screens then get consistent error UX for
free.

**Why better:** one definition to style and fix, guaranteed-consistent error presentation, and
less boilerplate per screen — directly supports the "every error is visible" rule from
`ARCHITECTURE.md §8`.

---

## 🟠 10. The catch-all surfaces raw exception messages to users

**Current.** The fallback handlers do `ErrorMessage = ex.Message` (`UploadViewModel.cs:127,145`,
`ReviewViewModel.cs:90`). For an unexpected exception (`NullReferenceException`,
`InvalidOperationException`, etc.) the user sees developer-oriented text.

**Why it matters.** `GOAL.md §3` requires **human-readable** messages. A raw `.Message` from an
arbitrary exception is neither friendly nor actionable, and can leak internal detail.

**Recommended.** In the catch-all, show a fixed friendly fallback ("Something went wrong. Please
try again.") and log the real exception (see #11). Reserve specific messages for the typed catches
(`UnsupportedFileException`, `ApiException`) that already carry user-facing text.

**Why better:** users always get a sane message; developers still get the detail (in logs);
nothing internal leaks to the UI.

---

## 🟢 11. No logging/diagnostics abstraction

**Current.** There is no `ILogger`/logging anywhere. Swallowed/caught exceptions (e.g. the
`catch { length = 0; }` in `FilePickerService`, the catch-all in the VMs) vanish without a trace.

**Why it matters.** When a user reports "the upload failed", there's nothing to inspect. This is
fine for the MVP but becomes painful as soon as the app ships to real devices.

**Recommended.** Register `Microsoft.Extensions.Logging` in the container and inject `ILogger<T>`
into the API client, orchestrator, and the VM catch-all. Keep it lightweight; no telemetry backend
needed yet — `Debug`/`Trace` providers suffice initially.

**Why better:** failures become diagnosable without changing the user-facing "show a friendly
banner" behaviour. Cheap to add, pairs with #10.

---

## 🟢 12. `IsEnabled` bindings and command `CanExecute` can disagree

**Current.** Buttons bind `IsEnabled` to a VM property **and** bind `Command` to a relay command
that has its own `CanExecute`. E.g. Continue uses `IsEnabled="{Binding CanContinue}"` while
`[RelayCommand(CanExecute = nameof(CanContinue))]` also gates it; the `CollectionChanged` handler
raises the property but doesn't always call `…Command.NotifyCanExecuteChanged()` in the same place
(`UploadViewModel.cs:61` raises the property but not the command).

**Why it matters.** Two gating mechanisms for one button is redundant and can drift — the visual
enabled state and the command's executability are kept in sync by hand, which is error-prone.

**Recommended.** Pick one source of truth. Simplest: drop the explicit `IsEnabled` bindings and
rely solely on the command's `CanExecute` (Avalonia disables a button whose command can't execute),
ensuring every state change that affects `CanExecute` calls `NotifyCanExecuteChanged()`. Or keep
`IsEnabled` and drop the `CanExecute` argument. Don't keep both.

**Why better:** one mechanism, no possibility of "button looks enabled but does nothing" (or vice
versa), less notification bookkeeping.

---

## 🟢 13. Minor cleanups

- **`Models/UploadedBook` and `Models/PickedFile` can be `record`s.** They're immutable value
  holders with hand-written constructors; positional records remove the boilerplate and give
  value semantics (consistent with the DTO style). `PickedFile` keeps its `Func<>` factory.
- **`MainView.axaml.cs` uses the service locator** (`Application.Current as App` → `app.Services`)
  to push the `TopLevel` into `ITopLevelAccessor`. Acceptable for a view, but consider having the
  `App` set the accessor when it creates `MainView`, keeping the view free of container knowledge.
- **`TopLevelAccessor` is a mutable global singleton holding a `TopLevel`.** Fine for this
  single-window app; document the assumption so nobody reuses it in a multi-window context.
- **iOS `Info.plist` lists `armv7` under `UIRequiredDeviceCapabilities`.** .NET iOS is arm64-only;
  this template leftover is misleading — drop it before App Store submission.
- **`AndroidPackageFormat=apk`** is correct for dev; switch to `aab` for a Play Store release
  (already noted in `GOAL.md §9.1`).
- **Add an `.editorconfig` + analyzers** (and consider `TreatWarningsAsErrors` on `KoboGg`) so the
  conventions in `ARCHITECTURE.md` are enforced mechanically rather than by review.

---

## Suggested order of execution

1. ~~**#2 (tests)** — do this first so the rest can be refactored safely.~~ ✅ done
2. ~~**#1 + #4 + #3** — the lifecycle/cancellation/back-button cluster.~~ ✅ done
3. **#6 + #7** — orchestrator/session cleanup (cheap, removes duplication). ← **next**
4. **#5** — HTTP client / timeout correctness.
5. **#8** — mobile AOT hardening, before any trimmed Release build.
6. **#9 + #10 + #11 + #12** — UX/diagnostics consistency.
7. **#13** — polish.
```
