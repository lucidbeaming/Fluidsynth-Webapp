# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- README rewritten: starting FluidSynth with its shell server, install, configuration, the `#c=`/`&f=` URL parameters (the channel defaults to MIDI channel 16), how it works, and credits (#10)
- Repository metadata (#8)
- Package metadata: `repository`, `bugs` and `homepage` in `package.json` (#8)
- socket.io 2.x → 4.x on the server and the browser client. The client connects with `io()` to the page's own origin, so it also works over HTTPS (#4)
- telnet-client 0.13 → 2.x. FluidSynth's shell is now treated as a plain TCP line protocol (no prompt, no telnet negotiation). One shared connection is opened at startup and reopened when FluidSynth restarts (#4)
- express 4 → 5 and nodemon 1 → 3; new `npm run dev`; `engines.node` is `>=20` (#4)
- `package-lock.json` is committed (#4)

### Added
- `PORT` setting for the web app (default 7000; macOS uses 7000 for AirPlay Receiver) (#4)
- `FLUIDSYNTH_RESPONSE_WAIT` setting: how long to collect a listing from FluidSynth (default 500 ms) (#4)

### Fixed
- Changing an instrument no longer depends on a response FluidSynth never sends. With telnet-client 2 that rejected promise would have crashed the server (#4)
- Font and bank numbers are validated before being sent to FluidSynth. Previously any client could run arbitrary FluidSynth shell commands (#5)
- The instrument list no longer renders once per past reconnect or hash change (#6)

### Removed
- Serving `node_modules` over HTTP (#4)
- Unused `currentinstruments()` / `getvoices()` and the `STATUS_UPDATE_INTERVAL` setting (#4)
