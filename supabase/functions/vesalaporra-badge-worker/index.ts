// =========================================================
// VESALAPORRA · BADGE WORKER
// worker_id: VLP_EDGE_BADGE_WORKER_V1_1_20260714_040
//
// Implementat:
//   ready_portrait_import
//     - descarrega una xapa ja preparada;
//     - comprova mida, pes i proporció;
//     - normalitza a WebP 1024 × 1024;
//     - crea una preview privada;
//     - deixa el job awaiting_review.
//   publish
//     - descarrega la preview privada aprovada;
//     - la copia al bucket públic versionat;
//     - finalitza la publicació amb la RPC canònica.
//
// Encara no implementat:
//   ai_portrait_then_css
//
// Seguretat:
//   - exigeix usuari autenticat;
//   - comprova que sigui administrador Vesalaporra;
//   - usa service role només dins l’Edge Function;
//   - mai publica automàticament;
//   - només publica després de revisió admin aprovada;
//   - mai exposa la foto original privada.
// =========================================================

import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "@imagemagick/magick-wasm";

import { withSupabase } from "@supabase/server";

// ---------------------------------------------------------
// TIPUS MÍNIMS DE LA BASE DE DADES
//
// Declarem exclusivament les RPC utilitzades pel worker.
// Això permet que Supabase validi correctament els seus
// arguments sense necessitar generar encara tots els tipus.
// ---------------------------------------------------------

type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]:
        | Json
        | undefined;
    }
  | Json[];

type Database = {
  public: {
    Tables: {
      vesalaporra_badge_jobs: {
        Row: {
          id: string;
          player_id: string;
          status: string;
          review_status: string;
          publication_status: string;
          preview_bucket: string | null;
          preview_path: string | null;
          target_bucket: string | null;
          target_path: string | null;
          target_version: number | null;
          target_mime_type: string | null;
        };

        Insert: {
          id?: string;
          player_id: string;
          status?: string;
          review_status?: string;
          publication_status?: string;
          preview_bucket?: string | null;
          preview_path?: string | null;
          target_bucket?: string | null;
          target_path?: string | null;
          target_version?: number | null;
          target_mime_type?: string | null;
        };

        Update: {
          id?: string;
          player_id?: string;
          status?: string;
          review_status?: string;
          publication_status?: string;
          preview_bucket?: string | null;
          preview_path?: string | null;
          target_bucket?: string | null;
          target_path?: string | null;
          target_version?: number | null;
          target_mime_type?: string | null;
        };

        Relationships: [];
      };
    };

    Views: Record<
      string,
      never
    >;

    Functions: {
      vesalaporra_current_user_is_admin: {
        Args: Record<
          PropertyKey,
          never
        >;

        Returns:
          boolean;
      };

      vesalaporra_worker_claim_badge_job: {
        Args: {
          p_job_id:
            string | null;

          p_worker_id:
            string;

          p_audit_id:
            string;
        };

        Returns:
          Json;
      };

      vesalaporra_worker_complete_badge_preview: {
        Args: {
          p_job_id:
            string;

          p_preview_path:
            string;

          p_generated_subject_path:
            string | null;

          p_ai_request_id:
            string | null;

          p_result_payload:
            Json;

          p_worker_id:
            string;

          p_audit_id:
            string;
        };

        Returns:
          Json;
      };

      vesalaporra_worker_fail_badge_job: {
        Args: {
          p_job_id:
            string;

          p_error_code:
            string;

          p_error_message:
            string;

          p_result_payload:
            Json;

          p_worker_id:
            string;

          p_audit_id:
            string;
        };

        Returns:
          Json;
      };

      vesalaporra_worker_publish_approved_badge_job: {
        Args: {
          p_job_id:
            string;

          p_worker_id:
            string;

          p_audit_id:
            string;
        };

        Returns:
          Json;
      };
    };

    Enums: Record<
      string,
      never
    >;

    CompositeTypes: Record<
      string,
      never
    >;
  };
};

// ---------------------------------------------------------
// 1. INICIALITZAR IMAGEMAGICK WASM
// ---------------------------------------------------------

const magickPackageUrl = import.meta.resolve(
  "@imagemagick/magick-wasm",
);

