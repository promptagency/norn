# Changelog

Notable changes to Norn. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/). Each version is tagged `vX.Y.Z` in git, and the version is shown in the app's footer. How to release: [docs/DEPLOY.md](docs/DEPLOY.md#releasing-a-version).

## [Unreleased]

## [0.1.1] - 2026-10-23

### Fixed

- **Big files are read.** A very large file, such as a till export with one row per sale, was refused as unreadable: from about 65,000 rows in Safari, and at 200,000 in a test with Chrome's engine.
- **The bands show when the last rows have no value yet.** A file ending in dates without numbers, such as today's row not filled in, lost both bands in the forecast chart. Such rows are now left out, and the forecast starts after the last real value.
- **A new horizon never shows the old number.** While the forecast for a new horizon was on its way, the sentence put the old total next to the new period for a moment. It now waits for the new numbers.
- **A link with an odd horizon opens.** A shared link whose horizon was not one of the buttons, such as `horisont=-1`, showed an empty page.

## [0.1.0] - 2026-10-23

The first tagged version. Norn has been live at nornor.app since 2026-10-21; this version is what was live on 2026-10-23, plus the version number in the footer.

### Added

- **Forecasts of your own numbers, in the browser.** Drop a CSV or Excel file, or pick an example. Norn reads the series (Urd), shows how well it would have guessed a period it was not shown (Verdandi), and forecasts what is likely to come with two bands of uncertainty (Skuld). Nothing leaves the device.
- **Examples with real data** from SCB, eSett and Wikimedia, rebuilt every month.
- **Works offline** after the first forecast.
- **The version in the footer.**

[Unreleased]: https://github.com/promptagency/norn/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/promptagency/norn/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/promptagency/norn/releases/tag/v0.1.0
