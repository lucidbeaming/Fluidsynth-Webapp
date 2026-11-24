# Fluidsynth-Webapp

Node web app for controlling FluidSynth over its telnet shell.

Documentation: [lucidbeaming.com/art/code/fluidsynth-webapp](https://lucidbeaming.com/art/code/fluidsynth-webapp)

**Build write-up:** [Running Fluidsynth on a Raspberry Pi Zero W](https://lucidbeaming.com/blog/running-fluidsynth-on-a-raspberry-pi-zero-w/)

[FluidSynth](https://www.fluidsynth.org/) plays SoundFonts (`.sf2`): sets of sampled instruments, including recreations of 70s–90s synths. This app was built for a tiny standalone synth: a Raspberry Pi Zero W running FluidSynth headless, played from a USB MIDI keyboard, running about six hours on a USB battery pack, with no screen. Open the app on a phone and it lists every instrument in the loaded SoundFont; tap one to switch the synth to it.

## Requirements

- Node.js 20 or newer
- FluidSynth running with its **shell server** (`-s`), reachable from the app on port 9800 (by default on the same machine)
- At least one SoundFont loaded into FluidSynth

## Start FluidSynth

Based on the command in the write-up, for ALSA audio and MIDI on a Pi (the write-up also adds `-d`, which prints every MIDI event):

```bash
fluidsynth -si -p fluid -C0 -R0 -r48000 -a alsa -m alsa_seq -f ./config.txt &
```

`-s` starts the shell server, `-i` skips the interactive prompt, and `-C0 -R0` turn off chorus and reverb to save CPU. `config.txt` holds shell commands run at startup, at least a `load`:

```
load "./soundfonts/lucid.sf2"
select 0 1 0 0
```

`select <channel> <soundfont> <bank> <program>` sets a channel's starting instrument.

## Install

```bash
git clone https://github.com/lucidbeaming/Fluidsynth-Webapp.git
cd Fluidsynth-Webapp
npm ci
npm start          # or: npm run dev  (restarts on file changes)
```

The app connects to FluidSynth at startup and keeps retrying every 5 seconds until it's up, so the two can start in any order.

## Configuration

Environment variables, read in [`config.js`](config.js):

| Variable | Default | What it sets |
|---|---|---|
| `PORT` | `7000` | Web app port. macOS uses 7000 for AirPlay Receiver, so use another, e.g. `PORT=7001`. |
| `FLUIDSYNTH_HOST` | `127.0.0.1` | Where FluidSynth's shell server runs |
| `FLUIDSYNTH_PORT` | `9800` | FluidSynth's shell port (its `shell.port` setting) |
| `FLUIDSYNTH_TIMEOUT` | `1500` | Connection timeout, in ms |
| `FLUIDSYNTH_RESPONSE_WAIT` | `500` | How long to collect a listing such as `inst`, in ms. FluidSynth doesn't mark the end of a response. |
| `FLUIDSYNTH_RETRY` | `5000` | Delay before reconnecting after a failure, in ms |

## Usage

Open the app on a phone on the same network, with the channel and SoundFont to control in the address:

```
http://<address of the Pi>:7000/#c=0&f=1
```

| Parameter | Meaning | Default |
|---|---|---|
| `c` | FluidSynth channel, `0`–`15` (MIDI channels 1–16) | `15` (MIDI channel 16) |
| `f` | SoundFont number, in load order (FluidSynth's `fonts` command lists them) | `1` |

Most keyboards send on MIDI channel 1, so open the page with `#c=0` to change what the keyboard plays. Bookmark one address per channel to switch several parts. Tapping an instrument sends FluidSynth `select <c> <f> <bank> <program>`.

## How it works

- [`index.js`](index.js) serves the page with Express and talks to the browser with socket.io.
- It keeps **one** connection to FluidSynth's shell (with [telnet-client](https://www.npmjs.com/package/telnet-client), as plain TCP lines) and reopens it if FluidSynth restarts.
- The page asks for `inst <font>`; the server returns FluidSynth's listing and the page shows each instrument with its bank and program.
- Channel, SoundFont, bank and program values from the browser must be plain non-negative integers before they're put into a `select` command, so a browser can't send arbitrary shell commands.
- The page itself ([`index.html`](index.html), [`assets/js/app.js`](assets/js/app.js)) uses jQuery Mobile 1.4.5 with jQuery 1.11.1.

## Related projects

- [ZynAddSubFX-WebApp](https://github.com/lucidbeaming/ZynAddSubFX-WebApp): the same idea for the ZynAddSubFX synth, over OSC
- [pi-synths](https://github.com/lucidbeaming/pi-synths): scripts for building music machines on Raspberry Pi
- [Camel](https://github.com/lucidbeaming/Camel): an Arduino drone synth

## License

[MIT](LICENSE).
