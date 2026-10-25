# Changelog

Notable changes to Norn. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/). Each version is tagged `vX.Y.Z` in git, and the version is shown in the app's footer. How to release: [docs/DEPLOY.md](docs/DEPLOY.md#releasing-a-version).

## [Unreleased]

## [0.1.7] - 2026-10-25

### Added

- **Pictures on Så fungerar Norn:** the bands with labels, the three steps side by side, the grades, how your data stays on your computer, and the model's 21 quantiles.

## [0.1.6] - 2026-10-25

### Changed

- **A new version shows at once.** After a release, a page that holds no data reloads itself into the new version; with a forecast open, the new version waits for the next visit.
- **Vanliga frågor opens one answer at a time.**
- **Kopiera länk is gone, and Skriv ut is now Spara som PDF.** The PDF is made by your browser on your computer and leaves out what only works on screen. Old links to the examples still open.
- **Every chart says what it shows**, with a heading such as "Leksaksaffärer per månad, provet på det senaste året".
- **More air and a clearer Start.** The drop zone lines up with the heading, with the example table under it, the text is a little larger, and Så fungerar Norn is a button.
- **Skuld explains events and certainty in more detail**, and "Varför står det minst?" became "Varför står det minst nio fall av tio?".
- **Skuld explains itself a little more:** why the bands widen further ahead, what Norn does with an event, which number to plan by, and what the download holds.
- **Verdandi says what the grade means for you**, whether the bands held what they promise, what helps when the grade is Osäker, and what Norn is doing while the test runs.
- **Urd says why it asks "Stämmer det?", and its errors say what to do.** A too short series, irregular times, a column with words in it and a file without dates now each come with a way forward.
- **The two bands are easier to tell apart.** In the light theme the wide band is sand around the blue narrow one, and the legend says which is which: the narrow band holds half of the cases, the wide one nine of ten, and the surer you want to be, the wider the band.
- **Norn's best guess stands out.** The dotted line in the forecast is dark ochre instead of the same blue as the bands it runs through.

### Added

- **Zoom in on a stretch of time in any chart.** Drag across it, pinch with two fingers, or press plus and minus; the Visa allt button in the corner goes back.
- **Vanliga frågor**, in a window you open from the top right or the footer.
- **Start shows what a file can look like**, with a small example table, and says that the forecasting model is downloaded the first time only.
- **Så fungerar Norn, a page that explains it all.** Why Norn exists, what you can use it for, how the test and the bands work, where your data is, and the Timestral model from Mistral AI, first in plain words and then in detail. Linked from Start, the footer and Verdandi's details.

## [0.1.5] - 2026-10-25

### Changed

- **Verdandi says plainly that it is a test.** It asks "Kan du lita på prognosen?" and shows in three steps how Norn hid part of your data, guessed on it and was compared with what happened. Skuld reminds you of the result under the forecast, with a link back.
- **Start says what Norn is before you begin.** A clearer heading, "Gör en prognos av dina egna siffror", and three lines on what you get, beside the drop zone.

## [0.1.4] - 2026-10-24

### Changed

- **An event answers faster.** Switching an event on or off in Skuld no longer computes the forecast without events again; Norn keeps it for each horizon.

## [0.1.3] - 2026-10-24

### Fixed

- **The model download shows its progress from the start.** On a slow line Norn said "räknar" while it was still downloading the model, since each 25 MB piece had to arrive in full before any progress showed.

## [0.1.2] - 2026-10-23

### Fixed

- **The forecast page no longer jumps when you change horizon.** Since 0.1.1 the chart disappeared while the new forecast was computed and came back when it was ready, moving everything below it. The chart now shows the last forecast until the new one is in; only the sentence waits.

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

[Unreleased]: https://github.com/promptagency/norn/compare/v0.1.7...HEAD
[0.1.7]: https://github.com/promptagency/norn/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/promptagency/norn/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/promptagency/norn/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/promptagency/norn/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/promptagency/norn/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/promptagency/norn/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/promptagency/norn/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/promptagency/norn/releases/tag/v0.1.0
