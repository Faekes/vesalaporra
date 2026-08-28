  if (setupCompleted) {
    return (
      <>
        <style>{`
          .vlp-push-mobile-compact {
            display: none;
          }

          @media (max-width: 700px) {
            .vlp-push-mobile-compact {
              display: flex;
              align-items: center;
              gap: 12px;
              width: 100%;
              margin: 0 0 18px;
              padding: 13px 15px;
              border: 1px solid rgba(250, 204, 21, 0.22);
              border-radius: 17px;
              background: rgba(10, 15, 31, 0.92);
              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.04);
              color: inherit;
              font: inherit;
              text-align: left;
              cursor: pointer;
              box-sizing: border-box;
              appearance: none;
              -webkit-appearance: none;
            }

            .vlp-push-mobile-compact:disabled {
              cursor: default;
              opacity: 0.55;
            }

            .vlp-push-mobile-compact-icon {
              display: grid;
              place-items: center;
              width: 38px;
              height: 38px;
              flex: 0 0 38px;
              border: 1px solid rgba(250, 204, 21, 0.34);
              border-radius: 13px;
              background: rgba(250, 204, 21, 0.08);
              font-size: 18px;
            }

            .vlp-push-mobile-compact-copy {
              min-width: 0;
              flex: 1 1 auto;
            }

            .vlp-push-mobile-compact-copy span {
              display: block;
              margin-bottom: 2px;
              color: #facc15;
              font-size: 8px;
              font-weight: 950;
              letter-spacing: 0.11em;
            }

            .vlp-push-mobile-compact-copy strong {
              display: block;
              color: #f8fafc;
              font-size: 14px;
              line-height: 1.2;
            }

            .vlp-push-mobile-compact-status {
              flex: 0 0 auto;
              color: ${
                pushState.enabled
                  ? "#86efac"
                  : "#fecdd3"
              };
              font-size: 8px;
              font-weight: 1000;
              letter-spacing: 0.09em;
            }

            .vlp-push-mobile-feedback {
              display: block;
              margin: -8px 0 18px;
              padding: 9px 12px;
              border: 1px solid rgba(34, 197, 94, 0.28);
              border-radius: 13px;
              background: rgba(34, 197, 94, 0.065);
              color: #bbf7d0;
              font-size: 10px;
              font-weight: 850;
              text-align: center;
            }

            .vlp-push-mobile-feedback.error {
              border-color: rgba(239, 68, 68, 0.28);
              background: rgba(239, 68, 68, 0.065);
              color: #fecdd3;
            }
          }
        `}</style>

        <button
          type="button"
          role="switch"
          aria-checked={pushState.enabled}
          aria-label={inlineButtonLabel}
          className="vlp-push-mobile-compact"
          disabled={buttonDisabled}
          onClick={handleTogglePush}
        >
          <span
            className="vlp-push-mobile-compact-icon"
            aria-hidden="true"
          >
            🔔
          </span>

          <span className="vlp-push-mobile-compact-copy">
            <span>AVISOS DE VESALAPORRA</span>
            <strong>
              {working
                ? "Actualitzant..."
                : "Notificacions"}
            </strong>
          </span>

          <strong className="vlp-push-mobile-compact-status">
            {working
              ? "ESPERA"
              : compactStatusLabel}
          </strong>
        </button>

        {feedback?.message && (
          <div
            className={`vlp-push-mobile-feedback ${feedback.type}`}
            role={
              feedback.type === "error"
                ? "alert"
                : "status"
            }
            aria-live="polite"
          >
            {feedback.message}
          </div>
        )}
      </>
    );
  }