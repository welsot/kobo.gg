# Fastlane Metadata for Kobo.gg Android App

This directory contains metadata for the Kobo.gg Android app, formatted according to F-Droid requirements.

## Structure

```
fastlane/
└── metadata/
    └── android/
        └── en-US/                       (English locale)
            ├── title.txt                (App name)
            ├── short_description.txt    (Short app description, max 80 chars)
            ├── full_description.txt     (Full app description, max 4000 chars)
            ├── images/
            │   ├── icon.png             (App icon)
            │   ├── featureGraphic.png   (Promo banner, 1024x500 px)
            │   └── phoneScreenshots/    (Phone screenshots)
            │       ├── 1.png
            │       ├── 2.png
            │       └── ...
            └── changelogs/              (Release changelogs)
                └── 100000.txt           (Must match versionCode in tauri.conf.json)
```

## Updating Metadata

When making a new release:

1. Update the app's version in `src-tauri/tauri.conf.json`
2. Create a new changelog file in `fastlane/metadata/android/en-US/changelogs/` with the filename matching your new versionCode (e.g., `100001.txt`)
3. Ensure screenshots are up-to-date

## Metadata Guidelines

- **Short description**: Max 80 characters
- **Full description**: Max 4000 characters, HTML formatting is allowed
- **Screenshots**: PNG or JPG format
- **Changelogs**: Plain text, max 500 characters per release

## F-Droid Requirements

This metadata structure follows F-Droid's requirements for app listings. F-Droid will use this data to display your app in its repository.

See the [F-Droid documentation](https://f-droid.org/en/docs/All_About_Descriptions_Graphics_and_Screenshots/) for more details.