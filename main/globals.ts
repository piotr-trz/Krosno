let RECORDING_PATH: null | string = null;
let PAUSED = false;
let RECORDING_INPUT_VIDEO: string | null = null;
let RECORDING_INPUT_AUDIO_DESKTOP: string | null = null;
let RECORDING_INPUT_AUDIO_MIC: string | null = null;
let RECORDING_RESOLUTION: string | null = null;

export function setPaused(paused: boolean) {
  PAUSED = paused;
}

export function isPaused() {
  return PAUSED;
}

export function setRecordingPath(path: string) {
  RECORDING_PATH = path;
}

export function getRecordingPath() {
  return RECORDING_PATH;
}

export function setRecordingInputVideo(input_video: string) {
  RECORDING_INPUT_VIDEO = input_video;
}

export function getRecordingInputVideo() {
  return RECORDING_INPUT_VIDEO;
}

export function setRecordingInputAudioDesktop(desktop: string) {
  RECORDING_INPUT_AUDIO_DESKTOP = desktop;
}

export function setRecordingInputAudioMic(mic: string) {
  RECORDING_INPUT_AUDIO_MIC = mic;
}

export function getRecordingInputAudioDesktop() {
  return RECORDING_INPUT_AUDIO_DESKTOP;
}

export function getRecordingInputAudioMic() {
  return RECORDING_INPUT_AUDIO_MIC;
}

export function setRecordingResolution(resolution: string) {
  RECORDING_RESOLUTION = resolution;
}

export function getRecordingResolution() {
  return RECORDING_RESOLUTION;
}