const magickWasmUrl = new URL(
  "magick.wasm",
  magickPackageUrl,
);

const wasmBytes = await Deno.readFile(
  magickWasmUrl,
);

await initializeImageMagick(
  wasmBytes,
);

// ---------------------------------------------------------
// 2. CONSTANTS
// ---------------------------------------------------------

const FUNCTION_NAME =
  "vesalaporra-badge-worker";

const WORKER_VERSION =
  "VLP_EDGE_BADGE_WORKER_V1_1_20260714_040";

const TARGET_SIZE =
  1024;

const MAX_SOURCE_BYTES =
  5 * 1024 * 1024;

const MIN_SOURCE_SIDE =
  512;

const MAX_ASPECT_RATIO_DIFFERENCE =
  0.025;

const deploymentId =
  Deno.env.get("DENO_DEPLOYMENT_ID")
  ?? "local";

const executionId =
  Deno.env.get("SB_EXECUTION_ID")
  ?? crypto.randomUUID();

const WORKER_ID =
  `${FUNCTION_NAME}:${deploymentId}`;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

// ---------------------------------------------------------
// 3. TIPUS
// ---------------------------------------------------------

type WorkerRequest = {
  action?: "health" | "process" | "publish";
  job_id?: string;
};

type ClaimedJob = {
  status: string;
  audit_id?: string;

  job_id?: string;
  player_id?: string;

  processing_mode?: string;
  presentation_mode?: string;
  css_contract_version?: string;

  source_bucket?: string;
  source_path?: string;
  source_version?: number;
  source_mime_type?: string;

  preview_bucket?: string;
  expected_preview_path?: string;
  expected_subject_path?: string | null;

  target_bucket?: string;
  target_path?: string;
  target_version?: number;

  attempt_count?: number;
};

type CompletePreviewResult = {
  status?: string;
  review_status?: string;
  publication_status?: string;
  badge_processing_status?: string;
};

type PublishableJob = {
  id: string;
  player_id: string;
  status: string;
  review_status: string;
  publication_status: string;
  preview_bucket: string | null;
  preview_path: string | null;
  target_bucket: string | null;
  target_path: string | null;
  target_version: number | null;
  target_mime_type: string | null;
};

type PublishResult = {
  status?: string;
  job_id?: string;
  player_id?: string;
  target_bucket?: string;
  target_path?: string;
  target_version?: number;
  publication_status?: string;
  badge_processing_status?: string;
};

class WorkerError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
  ) {
    super(message);

    this.name =
      "WorkerError";

    this.statusCode =
      statusCode;

    this.errorCode =
      errorCode;
  }
}

// ---------------------------------------------------------
// 4. HELPERS HTTP
// ---------------------------------------------------------

const jsonResponse = (
  body: unknown,
  status = 200,
): Response => {
  return Response.json(
    body,
    {
      status,
      headers: CORS_HEADERS,
    },
  );
};

const createAuditId = (
  action: string,
): string => {
  const cleanAction = action
    .toUpperCase()
    .replace(
      /[^A-Z0-9_]/g,
      "_",
    )
    .slice(
      0,
      40,
    );

  return [
    "VLP_EDGE",
    cleanAction,
    "20260714_040",
    crypto.randomUUID(),
  ].join("_");
};

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return String(error);
};

const getErrorCode = (
  error: unknown,
): string => {
  if (
    error instanceof WorkerError
  ) {
    return error.errorCode;
  }

  return "UNEXPECTED_WORKER_ERROR";
};

const getHttpStatus = (
  error: unknown,
): number => {
  if (
    error instanceof WorkerError
  ) {
    return error.statusCode;
  }

  return 500;
};

const requireUuid = (
  value: unknown,
  fieldName: string,
): string => {
  const normalized =
    String(value ?? "").trim();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !uuidPattern.test(
      normalized,
    )
  ) {
    throw new WorkerError(
      400,
      "INVALID_UUID",
      `${fieldName} no és un UUID vàlid.`,
    );
  }

  return normalized;
};

// ---------------------------------------------------------
// 5. NORMALITZAR XAPA PREPARADA
// ---------------------------------------------------------

