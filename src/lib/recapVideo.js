import { FFmpeg } from "@ffmpeg/ffmpeg";

const FFMPEG_CORE_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const waitForPaint = () =>
  new Promise((resolve) =>
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(resolve),
    ),
  );

const getRecordingMimeType = () => {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  return [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || null;
};

const addTone = (
  audioContext,
  output,
  {
    at,
    frequency,
    duration = 0.18,
    volume = 0.08,
    type = "sine",
    endFrequency = null,
  },
) => {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startAt = audioContext.currentTime + Math.max(0, at);
  const stopAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency),
      stopAt,
    );
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(startAt);
  oscillator.stop(stopAt + 0.02);
};

const addSoundCue = (audioContext, output, cue) => {
  const at = Number(cue.at || 0) / 1000;

  if (cue.type === "intro") {
    [220, 330, 440].forEach((frequency, index) =>
      addTone(audioContext, output, {
        at: at + index * 0.08,
        frequency,
        endFrequency: frequency * 1.5,
        duration: 0.42,
        volume: 0.055,
        type: "triangle",
      }),
    );
    return;
  }

  if (cue.type === "whoosh") {
    addTone(audioContext, output, {
      at,
      frequency: 160,
      endFrequency: 980,
      duration: 0.34,
      volume: 0.06,
      type: "sawtooth",
    });
    return;
  }

  if (cue.type === "impact") {
    addTone(audioContext, output, {
      at,
      frequency: 115,
      endFrequency: 48,
      duration: 0.48,
      volume: 0.13,
      type: "sine",
    });
    addTone(audioContext, output, {
      at: at + 0.03,
      frequency: 520,
      duration: 0.16,
      volume: 0.045,
      type: "square",
    });
    return;
  }

  if (cue.type === "reveal") {
    [392, 494, 587, 784].forEach((frequency, index) =>
      addTone(audioContext, output, {
        at: at + index * 0.11,
        frequency,
        duration: 0.5,
        volume: 0.07,
        type: "triangle",
      }),
    );
    return;
  }

  if (cue.type === "celebration") {
    [523, 659, 784, 1047].forEach((frequency, index) =>
      addTone(audioContext, output, {
        at: at + index * 0.1,
        frequency,
        duration: 0.68,
        volume: 0.075,
        type: "triangle",
      }),
    );

    for (let index = 0; index < 8; index += 1) {
      addTone(audioContext, output, {
        at: at + index * 0.075,
        frequency: 1200 + index * 170,
        endFrequency: 420 + index * 55,
        duration: 0.22,
        volume: 0.025,
        type: "sawtooth",
      });
    }
  }
};

const createSoundtrack = (durationMs, soundCues) => {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Aquest navegador no permet crear l’àudio del vídeo.");
  }

  const audioContext = new AudioContextClass();
  const recordingOutput = audioContext.createMediaStreamDestination();
  const master = audioContext.createGain();

  master.gain.value = 0.72;
  master.connect(recordingOutput);
  master.connect(audioContext.destination);

  soundCues.forEach((cue) => addSoundCue(audioContext, master, cue));

  const finishAt = audioContext.currentTime + durationMs / 1000;
  master.gain.setValueAtTime(master.gain.value, finishAt - 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, finishAt);

  return {
    track: recordingOutput.stream.getAudioTracks()[0],
    stop: async () => {
      master.disconnect();

      if (audioContext.state !== "closed") {
        await audioContext.close();
      }
    },
  };
};

const fetchAsBlobUrl = async (url, mimeType) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No s’han pogut carregar els recursos del convertidor MP4.");
  }

  return URL.createObjectURL(
    new Blob([await response.arrayBuffer()], { type: mimeType }),
  );
};

const withTimeout = (promise, milliseconds, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      window.setTimeout(() => reject(new Error(message)), milliseconds),
    ),
  ]);

