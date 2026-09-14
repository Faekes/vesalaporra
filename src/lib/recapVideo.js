const HTML2CANVAS_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm";

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const waitForPaint = () =>
  new Promise((resolve) =>
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(resolve),
    ),
  );

const getMp4MimeType = () => {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  return [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
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

export const restartRecapForExport = async (restart) => {
  restart();
  await waitForPaint();
};

export const downloadRecapMp4 = async ({
  stage,
  durationMs,
  fileName,
  soundCues,
}) => {
  if (!stage) {
    throw new Error("No s’ha trobat el resum que s’ha d’enregistrar.");
  }

  if (!HTMLCanvasElement.prototype.captureStream) {
    throw new Error("Aquest navegador no permet enregistrar el resum.");
  }

  const mimeType = getMp4MimeType();

  if (!mimeType) {
    throw new Error(
      "Aquest navegador no pot crear MP4. Obre Vesalaporra amb Chrome actualitzat.",
    );
  }

  const [{ default: html2canvas }] = await Promise.all([
    import(/* @vite-ignore */ HTML2CANVAS_MODULE_URL),
    document.fonts?.ready || Promise.resolve(),
  ]);

  const bounds = stage.getBoundingClientRect();
  const outputScale = Math.min(2, 1080 / Math.max(1, bounds.width));
  const canvas = document.createElement("canvas");

  canvas.width = Math.round(bounds.width * outputScale);
  canvas.height = Math.round(bounds.height * outputScale);

  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });

  if (!context) {
    throw new Error("No s’ha pogut preparar el vídeo.");
  }

  const videoStream = canvas.captureStream(30);
  const soundtrack = createSoundtrack(durationMs, soundCues);
  videoStream.addTrack(soundtrack.track);

  const recorder = new MediaRecorder(videoStream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
    audioBitsPerSecond: 128_000,
  });

  const chunks = [];
  const finished = new Promise((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    });
    recorder.addEventListener("stop", resolve, { once: true });
    recorder.addEventListener("error", () => {
      reject(new Error("No s’ha pogut completar l’MP4."));
    }, { once: true });
  });

  let renderingFrame = false;
  let stopped = false;

  const renderFrame = async () => {
    if (renderingFrame || stopped) {
      return;
    }

    renderingFrame = true;

    try {
      const frame = await html2canvas(stage, {
        backgroundColor: null,
        scale: outputScale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: bounds.width,
        height: bounds.height,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });

      context.fillStyle = "#03050c";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frame, 0, 0, canvas.width, canvas.height);
    } finally {
      renderingFrame = false;
    }
  };

  await renderFrame();
  recorder.start(1000);

  const frameTimer = window.setInterval(renderFrame, 1000 / 12);

  try {
    await wait(durationMs);
  } finally {
    stopped = true;
    window.clearInterval(frameTimer);

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  await finished;
  await soundtrack.stop();
  videoStream.getTracks().forEach((track) => track.stop());

  const video = new Blob(chunks, { type: mimeType });
  const downloadUrl = URL.createObjectURL(video);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = fileName.endsWith(".mp4")
    ? fileName
    : `${fileName}.mp4`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
};