const normalizePreparedPortrait = (
  sourceBytes: Uint8Array,
): Uint8Array => {
  if (
    sourceBytes.byteLength === 0
  ) {
    throw new WorkerError(
      422,
      "EMPTY_SOURCE_IMAGE",
      "La imatge original està buida.",
    );
  }

  if (
    sourceBytes.byteLength
      > MAX_SOURCE_BYTES
  ) {
    throw new WorkerError(
      413,
      "SOURCE_IMAGE_TOO_LARGE",
      "La imatge supera el límit de 5 MB.",
    );
  }

  return ImageMagick.read(
    sourceBytes,

    (image): Uint8Array => {
      const width =
        image.width;

      const height =
        image.height;

      if (
        width < MIN_SOURCE_SIDE
        || height < MIN_SOURCE_SIDE
      ) {
        throw new WorkerError(
          422,
          "SOURCE_IMAGE_TOO_SMALL",
          [
            "La imatge és massa petita.",
            `Mida rebuda: ${width} × ${height}.`,
            `Mínim: ${MIN_SOURCE_SIDE} × ${MIN_SOURCE_SIDE}.`,
          ].join(" "),
        );
      }

      const aspectRatio =
        width / height;

      const ratioDifference =
        Math.abs(
          aspectRatio - 1,
        );

      if (
        ratioDifference
          > MAX_ASPECT_RATIO_DIFFERENCE
      ) {
        throw new WorkerError(
          422,
          "PREPARED_PORTRAIT_MUST_BE_SQUARE",
          [
            "Les xapes ja preparades han de ser quadrades.",
            `Mida rebuda: ${width} × ${height}.`,
          ].join(" "),
        );
      }

      // La il·lustració ja està acabada.
      //
      // Només normalitzem:
      //   - mida;
      //   - format;
      //   - pes final.
      //
      // No retallem:
      //   - cercle;
      //   - fons;
      //   - samarreta;
      //   - cap;
      //   - espatlles.
      //
      // No afegim:
      //   - marc;
      //   - ombra;
      //   - brillantor;
      //   - text;
      //   - logos.

      image.resize(
        TARGET_SIZE,
        TARGET_SIZE,
      );

      return image.write(
        MagickFormat.WebP,

        (outputBytes): Uint8Array =>
          Uint8Array.from(
            outputBytes,
          ),
      );
    },
  );
};

// ---------------------------------------------------------
// 6. EDGE FUNCTION
// ---------------------------------------------------------

