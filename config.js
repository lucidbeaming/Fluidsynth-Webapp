const config = {
  FLUIDSYNTH_HOST: process.env.FLUIDSYNTH_HOST || '127.0.0.1';
  FLUIDSYNTH_PORT: process.env.FLUIDSYNTH_PORT || 9800;
  FLUIDSYNTH_TIMEOUT: process.env.FLUIDSYNTH_TIMEOUT || 1500;
}

module.exports = config;