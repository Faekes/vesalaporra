import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const SUCCESS_HIDE_MS = 14000;

const isStandaloneMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    window.navigator?.standalone === true
  );
};

const isDesktopMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia?.("(min-width: 861px)")?.matches === true;
};

export default function VesalaporraDesktopAppLauncher() {
  const desktop = useMemo(() => isDesktopMode(), []);
  const standalone = useMemo(() => isStandaloneMode(), []);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [installedThisSession, setInstalledThisSession] =
    useState(false);

  const showInstallSuccess = useCallback(() => {
    setInstalledThisSession(true);
    setInstallPrompt(null);
    setInstalling(false);

    setSuccessMessage(
      "✅ Vesalaporra instal·lada. Ja la tens disponible com una app.",
    );
  }, []);

  useEffect(() => {
    if (!desktop || standalone) {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      showInstallSuccess();
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, [desktop, standalone, showInstallSuccess]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_HIDE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  const handleInstall = async () => {
    if (!installPrompt || installing) {
      return;
    }

    setInstalling(true);

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice?.outcome === "accepted") {
        showInstallSuccess();
        return;
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error(
        "[VesalaporraDesktopAppLauncher] install error",
        error,
      );
    } finally {
      setInstalling(false);
    }
  };

  if (!desktop || standalone) {
    return null;
  }

  if (installedThisSession && !successMessage) {
    return null;
  }

  if (!installPrompt && !successMessage) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "18px 20px 0",
        boxSizing: "border-box",
      }}
    >
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: "min(520px, 100%)",
            padding: "15px 22px",
            borderRadius: 20,
            border: "1px solid rgba(34,197,94,0.48)",
            background:
              "radial-gradient(circle at 18% 0%, rgba(34,197,94,0.22), transparent 58%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.99))",
            boxShadow:
              "0 18px 42px rgba(0,0,0,0.38), 0 0 22px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
            color: "#dcfce7",
            fontSize: 14,
            lineHeight: 1.45,
            fontWeight: 900,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {successMessage}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          aria-label="Instal·lar Vesalaporra"
          style={{
            minWidth: 290,
            minHeight: 48,
            border: "1px solid rgba(250,204,21,0.62)",
            borderRadius: 999,
            padding: "12px 24px",
            background:
              "radial-gradient(circle at 22% 0%, rgba(250,204,21,0.28), transparent 58%), linear-gradient(135deg, rgba(17,24,39,0.98), rgba(2,6,23,0.99))",
            color: "#fde68a",
            boxShadow:
              "0 16px 38px rgba(0,0,0,0.36), 0 0 20px rgba(250,204,21,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
            fontSize: 12,
            fontWeight: 1000,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: installing ? "wait" : "pointer",
          }}
        >
          {installing
            ? "INSTAL·LANT…"
            : "📲 INSTAL·LAR VESALAPORRA"}
        </button>
      )}
    </div>
  );
}