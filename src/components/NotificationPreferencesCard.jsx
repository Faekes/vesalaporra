import { useEffect, useState } from "react";

import {
  disablePushNotifications,
  enablePushNotifications,
  getPushErrorMessage,
  isPushSupported,
  readMyPushState,
} from "../lib/pushNotifications";

const SERVER_ENABLED_KEYS = new Set([
  "push_enabled",
  "enabled",
  "is_enabled",
  "notifications_enabled",
]);

const getBrowserPermission = () => {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  return Notification.permission;
};

const parseBooleanValue = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalizedValue = value
      .trim()
      .toLowerCase();

    if (
      [
        "true",
        "t",
        "yes",
        "y",
        "enabled",
        "active",
      ].includes(normalizedValue)
    ) {
      return true;
    }

    if (
      [
        "false",
        "f",
        "no",
        "n",
        "disabled",
        "inactive",
      ].includes(normalizedValue)
    ) {
      return false;
    }
  }

  return null;
};

const findServerPushEnabled = (
  value,
  depth = 0,
) => {
  if (
    value === null ||
    value === undefined ||
    depth > 5
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findServerPushEnabled(
        item,
        depth + 1,
      );

      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  for (const [key, nestedValue] of Object.entries(
    value,
  )) {
    if (!SERVER_ENABLED_KEYS.has(key)) {
      continue;
    }

    const parsedValue =
      parseBooleanValue(nestedValue);

    if (parsedValue !== null) {
      return parsedValue;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const result = findServerPushEnabled(
      nestedValue,
      depth + 1,
    );

    if (result !== null) {
      return result;
    }
  }

  return null;
};

const normalizePushState = (pushState) => {
  const supported = Boolean(
    pushState?.supported ?? isPushSupported(),
  );

  const permission = String(
    pushState?.permission ||
      getBrowserPermission(),
  );

  const browserSubscribed = Boolean(
    pushState?.browserSubscribed,
  );

  const serverEnabled =
    findServerPushEnabled(
      pushState?.serverState,
    );

  return {
    supported,
    permission,
    browserSubscribed,
    enabled:
      browserSubscribed &&
      serverEnabled !== false,
  };
};

const INITIAL_PUSH_STATE = {
  supported: isPushSupported(),
  permission: getBrowserPermission(),
  browserSubscribed: false,
  enabled: false,
};

export default function NotificationPreferencesCard() {
  const [pushState, setPushState] = useState(
    INITIAL_PUSH_STATE,
  );

   const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [testWorking, setTestWorking] =
    useState(false);
  const [feedback, setFeedback] =
    useState(null);

  useEffect(() => {
    let isCurrent = true;

    const loadPushState = async () => {
      setLoading(true);

      try {
        const nextState =
          await readMyPushState();

        if (!isCurrent) {
          return;
        }

        setPushState(
          normalizePushState(nextState),
        );
      } catch (error) {
        console.warn(
          "[VESALAPORRA_PUSH] No s’ha pogut llegir l’estat:",
          error,
        );

        if (!isCurrent) {
          return;
        }

        setPushState((currentState) => ({
          ...currentState,
          supported: isPushSupported(),
          permission:
            getBrowserPermission(),
        }));

        setFeedback({
          type: "error",
          message: getPushErrorMessage(error),
        });
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    void loadPushState();

    return () => {
      isCurrent = false;
    };
  }, []);

  const synchronizePushState = async (
    fallbackEnabled,
  ) => {
    try {
      const nextState =
        await readMyPushState();

      setPushState(
        normalizePushState(nextState),
      );
    } catch (error) {
      console.warn(
        "[VESALAPORRA_PUSH] L’acció ha acabat, però no s’ha pogut rellegir l’estat:",
        error,
      );

      setPushState((currentState) => ({
        ...currentState,
        supported: isPushSupported(),
        permission:
          getBrowserPermission(),
        browserSubscribed:
          fallbackEnabled,
        enabled: fallbackEnabled,
      }));
    }
  };

  const handleTogglePush = async () => {
    if (
      loading ||
      working ||
      !pushState.supported
    ) {
      return;
    }

    setWorking(true);
    setFeedback(null);

    try {
      if (pushState.enabled) {
        await disablePushNotifications();

        await synchronizePushState(false);

        setFeedback({
          type: "success",
          message:
            "Notificacions desactivades en aquest dispositiu.",
        });

        return;
      }

      await enablePushNotifications();

      await synchronizePushState(true);

      setFeedback({
        type: "success",
        message:
          "Notificacions activades. Vesalaporra ja et podrà avisar.",
      });
    } catch (error) {
      console.error(
        "[VESALAPORRA_PUSH] Error canviant les notificacions:",
        error,
      );

      setPushState((currentState) => ({
        ...currentState,
        permission:
          getBrowserPermission(),
      }));

      setFeedback({
        type: "error",
        message: getPushErrorMessage(error),
      });
    } finally {
      setWorking(false);
    }
  };

  const handleLocalNotificationTest = async () => {
    if (
      testWorking ||
      !pushState.supported ||
      pushState.permission !== "granted"
    ) {
      return;
    }

    setTestWorking(true);
    setFeedback(null);

    try {
      const registration =
        await navigator.serviceWorker.ready;

      await registration.showNotification(
        "Prova Vesalaporra",
        {
          body:
            "Si veus aquest avís, aquest dispositiu pot mostrar notificacions.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag:
            `vesalaporra:local-test:${Date.now()}`,
          data: {
            url:
              "/?source=local-notification-test",
          },
        },
      );

      setFeedback({
        type: "success",
        message:
          "Prova local enviada a aquest dispositiu.",
      });
    } catch (error) {
      console.error(
        "[VESALAPORRA_PUSH] Error mostrant la prova local:",
        error,
      );

      setFeedback({
        type: "error",
        message:
          error?.message ||
          "Aquest dispositiu no ha pogut mostrar la notificació de prova.",
      });
    } finally {
      setTestWorking(false);
    }
  };

  const permissionBlocked =
    pushState.permission === "denied";

  const permissionBlocked =
    pushState.permission === "denied";

  const statusLabel = loading
    ? "COMPROVANT"
    : !pushState.supported
      ? "NO DISPONIBLE"
      : permissionBlocked
        ? "BLOQUEJADES"
        : pushState.enabled
          ? "ACTIVES"
          : "DESACTIVADES";

  const buttonLabel = loading
    ? "COMPROVANT..."
    : working
      ? pushState.enabled
        ? "DESACTIVANT..."
        : "ACTIVANT..."
      : !pushState.supported
        ? "NO DISPONIBLE EN AQUEST NAVEGADOR"
        : permissionBlocked &&
            !pushState.enabled
          ? "BLOQUEJADES AL NAVEGADOR"
          : pushState.enabled
            ? "DESACTIVA NOTIFICACIONS"
            : "ACTIVA NOTIFICACIONS";

  return (
    <>
      <style>{`
        .vlp-push-card {
          display: grid;
          gap: 18px;
          margin: 0 0 22px;
          padding: 20px;
          border: 1px solid rgba(250, 204, 21, 0.22);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(37, 99, 235, 0.17),
              transparent 46%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(190, 24, 93, 0.13),
              transparent 48%
            ),
            rgba(10, 15, 31, 0.92);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.045);
        }

        .vlp-push-head {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .vlp-push-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border: 1px solid rgba(250, 204, 21, 0.34);
          border-radius: 16px;
          background: rgba(250, 204, 21, 0.09);
          font-size: 23px;
        }

        .vlp-push-copy {
          min-width: 0;
          flex: 1 1 auto;
        }

        .vlp-push-copy span {
          display: block;
          margin-bottom: 4px;
          color: #facc15;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.13em;
        }

        .vlp-push-copy strong {
          display: block;
          color: #f8fafc;
          font-size: 18px;
          line-height: 1.16;
        }

        .vlp-push-copy p {
          margin: 7px 0 0;
          color: #929db6;
          font-size: 12px;
          line-height: 1.55;
        }

        .vlp-push-status {
          flex: 0 0 auto;
          padding: 8px 11px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          color: #9aa5bd;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.1em;
        }

        .vlp-push-status.active {
          border-color: rgba(34, 197, 94, 0.34);
          background: rgba(34, 197, 94, 0.09);
          color: #86efac;
        }

        .vlp-push-status.blocked {
          border-color: rgba(239, 68, 68, 0.34);
          background: rgba(239, 68, 68, 0.08);
          color: #fda4af;
        }

        .vlp-push-events {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 8px;
        }

        .vlp-push-events span {
          display: grid;
          place-items: center;
          min-height: 48px;
          padding: 8px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.42);
          color: #cbd5e1;
          font-size: 9px;
          font-weight: 850;
          line-height: 1.3;
          text-align: center;
        }

        .vlp-push-blocked-help {
          margin: 0;
          padding: 11px 13px;
          border: 1px solid rgba(239, 68, 68, 0.24);
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.065);
          color: #fecdd3;
          font-size: 11px;
          line-height: 1.5;
        }

        .vlp-push-toggle {
          width: 100%;
          min-height: 46px;
          padding: 11px 18px;
          border: 1px solid rgba(250, 204, 21, 0.52);
          border-radius: 999px;
          background:
            linear-gradient(
              135deg,
              rgba(250, 204, 21, 0.17),
              rgba(15, 23, 42, 0.95)
            );
          color: #fde68a;
          font: inherit;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .vlp-push-toggle.is-enabled {
          border-color: rgba(239, 68, 68, 0.32);
          background:
            linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.09),
              rgba(15, 23, 42, 0.95)
            );
          color: #fecdd3;
        }

                .vlp-push-toggle:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .vlp-push-test-button {
          width: 100%;
          min-height: 42px;
          padding: 10px 16px;
          border: 1px solid rgba(96, 165, 250, 0.38);
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.08);
          color: #bfdbfe;
          font: inherit;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .vlp-push-test-button:disabled {
          cursor: default;
          opacity: 0.5;
        }

        .vlp-push-feedback {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 13px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.45;
        }

        .vlp-push-feedback.success {
          border-color: rgba(34, 197, 94, 0.28);
          background: rgba(34, 197, 94, 0.065);
          color: #bbf7d0;
        }

        .vlp-push-feedback.error {
          border-color: rgba(239, 68, 68, 0.28);
          background: rgba(239, 68, 68, 0.065);
          color: #fecdd3;
        }

        .vlp-push-feedback button {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.07);
          color: currentColor;
          font-size: 15px;
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .vlp-push-card {
            padding: 16px;
            border-radius: 19px;
          }

          .vlp-push-head {
            align-items: flex-start;
          }

          .vlp-push-status {
            margin-left: auto;
          }

          .vlp-push-events {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .vlp-push-events span:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 430px) {
          .vlp-push-icon {
            width: 42px;
            height: 42px;
            flex-basis: 42px;
            border-radius: 14px;
            font-size: 20px;
          }

          .vlp-push-copy strong {
            font-size: 16px;
          }

          .vlp-push-status {
            padding: 7px 8px;
            font-size: 7px;
          }
        }
      `}</style>

      <section
        className="vlp-push-card"
        aria-label="Preferències de notificacions"
      >
        <div className="vlp-push-head">
          <span
            className="vlp-push-icon"
            aria-hidden="true"
          >
            🔔
          </span>

          <div className="vlp-push-copy">
            <span>AVISOS DE VESALAPORRA</span>

            <strong>Notificacions</strong>

            <p>
              Rep només els avisos importants del
              joc en aquest dispositiu.
            </p>
          </div>

          <span
            className={[
              "vlp-push-status",
              pushState.enabled ? "active" : "",
              permissionBlocked ? "blocked" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {statusLabel}
          </span>
        </div>

        <div
          className="vlp-push-events"
          aria-label="Tipus de notificacions"
        >
          <span>PORRA OBERTA</span>
          <span>TANCA EN 30 MIN</span>
          <span>LES NOTES</span>
          <span>PUNTS I GUANYADOR</span>
          <span>MEDALLES</span>
        </div>

        {permissionBlocked && (
          <p
            className="vlp-push-blocked-help"
            role="alert"
          >
            Chrome té les notificacions bloquejades
            per a Vesalaporra. Hauràs de
            permetre-les des dels controls del lloc
            del navegador.
          </p>
        )}

               <button
          type="button"
          role="switch"
          aria-checked={pushState.enabled}
          className={
            pushState.enabled
              ? "vlp-push-toggle is-enabled"
              : "vlp-push-toggle"
          }
          disabled={
            loading ||
            working ||
            !pushState.supported ||
            (permissionBlocked &&
              !pushState.enabled)
          }
          onClick={handleTogglePush}
        >
          {buttonLabel}
        </button>

        {pushState.enabled && (
          <button
            type="button"
            className="vlp-push-test-button"
            disabled={
              loading ||
              working ||
              testWorking ||
              permissionBlocked
            }
            onClick={handleLocalNotificationTest}
          >
            {testWorking
              ? "ENVIANT PROVA..."
              : "PROVA EN AQUEST DISPOSITIU"}
          </button>
        )}

        {feedback?.message && (
          <div
            className={`vlp-push-feedback ${feedback.type}`}
            role={
              feedback.type === "error"
                ? "alert"
                : "status"
            }
            aria-live="polite"
          >
            <span>{feedback.message}</span>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Tanca el missatge de notificacions"
            >
              ×
            </button>
          </div>
        )}
      </section>
    </>
  );
}