export default {
  fetch: withSupabase<Database>(
    {
      auth: "user",
    },

    async (
      req,
      ctx,
    ) => {
      // ---------------------------------------------------
      // A. CORS PREFLIGHT
      // ---------------------------------------------------

      if (
        req.method === "OPTIONS"
      ) {
        return new Response(
          "ok",
          {
            status: 200,
            headers: CORS_HEADERS,
          },
        );
      }

      // ---------------------------------------------------
      // B. NOMÉS POST
      // ---------------------------------------------------

      if (
        req.method !== "POST"
      ) {
        return jsonResponse(
          {
            status:
              "METHOD_NOT_ALLOWED",

            allowed_methods: [
              "POST",
              "OPTIONS",
            ],
          },

          405,
        );
      }

      // ---------------------------------------------------
      // C. LLEGIR JSON
      // ---------------------------------------------------

      let requestBody:
        WorkerRequest;

      try {
        requestBody =
          await req.json() as WorkerRequest;
      } catch {
        return jsonResponse(
          {
            status:
              "INVALID_JSON",

            error:
              "El cos de la petició ha de ser JSON.",
          },

          400,
        );
      }

      // ---------------------------------------------------
      // D. COMPROVAR ADMIN
      // ---------------------------------------------------

      const {
        data: isAdmin,
        error: adminCheckError,
      } = await ctx.supabase.rpc(
        "vesalaporra_current_user_is_admin",
      );

      if (
        adminCheckError
      ) {
        console.error(
          "Admin check error:",
          adminCheckError,
        );

        return jsonResponse(
          {
            status:
              "ADMIN_CHECK_FAILED",

            error:
              "No s'ha pogut comprovar el rol administrador.",
          },

          500,
        );
      }

      if (
        isAdmin !== true
      ) {
        return jsonResponse(
          {
            status:
              "ADMIN_REQUIRED",

            error:
              "Accés administratiu requerit.",
          },

          403,
        );
      }

      // ---------------------------------------------------
      // E. HEALTH CHECK
      // ---------------------------------------------------

      if (
        requestBody.action ===
          "health"
      ) {
        return jsonResponse(
          {
            status:
              "BADGE_WORKER_READY",

            worker_version:
              WORKER_VERSION,

            worker_id:
              WORKER_ID,

            deployment_id:
              deploymentId,

            execution_id:
              executionId,

            supported_actions: [
              "health",
              "process",
              "publish",
            ],

            supported_processing_modes: [
              "ready_portrait_import",
            ],

            pending_processing_modes: [
              "ai_portrait_then_css",
            ],

            target_size:
              TARGET_SIZE,

            target_format:
              "image/webp",

            automatic_publication:
              false,

            admin_review_required:
              true,
          },
        );
      }

      // ---------------------------------------------------
      // F. VALIDAR ACCIÓ I JOB_ID
      // ---------------------------------------------------

      const requestedAction =
        requestBody.action
        ?? "process";

      if (
        requestedAction !== "process"
        && requestedAction !== "publish"
      ) {
        return jsonResponse(
          {
            status:
              "UNSUPPORTED_ACTION",

            error:
              `Acció no suportada: ${requestedAction}`,

            supported_actions: [
              "health",
              "process",
              "publish",
            ],
          },

          400,
        );
      }

      const requestedJobId =
        requireUuid(
          requestBody.job_id,
          "job_id",
        );

      // ---------------------------------------------------
      // G. PUBLICAR PREVIEW APROVADA
      // ---------------------------------------------------

      if (
        requestedAction === "publish"
      ) {
        try {
          const {
            data: publishJobData,
            error: publishJobError,
          } = await ctx.supabaseAdmin
            .from(
              "vesalaporra_badge_jobs",
            )
            .select(
              [
                "id",
                "player_id",
                "status",
                "review_status",
                "publication_status",
                "preview_bucket",
                "preview_path",
                "target_bucket",
                "target_path",
                "target_version",
                "target_mime_type",
              ].join(", "),
            )
            .eq(
              "id",
              requestedJobId,
            )
            .maybeSingle();

          if (
            publishJobError
          ) {
            throw new WorkerError(
              500,
              "PUBLISH_JOB_READ_FAILED",
              publishJobError.message,
            );
          }

          if (
            !publishJobData
          ) {
            throw new WorkerError(
              404,
              "PUBLISH_JOB_NOT_FOUND",
              "No s'ha trobat el job que s'ha de publicar.",
            );
          }

          const publishJob =
            publishJobData as PublishableJob;

          if (
            publishJob.publication_status ===
              "published"
          ) {
            return jsonResponse(
              {
                status:
                  "BADGE_PUBLISHED",

                already_published:
                  true,

                worker_version:
                  WORKER_VERSION,

                worker_id:
                  WORKER_ID,

                execution_id:
                  executionId,

                job_id:
                  publishJob.id,

                player_id:
                  publishJob.player_id,

                target_bucket:
                  publishJob.target_bucket,

                target_path:
                  publishJob.target_path,

                target_version:
                  publishJob.target_version,

                publication_status:
                  "published",
              },
            );
          }

          if (
            publishJob.status !== "completed"
            || publishJob.review_status !== "approved"
            || publishJob.publication_status !== "pending"
          ) {
            throw new WorkerError(
              409,
              "BADGE_JOB_NOT_READY_TO_PUBLISH",
              [
                "El job no està preparat per publicar.",
                `status=${publishJob.status}`,
                `review_status=${publishJob.review_status}`,
                `publication_status=${publishJob.publication_status}`,
              ].join(" "),
            );
          }

          if (
            !publishJob.preview_bucket
            || !publishJob.preview_path
            || !publishJob.target_bucket
            || !publishJob.target_path
          ) {
            throw new WorkerError(
              500,
              "INCOMPLETE_PUBLISH_PAYLOAD",
              "El job aprovat no conté totes les rutes de publicació.",
            );
          }

          const {
            data: previewBlob,
            error: previewDownloadError,
          } = await ctx.supabaseAdmin
            .storage
            .from(
              publishJob.preview_bucket,
            )
            .download(
              publishJob.preview_path,
            );

          if (
            previewDownloadError
            || !previewBlob
          ) {
            throw new WorkerError(
              404,
              "APPROVED_PREVIEW_DOWNLOAD_FAILED",
              previewDownloadError?.message
                ?? "No s'ha pogut descarregar la preview aprovada.",
            );
          }

          const previewBytes =
            new Uint8Array(
              await previewBlob.arrayBuffer(),
            );

          if (
            previewBytes.byteLength === 0
          ) {
            throw new WorkerError(
              422,
              "APPROVED_PREVIEW_EMPTY",
              "La preview aprovada està buida.",
            );
          }

          const {
            error: targetUploadError,
          } = await ctx.supabaseAdmin
            .storage
            .from(
              publishJob.target_bucket,
            )
            .upload(
              publishJob.target_path,
              previewBytes,

              {
                contentType:
                  publishJob.target_mime_type
                  ?? "image/webp",

                cacheControl:
                  "31536000",

                upsert:
                  true,
              },
            );

          if (
            targetUploadError
          ) {
            throw new WorkerError(
              500,
              "PUBLIC_PORTRAIT_UPLOAD_FAILED",
              targetUploadError.message,
            );
          }

          const publishAuditId =
            createAuditId(
              "BADGE_PORTRAIT_PUBLISH",
            );

          const {
            data: publishData,
            error: publishError,
          } = await ctx.supabaseAdmin.rpc(
            "vesalaporra_worker_publish_approved_badge_job",

            {
              p_job_id:
                requestedJobId,

              p_worker_id:
                WORKER_ID,

              p_audit_id:
                publishAuditId,
            },
          );

          if (
            publishError
          ) {
            throw new WorkerError(
              500,
              "BADGE_PUBLISH_RPC_FAILED",
              publishError.message,
            );
          }

          const published =
            publishData as PublishResult | null;

          if (
            published?.status !==
              "BADGE_PORTRAIT_PUBLISHED"
            && published?.status !==
              "BADGE_JOB_ALREADY_PUBLISHED"
          ) {
            throw new WorkerError(
              500,
              "UNEXPECTED_PUBLISH_STATUS",
              `Estat inesperat publicant: ${published?.status ?? "sense estat"}`,
            );
          }

          return jsonResponse(
            {
              status:
                "BADGE_PUBLISHED",

              worker_version:
                WORKER_VERSION,

              worker_id:
                WORKER_ID,

              execution_id:
                executionId,

              job_id:
                published?.job_id
                ?? publishJob.id,

              player_id:
                published?.player_id
                ?? publishJob.player_id,

              target_bucket:
                published?.target_bucket
                ?? publishJob.target_bucket,

              target_path:
                published?.target_path
                ?? publishJob.target_path,

              target_version:
                published?.target_version
                ?? publishJob.target_version,

              publication_status:
                published?.publication_status
                ?? "published",

              badge_processing_status:
                published?.badge_processing_status
                ?? "ready",

              copied_bytes:
                previewBytes.byteLength,
            },
          );
        } catch (
          error: unknown
        ) {
          const message =
            getErrorMessage(
              error,
            );

          const errorCode =
            getErrorCode(
              error,
            );

          const statusCode =
            getHttpStatus(
              error,
            );

          console.error(
            "Badge publish failure:",
            {
              errorCode,
              message,
              requestedJobId,
            },
          );

          return jsonResponse(
            {
              status:
                "BADGE_PUBLISH_FAILED",

              error_code:
                errorCode,

              error:
                message,

              worker_version:
                WORKER_VERSION,

              worker_id:
                WORKER_ID,

              execution_id:
                executionId,

              job_id:
                requestedJobId,
            },

            statusCode,
          );
        }
      }

      // ---------------------------------------------------
      // H. PROCESSAR UNA XAPA NOVA
      // ---------------------------------------------------

      const claimAuditId =
        createAuditId(
          "BADGE_JOB_CLAIM",
        );

      let claimedJob:
        ClaimedJob | null = null;

      try {
        // -------------------------------------------------
        // I. RECLAMAR JOB AMB SERVICE ROLE
        // -------------------------------------------------

        const {
          data: claimData,
          error: claimError,
        } = await ctx.supabaseAdmin.rpc(
          "vesalaporra_worker_claim_badge_job",

          {
            p_job_id:
              requestedJobId,

            p_worker_id:
              WORKER_ID,

            p_audit_id:
              claimAuditId,
          },
        );

        if (
          claimError
        ) {
          throw new WorkerError(
            500,
            "BADGE_JOB_CLAIM_FAILED",
            claimError.message,
          );
        }

        claimedJob =
          claimData as ClaimedJob;

        if (
          claimedJob.status ===
            "NO_QUEUED_BADGE_JOB"
        ) {
          throw new WorkerError(
            409,
            "BADGE_JOB_NOT_QUEUED",
            "El job no existeix o ja no està pendent.",
          );
        }

        if (
          claimedJob.status !==
            "BADGE_JOB_CLAIMED"
        ) {
          throw new WorkerError(
            500,
            "UNEXPECTED_CLAIM_STATUS",
            `Estat inesperat: ${claimedJob.status}`,
          );
        }

        // -------------------------------------------------
        // J. AQUESTA V1 NOMÉS PROCESSA XAPES PREPARADES
        // -------------------------------------------------

        if (
          claimedJob.processing_mode !==
            "ready_portrait_import"
        ) {
          throw new WorkerError(
            501,
            "AI_PORTRAIT_MODE_NOT_IMPLEMENTED",
            [
              "Aquesta versió del worker només processa",
              "ready_portrait_import.",
            ].join(" "),
          );
        }

        if (
          !claimedJob.job_id
          || !claimedJob.player_id
          || !claimedJob.source_bucket
          || !claimedJob.source_path
          || !claimedJob.preview_bucket
          || !claimedJob.expected_preview_path
        ) {
          throw new WorkerError(
            500,
            "INCOMPLETE_CLAIM_PAYLOAD",
            "El job reclamat no conté totes les rutes requerides.",
          );
        }

        const claimedJobId =
          claimedJob.job_id;

        const claimedPlayerId =
          claimedJob.player_id;

        const sourceBucket =
          claimedJob.source_bucket;

        const sourcePath =
          claimedJob.source_path;

        const previewBucket =
          claimedJob.preview_bucket;

        const previewPath =
          claimedJob.expected_preview_path;

        // -------------------------------------------------
        // K. DESCARREGAR ORIGINAL PRIVAT
        // -------------------------------------------------

        const {
          data: sourceBlob,
          error: sourceDownloadError,
        } = await ctx.supabaseAdmin
          .storage
          .from(
            sourceBucket,
          )
          .download(
            sourcePath,
          );

        if (
          sourceDownloadError
          || !sourceBlob
        ) {
          throw new WorkerError(
            404,
            "SOURCE_DOWNLOAD_FAILED",
            sourceDownloadError?.message
              ?? "No s'ha pogut descarregar l'original.",
          );
        }

        const sourceBytes =
          new Uint8Array(
            await sourceBlob.arrayBuffer(),
          );

        // -------------------------------------------------
        // L. NORMALITZAR A WEBP 1024 × 1024
        // -------------------------------------------------

        const previewBytes =
          normalizePreparedPortrait(
            sourceBytes,
          );

        // -------------------------------------------------
        // M. PUJAR PREVIEW PRIVADA
        // -------------------------------------------------

        const {
          error: previewUploadError,
        } = await ctx.supabaseAdmin
          .storage
          .from(
            previewBucket,
          )
          .upload(
            previewPath,
            previewBytes,

            {
              contentType:
                "image/webp",

              cacheControl:
                "0",

              upsert:
                true,
            },
          );

        if (
          previewUploadError
        ) {
          throw new WorkerError(
            500,
            "PREVIEW_UPLOAD_FAILED",
            previewUploadError.message,
          );
        }

        // -------------------------------------------------
        // N. REGISTRAR PREVIEW COMPLETADA
        // -------------------------------------------------

        const completeAuditId =
          createAuditId(
            "BADGE_PREVIEW_COMPLETE",
          );

        const {
          data: completeData,
          error: completeError,
        } = await ctx.supabaseAdmin.rpc(
          "vesalaporra_worker_complete_badge_preview",

          {
            p_job_id:
              claimedJobId,

            p_preview_path:
              previewPath,

            p_generated_subject_path:
              null,

            p_ai_request_id:
              null,

            p_result_payload: {
              worker_version:
                WORKER_VERSION,

              worker_id:
                WORKER_ID,

              execution_id:
                executionId,

              processing_mode:
                claimedJob.processing_mode,

              input_bytes:
                sourceBytes.byteLength,

              output_bytes:
                previewBytes.byteLength,

              output_width:
                TARGET_SIZE,

              output_height:
                TARGET_SIZE,

              output_format:
                "webp",

              transformation:
                "resize_only_no_crop",

              baked_effects_added:
                false,

              automatic_publication:
                false,
            },

            p_worker_id:
              WORKER_ID,

            p_audit_id:
              completeAuditId,
          },
        );

        if (
          completeError
        ) {
          throw new WorkerError(
            500,
            "PREVIEW_COMPLETION_FAILED",
            completeError.message,
          );
        }

        const completed =
          completeData as CompletePreviewResult | null;

        return jsonResponse(
          {
            status:
              "BADGE_PREVIEW_READY",

            worker_version:
              WORKER_VERSION,

            worker_id:
              WORKER_ID,

            execution_id:
              executionId,

            job_id:
              claimedJobId,

            player_id:
              claimedPlayerId,

            processing_mode:
              claimedJob.processing_mode,

            source: {
              bucket:
                sourceBucket,

              path:
                sourcePath,

              bytes:
                sourceBytes.byteLength,
            },

            preview: {
              bucket:
                previewBucket,

              path:
                previewPath,

              bytes:
                previewBytes.byteLength,

              width:
                TARGET_SIZE,

              height:
                TARGET_SIZE,

              mime_type:
                "image/webp",
            },

            review_status:
              completed?.review_status
              ?? "pending",

            badge_processing_status:
              completed?.badge_processing_status
              ?? "awaiting_review",

            publication_status:
              completed?.publication_status
              ?? "not_ready",

            automatic_publication:
              false,
          },
        );
      } catch (
        error: unknown
      ) {
        const message =
          getErrorMessage(
            error,
          );

        const errorCode =
          getErrorCode(
            error,
          );

        const statusCode =
          getHttpStatus(
            error,
          );

        console.error(
          "Badge worker failure:",
          {
            errorCode,
            message,
            requestedJobId,
            claimedJob,
          },
        );

        // Si el job ja havia estat reclamat,
        // el deixem terminalment failed.

        if (
          claimedJob?.job_id
          && claimedJob.status ===
            "BADGE_JOB_CLAIMED"
        ) {
          const failAuditId =
            createAuditId(
              "BADGE_JOB_FAIL",
            );

          const {
            error: failRpcError,
          } = await ctx.supabaseAdmin.rpc(
            "vesalaporra_worker_fail_badge_job",

            {
              p_job_id:
                claimedJob.job_id,

              p_error_code:
                errorCode,

              p_error_message:
                message.slice(
                  0,
                  1000,
                ),

              p_result_payload: {
                worker_version:
                  WORKER_VERSION,

                worker_id:
                  WORKER_ID,

                execution_id:
                  executionId,

                original_error:
                  message,

                original_error_code:
                  errorCode,
              },

              p_worker_id:
                WORKER_ID,

              p_audit_id:
                failAuditId,
            },
          );

          if (
            failRpcError
          ) {
            console.error(
              "Could not register job failure:",
              failRpcError,
            );
          }
        }

        return jsonResponse(
          {
            status:
              "BADGE_WORKER_FAILED",

            error_code:
              errorCode,

            error:
              message,

            worker_version:
              WORKER_VERSION,

            worker_id:
              WORKER_ID,

            execution_id:
              executionId,

            job_id:
              claimedJob?.job_id
              ?? requestedJobId,
          },

          statusCode,
        );
      }
    },
  ),
};