const convertRecordingToMp4 = async (recordingBlob) => {
  const ffmpeg = new FFmpeg();
  const inputName = "vesalaporra-input.webm";
  const outputName = "vesalaporra-output.mp4";

  try {
    await withTimeout(ffmpeg.load({
      coreURL: await fetchAsBlobUrl(
        FFMPEG_CORE_BASE_URL + "/ffmpeg-core.js",
        "text/javascript",
      ),
      wasmURL: await fetchAsBlobUrl(
        FFMPEG_CORE_BASE_URL + "/ffmpeg-core.wasm",
        "application/wasm",
      ),
    }), 60_000, "El convertidor MP4 ha trigat massa a carregar-se.");

    await ffmpeg.writeFile(
      inputName,
      new Uint8Array(await recordingBlob.arrayBuffer()),
    );

    const exitCode = await withTimeout(ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      outputName,
    ]), 180_000, "La conversió MP4 ha trigat massa.");

    if (exitCode !== 0) {
      throw new Error("No s’ha pogut convertir l’enregistrament a MP4.");
    }

    const outputData = await ffmpeg.readFile(outputName);

    return new Blob([outputData.buffer], {
      type: "video/mp4",
    });
  } finally {
    ffmpeg.terminate();
  }
};

export const restartRecapForExport = async (restart) => {
  restart();
  await waitForPaint();
};

const getCroppedCurrentTabStream = async (stage) => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      "Aquest navegador no permet capturar el vídeo. Obre Vesalaporra amb Chrome actualitzat.",
    );
  }

  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: {
        ideal: 30,
        max: 30,
      },
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude",
    systemAudio: "exclude",
  });

  const videoTrack = captureStream.getVideoTracks()[0];

  try {
    if (
      !videoTrack ||
      typeof window.CropTarget?.fromElement !== "function" ||
      typeof videoTrack.cropTo !== "function"
    ) {
      throw new Error(
        "Per descarregar el vídeo exactament com es veu, cal utilitzar Chrome actualitzat.",
      );
    }

    const cropTarget = await window.CropTarget.fromElement(stage);
    await videoTrack.cropTo(cropTarget);

    return captureStream;
  } catch (error) {
    captureStream.getTracks().forEach((track) => track.stop());
    throw error;
  }
};

export const downloadRecapMp4 = async ({
  stage,
  durationMs,
  fileName,
  soundCues,
  onCaptureReady,
}) => {
  if (!stage) {
    throw new Error("No s’ha trobat el resum que s’ha d’enregistrar.");
  }

  const recordingMimeType = getRecordingMimeType();

  if (!recordingMimeType) {
    throw new Error(
      "Aquest navegador no permet enregistrar el vídeo. Obre Vesalaporra amb Chrome actualitzat.",
    );
  }

  await (document.fonts?.ready || Promise.resolve());

  const captureStream = await getCroppedCurrentTabStream(stage);
  const chunks = [];
  let soundtrack = null;

  try {
    await onCaptureReady?.();
    await waitForPaint();

    soundtrack = createSoundtrack(durationMs, soundCues);

    const recordingStream = new MediaStream([
      ...captureStream.getVideoTracks(),
      soundtrack.track,
    ]);

    const recorder = new MediaRecorder(recordingStream, {
      mimeType: recordingMimeType,
      videoBitsPerSecond: 12_000_000,
      audioBitsPerSecond: 192_000,
    });

    const finished = new Promise((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) {
          chunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", resolve, { once: true });
      recorder.addEventListener(
        "error",
        () => reject(new Error("No s’ha pogut completar l’MP4.")),
        { once: true },
      );
    });

    recorder.start(1000);

    try {
      await wait(durationMs);
    } finally {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }

    await finished;
  } finally {
    captureStream.getTracks().forEach((track) => track.stop());
    await soundtrack?.stop();
  }

  const recording = new Blob(chunks, { type: recordingMimeType });
  const video = await convertRecordingToMp4(recording);
  const downloadUrl = URL.createObjectURL(video);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = fileName.endsWith(".mp4")
    ? fileName
    : fileName + ".mp4";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
};
