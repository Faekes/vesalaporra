import { supabase } from "./supabaseClient";

const VAPID_PUBLIC_KEY = String(
  import.meta.env.VITE_VAPID_PUBLIC_KEY || "",
).trim();

const createAuditId = (action) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `VLP_PUSH_${action}_${timestamp}_${randomPart}`;
};

const urlBase64ToUint8Array = (base64String) => {
  const normalized = String(
    base64String || "",
  ).trim();

  if (!normalized) {
    throw new Error(
      "VAPID_PUBLIC_KEY_MISSING",
    );
  }

  const padding = "=".repeat(
    (4 - (normalized.length % 4)) % 4,
  );

  const base64 = (
    normalized + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  const outputArray =
    new Uint8Array(
      rawData.length,
    );

  for (
    let index = 0;
    index < rawData.length;
    index += 1
  ) {
    outputArray[index] =
      rawData.charCodeAt(index);
  }

  return outputArray;
};

const arrayBufferToBase64Url = (
  buffer,
) => {
  if (!buffer) {
    return "";
  }

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary +=
      String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const getAuthenticatedUser =
  async () => {
    const {
      data: { user },
      error,
    } =
      await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!user) {
      throw new Error(
        "AUTH_REQUIRED",
      );
    }

    return user;
  };

const getReadyServiceWorker =
  async () => {
    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {
      throw new Error(
        "SERVICE_WORKER_NOT_SUPPORTED",
      );
    }

    return navigator
      .serviceWorker
      .ready;
  };

export const isPushSupported =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    return (
      "serviceWorker" in
        navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  };

export const getCurrentPushSubscription =
  async () => {
    if (!isPushSupported()) {
      return null;
    }

    const registration =
      await getReadyServiceWorker();

    return registration
      .pushManager
      .getSubscription();
  };

export const readMyPushState =
  async () => {
    await getAuthenticatedUser();

    const currentSubscription =
      await getCurrentPushSubscription();

    const endpoint =
      currentSubscription?.endpoint ||
      null;

    const { data, error } =
      await supabase.rpc(
        "vesalaporra_my_push_state",
        {
          p_endpoint: endpoint,
        },
      );

    if (error) {
      throw error;
    }

    return {
      supported:
        isPushSupported(),

      permission:
        typeof Notification !==
        "undefined"
          ? Notification.permission
          : "unsupported",

      browserSubscribed:
        Boolean(
          currentSubscription,
        ),

      endpoint,

      serverState: data,
    };
  };

export const enablePushNotifications =
  async () => {
    if (!isPushSupported()) {
      throw new Error(
        "PUSH_NOT_SUPPORTED",
      );
    }

    await getAuthenticatedUser();

    if (!VAPID_PUBLIC_KEY) {
      throw new Error(
        "VAPID_PUBLIC_KEY_MISSING",
      );
    }

    let permission =
      Notification.permission;

    if (
      permission === "default"
    ) {
      permission =
        await Notification
          .requestPermission();
    }

    if (
      permission !== "granted"
    ) {
      throw new Error(
        permission === "denied"
          ? "NOTIFICATION_PERMISSION_DENIED"
          : "NOTIFICATION_PERMISSION_NOT_GRANTED",
      );
    }

    const registration =
      await getReadyServiceWorker();

    let subscription =
      await registration
        .pushManager
        .getSubscription();

    if (!subscription) {
      subscription =
        await registration
          .pushManager
          .subscribe({
            userVisibleOnly:
              true,

            applicationServerKey:
              urlBase64ToUint8Array(
                VAPID_PUBLIC_KEY,
              ),
          });
    }

    const p256dh =
      arrayBufferToBase64Url(
        subscription.getKey(
          "p256dh",
        ),
      );

    const authKey =
      arrayBufferToBase64Url(
        subscription.getKey(
          "auth",
        ),
      );

    if (
      !p256dh ||
      !authKey
    ) {
      throw new Error(
        "PUSH_SUBSCRIPTION_KEYS_MISSING",
      );
    }

    const auditId =
      createAuditId(
        "REGISTER",
      );

    const { data, error } =
      await supabase.rpc(
        "vesalaporra_register_push_subscription",
        {
          p_endpoint:
            subscription.endpoint,

          p_p256dh:
            p256dh,

          p_auth_key:
            authKey,

          p_user_agent:
            navigator.userAgent ||
            null,

          p_device_label:
            [
              navigator.platform ||
                "",

              navigator.vendor ||
                "",
            ]
              .filter(Boolean)
              .join(" · ") ||
            null,

          p_expiration_time:
            subscription
              .expirationTime ||
            null,

          p_audit_id:
            auditId,
        },
      );

    if (error) {
      try {
        await subscription
          .unsubscribe();
      } catch (
        unsubscribeError
      ) {
        console.warn(
          "[VESALAPORRA_PUSH] No s'ha pogut revertir la subscripció local.",
          unsubscribeError,
        );
      }

      throw error;
    }

    return {
      status:
        "PUSH_ENABLED",

      permission,

      subscription,

      serverState: data,

      auditId,
    };
  };

export const disablePushNotifications =
  async () => {
    await getAuthenticatedUser();

    const subscription =
      await getCurrentPushSubscription();

    const endpoint =
      subscription?.endpoint ||
      null;

    const auditId =
      createAuditId(
        "DISABLE_DEVICE",
      );

    /*
     * IMPORTANT:
     *
     * Només desactivem la subscripció
     * corresponent a aquest endpoint.
     *
     * No posem push_enabled=false,
     * perquè aquesta preferència és
     * global i desactivaria també els
     * altres dispositius de l'usuari.
     */

    if (endpoint) {
      const {
        data:
          disabledSubscriptionData,

        error:
          disableSubscriptionError,
      } =
        await supabase.rpc(
          "vesalaporra_disable_push_subscription",
          {
            p_endpoint:
              endpoint,

            p_audit_id:
              auditId,
          },
        );

      if (
        disableSubscriptionError
      ) {
        throw disableSubscriptionError;
      }

      if (subscription) {
        const unsubscribed =
          await subscription
            .unsubscribe();

        if (!unsubscribed) {
          console.warn(
            "[VESALAPORRA_PUSH] El navegador no ha confirmat la baixa local.",
          );
        }
      }

      return {
        status:
          "PUSH_DISABLED_ON_DEVICE",

        endpoint,

        serverState:
          disabledSubscriptionData,

        auditId,
      };
    }

    return {
      status:
        "PUSH_ALREADY_DISABLED_ON_DEVICE",

      endpoint: null,

      serverState: null,

      auditId,
    };
  };

export const getPushErrorMessage =
  (error) => {
    const code = String(
      error?.message ||
        error ||
        "",
    ).trim();

    const messages = {
      AUTH_REQUIRED:
        "Has d’iniciar sessió per activar les notificacions.",

      PUSH_NOT_SUPPORTED:
        "Aquest navegador no admet notificacions Push.",

      SERVICE_WORKER_NOT_SUPPORTED:
        "Aquest navegador no admet el sistema necessari per a les notificacions.",

      VAPID_PUBLIC_KEY_MISSING:
        "Falta configurar la clau pública de notificacions.",

      NOTIFICATION_PERMISSION_DENIED:
        "Has bloquejat les notificacions al navegador. Caldrà permetre-les des de la configuració del lloc.",

      NOTIFICATION_PERMISSION_NOT_GRANTED:
        "No s’ha concedit permís per enviar notificacions.",

      PUSH_SUBSCRIPTION_KEYS_MISSING:
        "El navegador no ha retornat correctament les claus de la subscripció.",
    };

    return (
      messages[code] ||
      "No s’han pogut configurar les notificacions. Torna-ho a provar."
    );
  };