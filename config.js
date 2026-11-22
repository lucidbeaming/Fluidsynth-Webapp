const config = {
  // HTTP port for the web app. macOS uses 7000 for AirPlay Receiver, so set
  // PORT (e.g. 7001) when running on a Mac
  PORT: Number(process.env.PORT) || 7000,
  FLUIDSYNTH_HOST: process.env.FLUIDSYNTH_HOST || '127.0.0.1',
  FLUIDSYNTH_PORT: Number(process.env.FLUIDSYNTH_PORT) || 9800,
  FLUIDSYNTH_TIMEOUT: Number(process.env.FLUIDSYNTH_TIMEOUT) || 1500,
  // How long to collect a listing (inst, channels) before using it
  FLUIDSYNTH_RESPONSE_WAIT: Number(process.env.FLUIDSYNTH_RESPONSE_WAIT) || 500,
  FLUIDSYNTH_RETRY: Number(process.env.FLUIDSYNTH_RETRY) || 5000
}

module.exports = config;
