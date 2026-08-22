import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import VesalaporraDesktopAppLauncher from "./components/VesalaporraDesktopAppLauncher";
import NotificationPreferencesCard from "./components/NotificationPreferencesCard";
import instructionsHtml from "./content/instruccions.html?raw";
import "./App.css";
import "./VesalaporraLeagues_PRO_V2.css";

const buildVesalaporraInstructionsHtml = (sourceHtml) => {
  let html = String(sourceHtml || "");

  // Portada: mantenim els dos botons existents però centrats.
  const centeredHeroActionsStyle = `
    <style>
      .instructions-page .vlp-actions {
        justify-content: center !important;
        width: 100% !important;
      }
    </style>
  `;

  if (!html.includes("vlp-actions-centered-by-vesalaporra")) {
    html =
      centeredHeroActionsStyle.replace(
        "<style>",
        '<style id="vlp-actions-centered-by-vesalaporra">',
      ) + html;
  }

  // La frase de portada també posa al dia les funcions actuals.
  html = html.replace(
    "Resultat, Lotto Flick, protagonista, rànquing, medalles i notes:",
    "Resultat, Lotto Flick, protagonista, rànquing, lligues privades, medalles i notes:",
  );

  // Índex: afegim Lligues sense alterar la resta.
  if (!html.includes('href="#lligues"')) {
    html = html.replace(
      /(<a href="#ranquing">Rànquing<\/a>)(\s*)(<a href="#perfil">Perfil<\/a>)/,
      `$1$2<a href="#lligues">Lligues</a>$2$3`,
    );
  }

  // Secció nova: entra entre Rànquing i Perfil.
  if (!html.includes('id="lligues"')) {
    const privateLeaguesSection = `
      <section class="vlp-section" id="lligues">
        <div class="vlp-section-head">
          <span class="vlp-number">05</span>
          <div>
            <h2>Lligues privades: la mateixa porra, la vostra guerra</h2>
            <p>Vols picar-te només amb els amics, la família, la penya o el grup de WhatsApp? Ves a <strong>Perfil → Lligues</strong> i crea la vostra classificació privada.</p>
          </div>
        </div>

        <div class="vlp-grid-3">
          <div class="vlp-card">
            <span class="vlp-mini-label">Zero feina extra</span>
            <h3>Una sola porra</h3>
            <p class="vlp-muted">La porra es continua fent sempre des de <strong>LA PORRA</strong>. No existeix una aposta diferent per cada lliga.</p>
          </div>

          <div class="vlp-card">
            <span class="vlp-mini-label">Munta la colla</span>
            <h3>Crea o entra amb codi</h3>
            <p class="vlp-muted">El creador posa el nom de la lliga i comparteix un codi o un enllaç. Els altres només l’han d’obrir o introduir el codi.</p>
          </div>

          <div class="vlp-card">
            <span class="vlp-mini-label">Doble batalla</span>
            <h3>General i Jornada</h3>
            <p class="vlp-muted">Cada lliga té classificació <strong>GENERAL</strong> i de <strong>JORNADA</strong>, igual que el rànquing públic, però només amb els membres del vostre grup.</p>
          </div>
        </div>

        <div class="vlp-callout">
          <p><strong>Els punts no es dupliquen ni canvien.</strong> El mateix resultat, Lotto Flick i protagonista que envies a Vesalaporra compten al rànquing general, al de jornada i a totes les lligues privades on participis. El creador és el <strong>capità</strong> de la lliga, apareix amb el braçalet de la senyera i pot gestionar-ne els membres.</p>
        </div>
      </section>
`;

    html = html.replace(
      /(\s*<section class="vlp-section" id="perfil">)/,
      `${privateLeaguesSection}$1`,
    );
  }

  // En afegir la secció 05, Perfil i Les Notes passen a 06 i 07.
  html = html.replace(
    /(<section class="vlp-section" id="perfil">[\s\S]*?<span class="vlp-number">)05(<\/span>)/,
    "$106$2",
  );

  html = html.replace(
    /(<section class="vlp-section" id="notes">[\s\S]*?<span class="vlp-number">)06(<\/span>)/,
    "$107$2",
  );

  // El text del Perfil també explica on viuen les lligues.
  html = html.replace(
    "Pots entrar al teu perfil des del menú. Per tafanejar el d’un altre porrero, clica directament el seu avatar.",
    "Pots entrar al teu perfil des del menú. Allà també trobaràs les teves lligues privades. Per tafanejar el perfil d’un altre porrero, clica directament el seu avatar.",
  );

  return html;
};

const enhancedInstructionsHtml =
  buildVesalaporraInstructionsHtml(instructionsHtml);

// FONT REAL: la plantilla pública no viu al codi.
// Tots els jugadors visibles venen del roster real del partit.

const PROTAGONIST_GROUP_OPTIONS = [
  {
    key: "special",
    label: "YAMAL SPECIAL",
    hitPoints: 5,
    missPoints: -5,
    sortOrder: 0,
    excludesProtagonist: false,
  },
  {
    key: "a",
    label: "GRUP A",
    hitPoints: 10,
    missPoints: -5,
    sortOrder: 100,
    excludesProtagonist: false,
  },
  {
    key: "b",
    label: "GRUP B",
    hitPoints: 20,
    missPoints: -10,
    sortOrder: 200,
    excludesProtagonist: false,
  },
  {
    key: "c",
    label: "GRUP C",
    hitPoints: 30,
    missPoints: -10,
    sortOrder: 300,
    excludesProtagonist: false,
  },
  {
    key: "d",
    label: "GRUP D",
    hitPoints: 40,
    missPoints: -5,
    sortOrder: 400,
    excludesProtagonist: false,
  },
  {
    key: "e",
    label: "GRUP E",
    hitPoints: 50,
    missPoints: -5,
    sortOrder: 500,
    excludesProtagonist: false,
  },
  {
    key: "f",
    label: "GRUP F · PORTER",
    hitPoints: null,
    missPoints: null,
    sortOrder: 600,
    excludesProtagonist: true,
  },
];

const PROTAGONIST_GROUP_BY_KEY = Object.fromEntries(
  PROTAGONIST_GROUP_OPTIONS.map((group) => [group.key, group]),
);

const PROTAGONIST_GROUP_NOTE_PATTERN =
  /\[VLP_PROTAGONIST_GROUP:(special|a|b|c|d|e|f)\]/i;

const normalizeProtagonistGroupKey = (value) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  return PROTAGONIST_GROUP_BY_KEY[normalizedValue]
    ? normalizedValue
    : "e";
};

const getProtagonistGroupKeyFromAdminNote = (adminNote) => {
  const match = String(adminNote || "").match(PROTAGONIST_GROUP_NOTE_PATTERN);

  return normalizeProtagonistGroupKey(match?.[1] || "e");
};

const setProtagonistGroupInAdminNote = (adminNote, groupKey) => {
  const normalizedGroupKey = normalizeProtagonistGroupKey(groupKey);
  const cleanNote = String(adminNote || "")
    .replace(PROTAGONIST_GROUP_NOTE_PATTERN, "")
    .trim();
  const groupToken = `[VLP_PROTAGONIST_GROUP:${normalizedGroupKey}]`;

  return cleanNote ? `${cleanNote} ${groupToken}` : groupToken;
};

// FONT REAL: el grup de protagonista es llegeix del jugador assignat al partit.

const teamBadgeVisualsById = {
  barcelona: {
    colors: ["#2147a5", "#a61c48", "#2147a5", "#a61c48"],
  },
};

const DEFAULT_TEAM_BADGE_COLORS = ["#6f7a95"];

const normalizeHexColor = (value) => {
  const normalizedValue = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(normalizedValue)
    ? normalizedValue.toLowerCase()
    : null;
};

const normalizeTeamBadgeColors = (...colorSources) => {
  const flattenedColors = colorSources.flatMap((colorSource) => {
    if (Array.isArray(colorSource)) {
      return colorSource;
    }

    if (typeof colorSource === "string" && colorSource.includes(",")) {
      return colorSource.split(",");
    }

    return colorSource ? [colorSource] : [];
  });

  return [
    ...new Set(
      flattenedColors
        .map(normalizeHexColor)
        .filter(Boolean),
    ),
  ];
};

const normalizeTeamBadgePattern = (pattern, colors = []) => {
  const normalizedPattern = String(pattern || "")
    .trim()
    .toLowerCase();

  if (normalizedPattern === "solid") {
    return "solid";
  }

  if (normalizedPattern === "striped") {
    return "striped";
  }

  return normalizeTeamBadgeColors(colors).length > 1
    ? "striped"
    : "solid";
};

const getTeamBadgeBackground = (
  teamId,
  overrideColors = null,
  pattern = "striped",
) => {
  const normalizedOverrideColors = normalizeTeamBadgeColors(overrideColors);
  const configuredColors =
    normalizedOverrideColors.length > 0
      ? normalizedOverrideColors
      : teamBadgeVisualsById[teamId]?.colors;

  const uniqueColors = [
    ...new Set(
      Array.isArray(configuredColors) && configuredColors.length > 0
        ? configuredColors.filter(Boolean)
        : DEFAULT_TEAM_BADGE_COLORS,
    ),
  ];

  const colors =
    uniqueColors.length > 0
      ? uniqueColors.slice(0, 2)
      : DEFAULT_TEAM_BADGE_COLORS;

  if (colors.length === 1) {
    return colors[0];
  }

  const [primaryColor, secondaryColor] = colors;

  if (pattern === "solid") {
    return `linear-gradient(90deg,
      ${primaryColor} 0%,
      ${primaryColor} 75%,
      ${secondaryColor} 75%,
      ${secondaryColor} 100%
    )`;
  }

  return `linear-gradient(90deg,
    ${primaryColor} 0%,
    ${primaryColor} 25%,
    ${secondaryColor} 25%,
    ${secondaryColor} 50%,
    ${primaryColor} 50%,
    ${primaryColor} 75%,
    ${secondaryColor} 75%,
    ${secondaryColor} 100%
  )`;
};

function TeamColorBadge({
  teamId,
  colors = null,
  pattern = "striped",
  className = "",
}) {
  return (
    <span
      className={`team-color-dot ${className}`.trim()}
      style={{
        background: getTeamBadgeBackground(teamId, colors, pattern),
      }}
      aria-hidden="true"
    ></span>
  );
}

const EMPTY_MATCH_DATA = {
  id: null,
  homeTeamId: "barcelona",
  homeName: "Barça",
  homeLocation: "",
  homeBadgeColors: teamBadgeVisualsById.barcelona.colors,
  homeBadgePattern: "striped",
  awayTeamId: "",
  awayName: "CARREGANT...",
  awayCountry: "",
  awayBadgeColors: DEFAULT_TEAM_BADGE_COLORS,
  awayBadgePattern: "solid",
  kickoffLabel: "CARREGANT PARTIT...",
    kickoffAt: null,
  predictionsOpenAt: null,
  predictionsCloseAt: null,
  predictionsAreOpen: false,
  isUpcomingPreview: false,
  pointsMultiplier: 1,
};

const PREDICTION_CELEBRATION_MS = 5600;

const PREDICTION_CONFETTI_COLORS = [
  "#004d98",
  "#a50044",
  "#0068b5",
  "#c8104b",
];

const PREDICTION_CONFETTI_PIECES = Array.from(
  { length: 72 },
  (_, index) => {
    const direction = index % 2 === 0 ? -1 : 1;
    const horizontalDistance =
      direction * (28 + ((index * 47) % 250));
    const riseDistance = 170 + ((index * 37) % 210);
    const fallDistance = 250 + ((index * 29) % 230);
    const rotation =
      direction * (540 + ((index * 71) % 720));

    return {
      id: index,
      color:
        PREDICTION_CONFETTI_COLORS[
          index % PREDICTION_CONFETTI_COLORS.length
        ],
      width: 6 + ((index * 3) % 6),
      height: 10 + ((index * 5) % 10),
      borderRadius: index % 4 === 0 ? "50%" : "2px",
      delay: (index % 12) * 30,
      duration: 2050 + ((index * 41) % 650),
      endX: `${horizontalDistance}px`,
      middleX: `${Math.round(horizontalDistance * 0.42)}px`,
      secondX: `${Math.round(horizontalDistance * 0.78)}px`,
      peakY: `-${riseDistance}px`,
      secondY: `-${Math.round(riseDistance * 0.48)}px`,
      fallY: `${fallDistance}px`,
      middleRotation: `${Math.round(rotation * 0.45)}deg`,
      secondRotation: `${Math.round(rotation * 0.78)}deg`,
      endRotation: `${rotation}deg`,
    };
  },
);

const formatCurrentMatchKickoffLabel = (kickoffAt) => {
  if (!kickoffAt) {
    return "PARTIT PENDENT DE DATA";
  }

  const kickoffDate = new Date(kickoffAt);

  const dateLabel = new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(kickoffDate);

  const timeLabel = new Intl.DateTimeFormat("ca-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(kickoffDate);

  return `${dateLabel} · ${timeLabel}`.toLocaleUpperCase("ca-ES");
};

const getMatchTeamBadgeColors = (row, side) =>
  normalizeTeamBadgeColors(
    row?.[`${side}_team_colors`],
    row?.[`${side}_colors`],
    [
      row?.[`${side}_primary_color`],
      row?.[`${side}_secondary_color`],
    ],
    [
      row?.[`${side}_color_primary`],
      row?.[`${side}_color_secondary`],
    ],
    [
      row?.[`${side}_team_primary_color`],
      row?.[`${side}_team_secondary_color`],
    ],
  );

const readOptionalBoolean = (...values) => {
  for (const value of values) {
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
      const normalizedValue = value.trim().toLowerCase();

      if (["true", "t", "yes", "y", "home", "local"].includes(normalizedValue)) {
        return true;
      }

      if (["false", "f", "no", "n", "away", "visitant"].includes(normalizedValue)) {
        return false;
      }
    }
  }

  return null;
};

const normalizeCurrentMatch = (row) => {
  const explicitHomeTeamId = row?.home_team_key || "";
  const explicitHomeName = row?.home_display_name || "";
  const explicitAwayTeamId = row?.away_team_key || "";
  const explicitAwayName = row?.away_display_name || "";

  const barcelonaFirst = readOptionalBoolean(
    row?.barcelona_first,
    row?.barcelonaFirst,
    row?.barca_is_home,
    row?.barcaIsHome,
  );

  const opponentTeamId =
    row?.opponent_team_key ||
    row?.rival_team_key ||
    (barcelonaFirst === true
      ? explicitAwayTeamId
      : barcelonaFirst === false
        ? explicitHomeTeamId
        : "");

  const opponentName =
    row?.opponent_display_name ||
    row?.rival_display_name ||
    (barcelonaFirst === true
      ? explicitAwayName
      : barcelonaFirst === false
        ? explicitHomeName
        : "");

  const opponentColors = normalizeTeamBadgeColors(
    getMatchTeamBadgeColors(row, "opponent"),
    getMatchTeamBadgeColors(row, "rival"),
    barcelonaFirst === true
      ? getMatchTeamBadgeColors(row, "away")
      : barcelonaFirst === false
        ? getMatchTeamBadgeColors(row, "home")
        : null,
  );

  const opponentBadgePattern = normalizeTeamBadgePattern(
    row?.opponent_badge_pattern ||
      row?.rival_badge_pattern,
    opponentColors,
  );

  const barcelonaColors = normalizeTeamBadgeColors(
    getMatchTeamBadgeColors(row, "barcelona"),
    teamBadgeVisualsById.barcelona.colors,
  );

  const useCanonicalSideOrder = typeof barcelonaFirst === "boolean";

  const homeTeamId = useCanonicalSideOrder
    ? barcelonaFirst
      ? "barcelona"
      : opponentTeamId
    : explicitHomeTeamId || "barcelona";

  const homeName = useCanonicalSideOrder
    ? barcelonaFirst
      ? "Barça"
      : opponentName
    : explicitHomeName || "Barça";

  const awayTeamId = useCanonicalSideOrder
    ? barcelonaFirst
      ? opponentTeamId
      : "barcelona"
    : explicitAwayTeamId;

  const awayName = useCanonicalSideOrder
    ? barcelonaFirst
      ? opponentName
      : "Barça"
    : explicitAwayName;

  const homeBadgeColors = useCanonicalSideOrder
    ? barcelonaFirst
      ? barcelonaColors
      : opponentColors
    : getMatchTeamBadgeColors(row, "home");

  const awayBadgeColors = useCanonicalSideOrder
    ? barcelonaFirst
      ? opponentColors
      : barcelonaColors
    : getMatchTeamBadgeColors(row, "away");

  const homeBadgePattern = useCanonicalSideOrder
    ? barcelonaFirst
      ? "striped"
      : opponentBadgePattern
    : homeTeamId === "barcelona"
      ? "striped"
      : opponentBadgePattern;

  const awayBadgePattern = useCanonicalSideOrder
    ? barcelonaFirst
      ? opponentBadgePattern
      : "striped"
    : awayTeamId === "barcelona"
      ? "striped"
      : opponentBadgePattern;

  const officialBarcelonaScore = toNullableFiniteNumber(
    row?.official_barcelona_goals,
    row?.official_barcelona_score,
    row?.barcelona_goals,
    row?.barcelona_score,
  );

  const officialOpponentScore = toNullableFiniteNumber(
    row?.official_opponent_goals,
    row?.official_opponent_score,
    row?.opponent_goals,
    row?.opponent_score,
  );

  const directOfficialHomeScore = toNullableFiniteNumber(
    row?.official_home_goals,
    row?.official_home_score,
    row?.home_goals,
    row?.home_score,
  );

  const directOfficialAwayScore = toNullableFiniteNumber(
    row?.official_away_goals,
    row?.official_away_score,
    row?.away_goals,
    row?.away_score,
  );

  const officialHomeScore =
    directOfficialHomeScore ??
    (barcelonaFirst === true
      ? officialBarcelonaScore
      : barcelonaFirst === false
        ? officialOpponentScore
        : null);

  const officialAwayScore =
    directOfficialAwayScore ??
    (barcelonaFirst === true
      ? officialOpponentScore
      : barcelonaFirst === false
        ? officialBarcelonaScore
        : null);

  const hasOfficialResult =
    officialHomeScore !== null && officialAwayScore !== null;

  return {
    id: row?.match_id ? String(row.match_id) : null,
    seasonMatchNo: toFiniteNumber(
      row?.season_match_no,
      row?.jornada_number,
    ),
    homeTeamId,
    homeName,
    homeLocation: row?.venue_name || row?.competition_name || "",
    homeBadgeColors,
    homeBadgePattern,
    awayTeamId,
    awayName,
    awayCountry: row?.opponent_country || row?.rival_country || "",
    awayBadgeColors,
    awayBadgePattern,
    kickoffLabel: formatCurrentMatchKickoffLabel(
      row?.scheduled_kickoff_at,
    ),
    kickoffAt: row?.scheduled_kickoff_at || null,
    predictionsOpenAt:
      row?.predictions_open_at || null,
    predictionsCloseAt:
      row?.predictions_close_at ||
      row?.scheduled_kickoff_at ||
      null,
    predictionsAreOpen: Boolean(row?.predictions_are_open),
    ratingsOpenAt:
      row?.ratings_open_at || null,
    ratingsCloseAt:
      row?.ratings_close_at || null,
    ratingsAreOpen: readOptionalBoolean(
      row?.ratings_are_open,
    ),
    ratingsStatus: firstNonEmptyText(
      row?.ratings_status,
    ).toLowerCase(),
    isUpcomingPreview: false,
    hasOfficialResult,
    officialHomeScore,
    officialAwayScore,
    barcelonaFirst:
      typeof barcelonaFirst === "boolean"
        ? barcelonaFirst
        : homeTeamId === "barcelona",
  };
};

const getCountdown = (predictionsCloseAt) => {
  if (!predictionsCloseAt) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: true,
    };
  }

  const remainingMilliseconds = Math.max(
    0,
    new Date(predictionsCloseAt).getTime() - Date.now(),
  );

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);

  const hours = Math.floor((totalSeconds % 86400) / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isClosed: remainingMilliseconds <= 0,
  };
};

const X_AUTO_LOGIN_STORAGE_KEY = "vesalaporra_x_auto_login_started_at";

const X_AUTO_LOGIN_COOLDOWN_MS = 15000;

const VESALAPORRA_ACTIVE_PAGE_STORAGE_KEY =
  "vesalaporra_active_page";

const VESALAPORRA_PROFILE_TAB_BY_PATH = {
  resum: "overview",
  medalles: "achievements",
  historial: "history",
  lligues: "leagues",
};

const VESALAPORRA_PROFILE_PATH_BY_TAB = {
  overview: "resum",
  achievements: "medalles",
  history: "historial",
  leagues: "lligues",
};

const decodeRouteSegment = (value) => {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return "";
  }
};

const getVesalaporraRouteState = (
  pathname = window.location.pathname,
) => {
  const normalizedPath =
    String(pathname || "/")
      .replace(/\/{2,}/g, "/")
      .replace(/\/+$/, "") || "/";

  const segments = normalizedPath
    .split("/")
    .filter(Boolean)
    .map(decodeRouteSegment);

  const section = String(segments[0] || "").toLowerCase();
  const secondSegment = segments[1] || "";
  const secondSlug = secondSegment.toLowerCase();
  const thirdSlug = String(segments[2] || "").toLowerCase();

  const defaultRouteState = {
    activePage: "play",
    notesTab: "match",
    rankingTab: "general",
    profileTab: "overview",
    adminScoringTab: "match",
    selectedProfileUserId: null,
  };

  if (section === "com-jugar" || section === "instruccions") {
    return {
      ...defaultRouteState,
      activePage: "instructions",
    };
  }

  if (section === "notes") {
    return {
      ...defaultRouteState,
      activePage: "notes",
      notesTab: secondSlug === "temporada" ? "season" : "match",
    };
  }

  if (section === "ranquing" || section === "ranking") {
    return {
      ...defaultRouteState,
      activePage: "ranking",
      rankingTab: secondSlug === "jornada" ? "jornada" : "general",
    };
  }

  if (section === "perfil") {
    const secondSegmentIsTab = Boolean(
      VESALAPORRA_PROFILE_TAB_BY_PATH[secondSlug],
    );

    const profilePath = secondSegmentIsTab
      ? secondSlug
      : thirdSlug;

    return {
      ...defaultRouteState,
      activePage: "profile",
      profileTab:
        VESALAPORRA_PROFILE_TAB_BY_PATH[profilePath] ||
        "overview",
      selectedProfileUserId:
        secondSegment && !secondSegmentIsTab
          ? secondSegment
          : null,
    };
  }

  if (section === "puntuacions") {
    const adminScoringTab =
      secondSlug === "jugadors"
        ? "players"
        : secondSlug === "propers-partits"
          ? "upcoming"
          : "match";

    return {
      ...defaultRouteState,
      activePage: "scoring",
      adminScoringTab,
    };
  }

  return defaultRouteState;
};

const getVesalaporraPath = ({
  activePage,
  notesTab,
  rankingTab,
  profileTab,
  adminScoringTab,
  selectedProfileUserId,
}) => {
  if (activePage === "instructions") {
    return "/com-jugar";
  }

  if (activePage === "notes") {
    return notesTab === "season"
      ? "/notes/temporada"
      : "/notes/partit";
  }

  if (activePage === "ranking") {
    return rankingTab === "jornada"
      ? "/ranquing/jornada"
      : "/ranquing/general";
  }

  if (activePage === "profile") {
    const profilePath =
      VESALAPORRA_PROFILE_PATH_BY_TAB[profileTab] || "resum";

    const profileUserPath = selectedProfileUserId
      ? `/${encodeURIComponent(String(selectedProfileUserId))}`
      : "";

    return `/perfil${profileUserPath}/${profilePath}`;
  }

  if (activePage === "scoring") {
    if (adminScoringTab === "players") {
      return "/puntuacions/jugadors";
    }

    if (adminScoringTab === "upcoming") {
      return "/puntuacions/propers-partits";
    }

    return "/puntuacions/partit";
  }

  return "/porra";
};

const PROFILE_AVATAR_BUCKET = "vesalaporra-profile-avatars";

const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const PROFILE_NAME_MIN_LENGTH = 2;
const PROFILE_NAME_MAX_LENGTH = 32;

const VESALAPORRA_PRIVATE_LEAGUES_RPC = {
  list: "vesalaporra_my_private_leagues",
  create: "vesalaporra_create_private_league",
  join: "vesalaporra_join_private_league",
  members: "vesalaporra_private_league_members",
  leave: "vesalaporra_leave_private_league",
  removeMember: "vesalaporra_remove_private_league_member",
  deleteLeague: "vesalaporra_delete_private_league",
};

const PRIVATE_LEAGUE_NAME_MIN_LENGTH = 3;
const PRIVATE_LEAGUE_NAME_MAX_LENGTH = 40;

const normalizePrivateLeagueCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-")
    .slice(0, 16);

const normalizePrivateLeague = (row) => {
  const leagueId = firstNonEmptyText(
    row?.league_id,
    row?.id,
  );

  if (!leagueId) {
    return null;
  }

  return {
    id: leagueId,
    name: firstNonEmptyText(
      row?.league_name,
      row?.name,
      "Lliga privada",
    ),
    inviteCode: normalizePrivateLeagueCode(
      row?.invite_code,
    ),
    ownerUserId: firstNonEmptyText(
      row?.owner_user_id,
    ),
    memberRole: firstNonEmptyText(
      row?.member_role,
      row?.role,
      "member",
    ).toLowerCase(),
    memberCount: toFiniteNumber(
      row?.member_count,
      row?.members_count,
      1,
    ),
    createdAt:
      firstNonEmptyText(
        row?.created_at,
      ) || null,
  };
};

const normalizePrivateLeagueMember = (row) => {
  const userId = firstNonEmptyText(
    row?.user_id,
    row?.profile_id,
    row?.id,
  );

  if (!userId) {
    return null;
  }

  return {
    userId,
    displayName: firstNonEmptyText(
      row?.display_name,
      row?.public_name,
      row?.name,
      "Culer",
    ),
    avatarUrl:
      firstNonEmptyText(
        row?.avatar_url,
        row?.profile_avatar_url,
      ) || null,
    xHandle: firstNonEmptyText(
      row?.x_handle,
      row?.twitter_handle,
      row?.handle,
    ).replace(/^@/, ""),
    role: firstNonEmptyText(
      row?.member_role,
      row?.role,
      "member",
    ).toLowerCase(),
    joinedAt:
      firstNonEmptyText(
        row?.joined_at,
        row?.created_at,
      ) || null,
  };
};

const RANKING_PAGE_SIZE = 20;

const PRESEASON_2026_ENDED_AT = Date.parse(
  "2026-08-19T20:07:10.543578+00:00",
);

const getRankingSignupTimestamp = (user) => {
  const timestamp = Date.parse(String(user?.createdAt || ""));

  return Number.isFinite(timestamp) ? timestamp : null;
};

const getRankingInitials = (name) =>
  String(name || "VP")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "VP";

const getSafePublicDisplayName = (candidates, privateEmail) => {
  const normalizedPrivateEmail = String(privateEmail || "")
    .trim()
    .toLowerCase();

  const privateEmailLocalPart = normalizedPrivateEmail.split("@")[0] || "";

  const safeCandidate = candidates.find((candidate) => {
    const normalizedCandidate = String(candidate || "").trim();

    if (!normalizedCandidate) {
      return false;
    }

    const normalizedCandidateLower = normalizedCandidate.toLowerCase();

    return (
      !normalizedCandidate.includes("@") &&
      normalizedCandidateLower !== normalizedPrivateEmail &&
      normalizedCandidateLower !== privateEmailLocalPart
    );
  });

  return String(safeCandidate || "Culer").trim();
};

function RankingAvatar({ user, size = "medium" }) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.twitterAvatarUrl]);

  return (
    <span
      className={`ranking-avatar ranking-avatar-${size}`}
      aria-hidden="true"
    >
      {!avatarFailed && user?.twitterAvatarUrl ? (
        <img
          src={user.twitterAvatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
        />
      ) : (
        <span>{getRankingInitials(user?.displayName)}</span>
      )}
    </span>
  );
}

function AuthAvatar({ imageUrl, displayName }) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [imageUrl]);

  return (
    <span className="auth-avatar" aria-hidden="true">
      {!avatarFailed && imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
        />
      ) : (
        <span>{getRankingInitials(displayName)}</span>
      )}
    </span>
  );
}

function GoogleMark({ className = "" }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.37 12 5.37Z"
        />
      </svg>
    </span>
  );
}

function DisqusMark({ className = "" }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "grid",
        placeItems: "center",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#2e9fff",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: 950,
        lineHeight: 1,
      }}
    >
      D
    </span>
  );
}


const RATING_SCALE = [
  { stars: 1, value: 0, label: "Pèssim" },
  { stars: 2, value: 2, label: "Fluixet" },
  { stars: 3, value: 4, label: "Ni fu ni fa" },
  { stars: 4, value: 6, label: "Correcte" },
  { stars: 5, value: 8, label: "Notable" },
  { stars: 6, value: 10, label: "Magistral" },
];

const RATING_VALUE_BY_STARS = Object.fromEntries(
  RATING_SCALE.map((rating) => [rating.stars, rating.value]),
);

const VESALAPORRA_ADMIN_USER_IDS = String(
  import.meta.env.VITE_VESALAPORRA_ADMIN_USER_IDS ||
    import.meta.env.VITE_VESALAPORRA_ADMIN_USER_ID ||
    "",
)
  .split(",")
  .map((userId) => userId.trim())
  .filter(Boolean);

const normalizeTechnicalAccountKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]/g, "");

const isVesalaporraTechnicalAccount = (user) => {
  const userId = String(
    user?.id ||
      user?.user_id ||
      user?.authUserId ||
      user?.auth_user_id ||
      "",
  ).trim();

  const displayNameKey = normalizeTechnicalAccountKey(
    user?.displayName || user?.display_name,
  );

  const handleKey = normalizeTechnicalAccountKey(
    user?.handleSlug ||
      user?.handle ||
      user?.x_handle ||
      user?.username,
  );

  return Boolean(
    (userId && VESALAPORRA_ADMIN_USER_IDS.includes(userId)) ||
      displayNameKey === "vesalaporra" ||
      handleKey === "vesalaporra",
  );
};

const VESALAPORRA_PUBLIC_RANKING_RPC =
  import.meta.env.VITE_VESALAPORRA_PUBLIC_RANKING_RPC ||
  "vesalaporra_public_ranking";

const VESALAPORRA_PUBLIC_PRESEASON_FINAL_ORDER_RPC =
  "vesalaporra_public_preseason_final_order_2026";

const VESALAPORRA_PUBLIC_MATCH_NOTES_RPC =
  import.meta.env.VITE_VESALAPORRA_PUBLIC_MATCH_NOTES_RPC ||
  "vesalaporra_public_match_notes";
const VESALAPORRA_PUBLIC_LATEST_SCORED_MATCH_RPC =
  "vesalaporra_public_latest_scored_match_id";

const VESALAPORRA_PUBLIC_LATEST_SCORED_JORNADA_NUMBER_RPC =
  "vesalaporra_public_latest_scored_jornada_number";

const VESALAPORRA_PUBLIC_SCORED_MATCH_CARD_RPC =
  "vesalaporra_public_scored_match_card";
const VESALAPORRA_PUBLIC_MATCH_RATINGS_STATE_RPC =
  "vesalaporra_public_match_ratings_state";
const VESALAPORRA_PUBLIC_ACTIVE_SEASON_NOTES_RPC =
  import.meta.env.VITE_VESALAPORRA_PUBLIC_ACTIVE_SEASON_NOTES_RPC ||
  "vesalaporra_public_active_season_notes";

const VESALAPORRA_PUBLIC_USER_ACHIEVEMENTS_RPC =
  import.meta.env.VITE_VESALAPORRA_PUBLIC_USER_ACHIEVEMENTS_RPC ||
  "vesalaporra_public_user_achievements";

const VESALAPORRA_PUBLIC_PROFILE_HISTORY_RPC =
  import.meta.env.VITE_VESALAPORRA_PUBLIC_PROFILE_HISTORY_RPC ||
  "vesalaporra_public_profile_history";

const VESALAPORRA_PUBLIC_PROFILE_COMPETITIVE_SUMMARY_RPC =
  import.meta.env
    .VITE_VESALAPORRA_PUBLIC_PROFILE_COMPETITIVE_SUMMARY_RPC ||
  "vesalaporra_public_profile_competitive_summary";

const VESALAPORRA_SUBMIT_RATING_RPC =
  import.meta.env.VITE_VESALAPORRA_SUBMIT_RATING_RPC ||
  "vesalaporra_submit_rating";

const VESALAPORRA_ADMIN_FINALIZE_MATCH_RPC =
  import.meta.env.VITE_VESALAPORRA_ADMIN_FINALIZE_MATCH_RPC ||
  "vesalaporra_admin_finalize_match";

const EMPTY_OFFICIAL_MATCH_STATE = {
  matchId: null,
  homeScore: 0,
  awayScore: 0,
  statsByPlayerId: {},
  version: 0,
  publishedAt: null,
  updatedAt: null,
};

const createEmptyOfficialMatchState = (matchId = null) => ({
  ...EMPTY_OFFICIAL_MATCH_STATE,
  matchId,
  statsByPlayerId: {},
});

const toFiniteNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return 0;
};

const toNullableFiniteNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return null;
};

const firstNonEmptyText = (...values) => {
  for (const value of values) {
    const textValue = String(value ?? "").trim();

    if (textValue) {
      return textValue;
    }
  }

  return "";
};

const unwrapRpcRows = (payload, candidateKeys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of candidateKeys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (payload && typeof payload === "object") {
    return [payload];
  }

  return [];
};

const callRpcWithPayloadFallbacks = async (rpcName, payloads) => {
  let lastError = null;

  for (const payload of payloads) {
    const { data, error } = await supabase.rpc(rpcName, payload);

    if (!error) {
      return data;
    }

    lastError = error;
  }

  throw lastError || new Error(`No s’ha pogut executar ${rpcName}.`);
};

const isMissingRpcSignatureError = (error) => {
  const errorText = [
    error?.code,
    error?.message,
    error?.details,
    error?.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    errorText.includes("pgrst202") ||
    (errorText.includes("could not find the function") &&
      errorText.includes("schema cache"))
  );
};

const isRatingsClosedError = (error) => {
  const errorText = [
    error?.code,
    error?.message,
    error?.details,
    error?.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const mentionsRatings =
    errorText.includes("rating") ||
    errorText.includes("valoraci") ||
    errorText.includes("les notes") ||
    errorText.includes("notes_");

  const mentionsClosedWindow =
    errorText.includes("closed") ||
    errorText.includes("tancad") ||
    errorText.includes("not open") ||
    errorText.includes("no estan obertes") ||
    errorText.includes("fora de la finestra") ||
    errorText.includes("outside the window");

  return mentionsRatings && mentionsClosedWindow;
};

const callSubmitRatingWithPayloadFallbacks = async (payloads) => {
  let lastSignatureError = null;

  for (const payload of payloads) {
    const { data, error } = await supabase.rpc(
      VESALAPORRA_SUBMIT_RATING_RPC,
      payload,
    );

    if (!error) {
      return data;
    }

    if (!isMissingRpcSignatureError(error)) {
      throw error;
    }

    lastSignatureError = error;
  }

  throw (
    lastSignatureError ||
    new Error("No s’ha pogut guardar la valoració.")
  );
};

const normalizeRankingUser = (row, scope, currentUserId, fallbackIndex = 0) => {
  const userId = firstNonEmptyText(
    row?.user_id,
    row?.profile_id,
    row?.auth_user_id,
    row?.id,
  );

  if (!userId) {
    return null;
  }

  const displayName = firstNonEmptyText(
    row?.display_name,
    row?.public_name,
    row?.nickname,
    row?.name,
    "Culer",
  );

  const handleSlug = firstNonEmptyText(
    row?.x_handle,
    row?.twitter_handle,
    row?.handle,
    row?.username,
  ).replace(/^@/, "");

  const isGeneral = scope === "general";
  const resultPoints = toFiniteNumber(
    isGeneral ? row?.general_result_points : row?.jornada_result_points,
    isGeneral ? row?.season_result_points : row?.match_result_points,
    row?.result_points,
    row?.score_result,
  );
  const xiPoints = toFiniteNumber(
    isGeneral ? row?.general_xi_points : row?.jornada_xi_points,
    isGeneral ? row?.season_xi_points : row?.match_xi_points,
    row?.xi_points,
    row?.lineup_points,
    row?.score_xi,
  );
  const protagonistPoints = toFiniteNumber(
    isGeneral
      ? row?.general_protagonist_points
      : row?.jornada_protagonist_points,
    isGeneral
      ? row?.season_protagonist_points
      : row?.match_protagonist_points,
    row?.protagonist_points,
    row?.score_protagonist,
  );
  const totalPoints = toFiniteNumber(
    isGeneral ? row?.general_total_points : row?.jornada_total_points,
    isGeneral ? row?.season_total_points : row?.match_total_points,
    row?.total_points,
    row?.points,
    resultPoints + xiPoints + protagonistPoints,
  );

  const points = {
    resultPoints,
    xiPoints,
    protagonistPoints,
    totalPoints,
  };

  const achievementIds = [
    ...(Array.isArray(row?.achievement_keys)
      ? row.achievement_keys
      : []),
    ...(Array.isArray(row?.achievement_ids)
      ? row.achievement_ids
      : []),
    ...(Array.isArray(row?.permanent_achievement_ids)
      ? row.permanent_achievement_ids
      : []),
  ].map(String);

  return {
    id: userId,
    authUserId: userId,
    twitterId: userId,
    displayName,
    handle: handleSlug ? `@${handleSlug}` : "",
    handleSlug,
    twitterAvatarUrl:
      firstNonEmptyText(
        row?.avatar_url,
        row?.profile_avatar_url,
        row?.twitter_avatar_url,
      ) || null,
    twitterUrl: handleSlug ? `https://x.com/${handleSlug}` : null,
    hasXIdentity: Boolean(handleSlug),
    identityProvider: firstNonEmptyText(row?.identity_provider, row?.provider),
    identityLabel: handleSlug ? "X" : "VESALAPORRA",
    joinedYear: toFiniteNumber(row?.joined_year) || null,
    createdAt:
      firstNonEmptyText(
        row?.created_at,
        row?.profile_created_at,
        row?.joined_at,
      ) || null,
    isCurrentUser: Boolean(currentUserId && userId === String(currentUserId)),
        position:
      toFiniteNumber(
        row?.ranking_position,
        row?.position,
        row?.rank,
      ) || fallbackIndex + 1,

    generalPosition: isGeneral
      ? toFiniteNumber(
          row?.ranking_position,
          row?.position,
          row?.rank,
        ) || fallbackIndex + 1
      : null,

        jornadaPosition: isGeneral
      ? null
      : toFiniteNumber(
          row?.ranking_position,
          row?.position,
          row?.rank,
        ) || fallbackIndex + 1,

    generalPreviousPosition:
      isGeneral &&
      row?.previous_position !== null &&
      row?.previous_position !== undefined
        ? toFiniteNumber(row?.previous_position)
        : null,

    generalMovement:
      isGeneral &&
      row?.movement !== null &&
      row?.movement !== undefined
        ? toFiniteNumber(row?.movement)
        : null,

    general: isGeneral
      ? points
      : {
          resultPoints: 0,
          xiPoints: 0,
          protagonistPoints: 0,
          totalPoints: 0,
        },

    jornada: isGeneral
      ? {
          resultPoints: 0,
          xiPoints: 0,
          protagonistPoints: 0,
          totalPoints: 0,
        }
      : points,
    achievementIds: [...new Set(achievementIds)],
  };
};

const mergeRankingScopes = (generalRows, jornadaRows) => {
  const usersById = new Map();

  for (const user of [...generalRows, ...jornadaRows]) {
    if (!user?.id) {
      continue;
    }

    const previous = usersById.get(user.id);

    if (!previous) {
      usersById.set(user.id, user);
      continue;
    }

    usersById.set(user.id, {
      ...previous,
      ...user,
                general:
        previous.generalPosition !== null &&
        previous.generalPosition !== undefined
          ? previous.general
          : user.general,

      jornada:
        user.jornadaPosition !== null &&
        user.jornadaPosition !== undefined
          ? user.jornada
          : previous.jornada,

      generalPosition:
        previous.generalPosition ??
        user.generalPosition ??
        null,

            jornadaPosition:
        previous.jornadaPosition ??
        user.jornadaPosition ??
        null,

      generalPreviousPosition:
        previous.generalPreviousPosition ??
        user.generalPreviousPosition ??
        null,

      generalMovement:
        previous.generalMovement ??
        user.generalMovement ??
        null,

      createdAt:
        previous.createdAt ||
        user.createdAt ||
        null,

      isCurrentUser:
        previous.isCurrentUser ||
        user.isCurrentUser,
      achievementIds: [
        ...new Set([
          ...(previous.achievementIds || []),
          ...(user.achievementIds || []),
        ]),
      ],
    });
  }

  return [...usersById.values()];
};

const normalizeNotesRow = (row, playersById) => {
  const playerId = firstNonEmptyText(row?.player_id, row?.id);

  if (!playerId) {
    return null;
  }

  const rosterPlayer = playersById[playerId] || null;
  const roleValue = firstNonEmptyText(
    row?.role,
    row?.participation_role,
    row?.lineup_role,
  ).toUpperCase();
  const role = ["T", "STARTER", "TITULAR"].includes(roleValue)
    ? "T"
    : ["S", "SUBSTITUTE", "SUB", "SUPLENT"].includes(roleValue)
      ? "S"
      : null;

  const player = rosterPlayer || {
    id: playerId,
    name: firstNonEmptyText(row?.display_name, row?.player_name, row?.name, "Jugador"),
    shortName: firstNonEmptyText(row?.short_name, row?.display_name, row?.player_name, "Jugador"),
    image:
  getPublicStorageImageUrl(
    row?.avatar_bucket,
    row?.avatar_path,
    row?.avatar_version,
  ) ||
  firstNonEmptyText(row?.avatar_url, row?.portrait_url) ||
  "/fcb/PLAYER_PLACEHOLDER.png",
    eligibleForRatings: true,
  };

  const ownStars = toFiniteNumber(
    row?.my_stars,
    row?.own_stars,
    row?.user_stars,
    row?.my_rating_stars,
  );
  const matchAverage = toFiniteNumber(
    row?.match_average,
    row?.average_rating,
    row?.rating_average,
    row?.average,
  );
   const matchVoteCount = toFiniteNumber(
    row?.match_vote_count,
    row?.rating_count,
    row?.vote_count,
    row?.ratings_count,
    row?.votes,
  );
  const seasonAverage = toFiniteNumber(
    row?.season_average,
    row?.season_rating_average,
  );
  const seasonVoteCount = toFiniteNumber(
    row?.season_vote_count,
    row?.season_ratings_count,
  );

  return {
    player,
    stats: {
      role,
      goals: toFiniteNumber(row?.goals, row?.goals_scored),
      assists: toFiniteNumber(row?.assists),
      starts: toFiniteNumber(row?.season_starts, row?.starts),
      substituteAppearances: toFiniteNumber(
        row?.season_substitute_appearances,
        row?.substitute_appearances,
      ),
    },
    ownStars,
    displayStars: ownStars || getStarsFromAverage(matchAverage),
    average: matchAverage,
    voteCount: matchVoteCount,
    seasonAverage,
    seasonVoteCount,
    matchId: firstNonEmptyText(row?.match_id),
     homeScore: toFiniteNumber(
      row?.official_home_goals,
      row?.official_home_score,
      row?.home_goals,
      row?.home_score,
    ),
    awayScore: toFiniteNumber(
      row?.official_away_goals,
      row?.official_away_score,
      row?.away_goals,
      row?.away_score,
    ),
    publishedAt: row?.published_at || row?.finalized_at || null,
  };
};

const compareMatchNotesRows = (firstRow, secondRow) => {
  const firstRowHasVotes = firstRow.voteCount > 0;
  const secondRowHasVotes = secondRow.voteCount > 0;

  if (firstRowHasVotes !== secondRowHasVotes) {
    return firstRowHasVotes ? -1 : 1;
  }

  return (
    secondRow.average - firstRow.average ||
    secondRow.voteCount - firstRow.voteCount ||
    String(firstRow?.player?.name || "").localeCompare(
  String(secondRow?.player?.name || ""),
  "ca",
)
  );
};

const ACHIEVEMENT_CATALOG = [
  {
    id: "flick-reader",
    icon: "🧠",
    title: "Llegeix Flick",
    description: "Encerta 3 vegades l’11 titular exacte.",
  },
  {
    id: "nostradamus",
    icon: "🔮",
    title: "Nostradamus",
    description: "Encerta el resultat exacte 3 cops.",
  },
  {
    id: "yoyalodije",
    icon: "🎯",
    title: "Yoyalodije",
    description: "Encerta el protagonista 4 cops.",
  },
  {
    id: "winner",
    icon: "👑",
    title: "Winner",
    description: "Guanya 2 jornades.",
  },
  {
    id: "candidat",
    icon: "🚴",
    title: "Candidat",
    description: "Mantén-te al Top 5 de la classificació general durant 4 jornades consecutives.",
  },
  {
    id: "xop-xop-salinas",
    icon: "🐙",
    title: "Xop xop Salinas",
    description: "Falla els 11 jugadors d’un XI en una jornada.",
  },
  {
    id: "kamikaze",
    icon: "kamikaze-plane",
    title: "Kamikaze",
    description: "Encertar un 0-0 o el resultat exacte d’una derrota.",
  },
   {
    id: "preseason_champion_2026",
    icon: "preseason-sun-sunglasses",
    title: "Campió de la pretemporada 2026",
    description:
      "Guanya la classificació general definitiva de la pretemporada 2026.",
  },
  {
    id: "winter_champion_2026",
    icon: "winter-snowflake",
    title: "Campió d’hivern 2026",
    description:
      "Lidera la classificació general de Vesalaporra en acabar l’any natural 2026.",
  },
  {
    id: "season_champion_2026_27",
    icon: "vesalaporra-v",
    title: "Campió de la temporada 26/27",
    description: "Guanya la classificació general definitiva 2026/27.",
  },
];

const normalizeAchievementRows = (payload) => {
  const rows = unwrapRpcRows(payload, ["achievements", "rows", "items"]);

  return ACHIEVEMENT_CATALOG.map((definition) => {
    const row = rows.find(
      (candidate) =>
        firstNonEmptyText(
          candidate?.achievement_id,
          candidate?.achievement_key,
          candidate?.id,
          candidate?.key,
        ) === definition.id,
    );

    return {
      ...definition,
      unlocked: Boolean(
        row?.unlocked ??
          row?.is_unlocked ??
          row?.awarded_at ??
          row?.earned_at,
      ),
      progress: firstNonEmptyText(row?.progress_label, row?.progress) || "",
      awardedAt: row?.awarded_at || row?.earned_at || null,
    };
  });
};

const normalizeScoreHistoryRow = (row, index) => ({
  id: firstNonEmptyText(row?.score_id, row?.id, `${index}`),
  matchId: firstNonEmptyText(row?.match_id),
  label: firstNonEmptyText(row?.match_label, row?.competition_name, `PARTIT ${index + 1}`),
  dateLabel: firstNonEmptyText(row?.date_label, row?.kickoff_label),
  opponent: firstNonEmptyText(
    row?.opponent_display_name,
    row?.rival_display_name,
    row?.opponent_name,
    "Rival",
  ),
  predictedHome: toFiniteNumber(row?.predicted_home_goals, row?.predicted_home),
  predictedAway: toFiniteNumber(row?.predicted_away_goals, row?.predicted_away),
  actualHome: toFiniteNumber(row?.official_home_goals, row?.home_score),
  actualAway: toFiniteNumber(row?.official_away_goals, row?.away_score),
  xiHits: toFiniteNumber(row?.xi_hits, row?.lineup_hits, row?.correct_lineup_players),
  protagonist: firstNonEmptyText(row?.protagonist_display_name, row?.protagonist_name),
  protagonistHit: Boolean(row?.protagonist_hit ?? row?.protagonist_correct),
  resultPoints: toFiniteNumber(row?.result_points),
  xiPoints: toFiniteNumber(row?.xi_points, row?.lineup_points),
  protagonistPoints: toFiniteNumber(row?.protagonist_points),
  totalPoints: toFiniteNumber(row?.total_points, row?.points),
  isExact: Boolean(row?.exact_result ?? row?.is_exact),
  scoredAt: row?.scored_at || row?.created_at || null,
});

const buildRealProfileData = (history, achievements) => {
  const safeHistory = Array.isArray(history) ? history : [];
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const bestMatch = safeHistory.length
    ? [...safeHistory].sort((a, b) => b.totalPoints - a.totalPoints)[0]
    : null;

  return {
    history: safeHistory,
    played: safeHistory.length,
    exactXiCount: safeHistory.filter((match) => match.xiHits === 11).length,
    exactScores: safeHistory.filter((match) => match.isExact).length,
    protagonistHits: safeHistory.filter((match) => match.protagonistHit).length,
    averageXi: safeHistory.length
      ? safeHistory.reduce((total, match) => total + match.xiHits, 0) /
        safeHistory.length
      : 0,
    bestMatch,
    bestXi: safeHistory.length
      ? Math.max(...safeHistory.map((match) => match.xiHits))
      : 0,
    bestProtagonistPoints: safeHistory.length
      ? Math.max(...safeHistory.map((match) => match.protagonistPoints))
      : 0,
    achievements: safeAchievements,
    unlockedAchievements: safeAchievements.filter(
      (achievement) => achievement.unlocked,
    ).length,
  };
};

const ADMIN_SCORING_TOOLS = [
  {
    id: "starter",
    icon: "T",
    label: "Titular",
  },
  {
    id: "substitute",
    icon: "S",
    label: "Suplent que ha jugat",
  },
  {
    id: "goal",
    icon: "⚽",
    label: "Gol",
  },
  {
    id: "assist",
    icon: "A",
    label: "Assistència",
  },
];

const getRatingValueFromStars = (stars) =>
  RATING_VALUE_BY_STARS[Number(stars)] ?? null;

const getStarsFromAverage = (average) => {
  if (!Number.isFinite(average)) {
    return 0;
  }

  return Math.max(1, Math.min(6, Math.round(average / 2) + 1));
};

const getCombinedRatingSummary = (communitySummary, selectedStars) => {
  const safeCommunitySummary = communitySummary || {
    average: 0,
    voteCount: 0,
    totalValue: 0,
  };

  const selectedValue = getRatingValueFromStars(selectedStars);

  if (selectedValue === null) {
    return safeCommunitySummary;
  }

  const voteCount = safeCommunitySummary.voteCount + 1;
  const totalValue = safeCommunitySummary.totalValue + selectedValue;

  return {
    average: totalValue / voteCount,
    voteCount,
    totalValue,
  };
};

const formatRatingAverage = (average) =>
  Number(average || 0).toLocaleString("ca-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// TeamColorBadge ja està definit al bloc visual superior amb suport
// per als patrons "solid" i "striped".

function OfficialMatchCard({
  match = null,
  homeScore,
  awayScore,
  editable = false,
  onHomeScoreChange,
  onAwayScoreChange,
}) {
  const homeName = match?.homeName || "Equip local";
  const awayName = match?.awayName || "Equip visitant";
  const homeTeamId = match?.homeTeamId || "";
  const awayTeamId = match?.awayTeamId || "";
  const homeColors = match?.homeBadgeColors || null;
  const awayColors = match?.awayBadgeColors || null;
  const homePattern = match?.homeBadgePattern || "striped";
  const awayPattern = match?.awayBadgePattern || "solid";

  const dateLabel = match?.kickoffAt
    ? formatCurrentMatchKickoffLabel(match.kickoffAt)
    : "DATA PENDENT";

  const changeScore = (team, delta) => {
    const currentScore = team === "home" ? homeScore : awayScore;
    const nextScore = Math.max(0, Number(currentScore || 0) + delta);

    if (team === "home") {
      onHomeScoreChange?.(nextScore);
      return;
    }

    onAwayScoreChange?.(nextScore);
  };

  return (
    <section
      className={
        editable ? "official-match-card editable" : "official-match-card"
      }
      aria-label={`${homeName} ${homeScore}–${awayScore} ${awayName}`}
    >
      <span className="official-match-eyebrow">
        {editable ? "PARTIT ACTIU" : "ÚLTIM PARTIT PUNTUAT"}
      </span>

      <div className="official-match-line">
        <div className="official-match-team home">
          <TeamColorBadge
            teamId={homeTeamId}
            colors={homeColors}
            pattern={homePattern}
            className="official-match-badge"
          />

          <strong>{homeName}</strong>
        </div>

        {editable ? (
          <div className="official-score-editor" aria-label="Resultat oficial">
            <div className="official-score-side">
              <button
                type="button"
                onClick={() => changeScore("home", -1)}
                aria-label={`Resta un gol a ${homeName}`}
              >
                −
              </button>

              <strong>{homeScore}</strong>

              <button
                type="button"
                onClick={() => changeScore("home", 1)}
                aria-label={`Suma un gol a ${homeName}`}
              >
                +
              </button>
            </div>

            <span className="official-score-versus" aria-hidden="true">
              VS
            </span>

            <div className="official-score-side">
              <button
                type="button"
                onClick={() => changeScore("away", -1)}
                aria-label={`Resta un gol a ${awayName}`}
              >
                −
              </button>

              <strong>{awayScore}</strong>

              <button
                type="button"
                onClick={() => changeScore("away", 1)}
                aria-label={`Suma un gol a ${awayName}`}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <strong className="official-match-score">
            {homeScore}
            <span aria-hidden="true">–</span>
            {awayScore}
          </strong>
        )}

        <div className="official-match-team away">
          <TeamColorBadge
            teamId={awayTeamId}
            colors={awayColors}
            pattern={awayPattern}
            className="official-match-badge"
          />

          <strong>{awayName}</strong>
        </div>
      </div>

      <small className="official-match-date">{dateLabel}</small>
    </section>
  );
}


function KamikazePlaneIcon({ className = "" }) {
  return (
    <svg
      className={`achievement-custom-icon kamikaze-plane-icon ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Avioneta antiga vermella amb el morro cap a terra"
    >
      <g transform="rotate(90 32 32)">
        <path
          d="M10 31.5 24 27l8-15 5 1-3 15 15-4.5c3-.9 5.5.7 5.5 3.5S52 31.4 49 30.5L34 27l3 15-5 1-8-15-14-4.5Z"
          fill="#d9203f"
          stroke="#6f0d21"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 27.5v8M5 31.5h6"
          stroke="#f37a88"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="31.5" r="3.2" fill="#7d1024" />
        <path
          d="M24 27.3h10v8.4H24z"
          fill="#b51631"
          stroke="#6f0d21"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}

function VesalaporraChampionIcon({ className = "" }) {
  return (
    <svg
      className={`achievement-custom-icon vesalaporra-champion-icon ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="V de Vesalaporra"
    >
      <defs>
        <linearGradient id="vlpChampionGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2444a8" />
          <stop offset="48%" stopColor="#2444a8" />
          <stop offset="52%" stopColor="#a41645" />
          <stop offset="100%" stopColor="#a41645" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="27" fill="url(#vlpChampionGradient)" />

      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="#f4d04b"
        strokeWidth="4"
      />

      <path
        d="M18 18h9l5 24 5-24h9L37 49H27Z"
        fill="#ffe56f"
        stroke="#7f1838"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PreseasonSunSunglassesIcon({ className = "" }) {
  return (
    <svg
      className={`achievement-custom-icon preseason-sun-sunglasses-icon ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Sol amb ulleres de sol"
    >
      <g
        fill="none"
        stroke="#efa51d"
        strokeWidth="4.5"
        strokeLinecap="round"
      >
        <path d="M32 4v7" />
        <path d="M32 53v7" />
        <path d="M4 32h7" />
        <path d="M53 32h7" />
        <path d="m12.2 12.2 5 5" />
        <path d="m46.8 46.8 5 5" />
        <path d="m51.8 12.2-5 5" />
        <path d="m17.2 46.8-5 5" />
      </g>

      <circle
        cx="32"
        cy="32"
        r="19.5"
        fill="#ffd34f"
        stroke="#e89b18"
        strokeWidth="2.5"
      />

      <path
        d="M15.5 26.5c4.8-1.7 9.9-2.4 15.2-1.8"
        fill="none"
        stroke="#191919"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M48.5 26.5c-4.8-1.7-9.9-2.4-15.2-1.8"
        fill="none"
        stroke="#191919"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M16.5 27.2h14.1l-1.2 7.2c-.5 3.2-2.6 5-5.8 5h-.9c-3.1 0-5.2-1.8-5.7-4.9Z"
        fill="#17191f"
        stroke="#08090b"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M33.4 27.2h14.1l-.5 7.3c-.5 3.1-2.6 4.9-5.7 4.9h-.9c-3.2 0-5.3-1.8-5.8-5Z"
        fill="#17191f"
        stroke="#08090b"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M30.2 29.4c1.2-1 2.4-1 3.6 0"
        fill="none"
        stroke="#08090b"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="m19.8 29.5 4.8 6.8"
        fill="none"
        stroke="#627aa7"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="m36.8 29.5 4.8 6.8"
        fill="none"
        stroke="#627aa7"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function WinterSnowflakeIcon({ className = "" }) {
  return (
    <svg
      className={`achievement-custom-icon winter-snowflake-icon ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Floc de neu d’hivern"
    >
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="#e9f7ff"
        stroke="#79bfe8"
        strokeWidth="3"
      />

      <circle
        cx="32"
        cy="32"
        r="21.5"
        fill="#d9f1ff"
        stroke="#b7e3fa"
        strokeWidth="1.5"
      />

      <g
        fill="none"
        stroke="#2f91cf"
        strokeWidth="3.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 13v38" />
        <path d="M15.5 22.5 48.5 41.5" />
        <path d="M15.5 41.5 48.5 22.5" />

        <path d="m32 13-5 5" />
        <path d="m32 13 5 5" />

        <path d="m32 51-5-5" />
        <path d="m32 51 5-5" />

        <path d="m15.5 22.5 7 .8" />
        <path d="m15.5 22.5 2.8 6.4" />

        <path d="m48.5 41.5-7-.8" />
        <path d="m48.5 41.5-2.8-6.4" />

        <path d="m15.5 41.5 2.8-6.4" />
        <path d="m15.5 41.5 7-.8" />

        <path d="m48.5 22.5-2.8 6.4" />
        <path d="m48.5 22.5-7 .8" />
      </g>

      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill="#ffffff"
        stroke="#2f91cf"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function AchievementIconGraphic({ achievement }) {
  if (achievement?.icon === "kamikaze-plane") {
    return <KamikazePlaneIcon />;
  }

  if (achievement?.icon === "preseason-sun-sunglasses") {
    return <PreseasonSunSunglassesIcon />;
  }

  if (achievement?.icon === "winter-snowflake") {
    return <WinterSnowflakeIcon />;
  }

  if (achievement?.icon === "vesalaporra-v") {
    return <VesalaporraChampionIcon />;
  }

  return achievement?.icon || "🏅";
}

function RankingAchievementIcons({ achievements, className = "" }) {
  const unlockedAchievements = (achievements || []).filter(
    (achievement) => achievement.unlocked,
  );

  if (unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <span
      className={`ranking-achievement-icons ${className}`.trim()}
      aria-label={`${unlockedAchievements.length} medalles desbloquejades`}
    >
      {unlockedAchievements.map((achievement) => (
        <span
          key={achievement.id}
          className="ranking-achievement-icon"
          title={achievement.title}
          aria-label={achievement.title}
        >
          <AchievementIconGraphic achievement={achievement} />
        </span>
      ))}
    </span>
  );
}

function PlayerNotesAvatar({ player, className = "" }) {
  return (
    <span className={`notes-player-avatar ${className}`.trim()}>
      <img src={player.image} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

function ProtagonistEventIcon({
  type,
  count = null,
  className = "",
  onClick = null,
  disabled = false,
  ariaLabel = null,
}) {
  const isGoal = type === "goal";
  const eventLabel = isGoal ? "Gol" : "Assistència";
  const Component = onClick ? "button" : "span";

  const interactiveProps = onClick
    ? {
        type: "button",
        onClick,
        disabled,
        style: {
          display: "inline-flex",
          width: "auto",
          height: "auto",
          padding: 0,
          border: 0,
          borderRadius: 0,
          background: "transparent",
          color: "inherit",
          font: "inherit",
          cursor: disabled ? "default" : "pointer",
        },
      }
    : {};

  return (
    <Component
      className={`protagonist-event-stat ${type} ${className}`.trim()}
      aria-label={
        ariaLabel ||
        (count === null ? eventLabel : `${eventLabel}: ${count}`)
      }
      {...interactiveProps}
    >
      <span
        className={`protagonist-combined-icon ${isGoal ? "goal" : "assist"}`}
        aria-hidden="true"
      >
        {isGoal ? "⚽" : "A"}
      </span>

      {count !== null && (
        <strong className="protagonist-event-count">{count}</strong>
      )}
    </Component>
  );
}

function ParticipationRoleIcon({
  type,
  count = null,
  className = "",
  onClick = null,
  disabled = false,
  pressed = undefined,
  ariaLabel = null,
}) {
  const isStarter = type === "starter";
  const roleLetter = isStarter ? "T" : "S";
  const roleLabel = isStarter ? "Titular" : "Suplent";
  const Component = onClick ? "button" : "span";

  const interactiveProps = onClick
    ? {
        type: "button",
        onClick,
        disabled,
        "aria-pressed": pressed,
        style: {
          display: "inline-flex",
          width: "auto",
          height: "auto",
          padding: 0,
          border: 0,
          borderRadius: 0,
          background: "transparent",
          color: "inherit",
          font: "inherit",
          cursor: disabled ? "default" : "pointer",
        },
      }
    : {};

  return (
    <Component
      className={`participation-role-stat ${type} ${className}`.trim()}
      aria-label={
        ariaLabel ||
        (count === null ? roleLabel : `${roleLabel}: ${count}`)
      }
      {...interactiveProps}
    >
      <span
        className={`participation-role-icon ${type}`}
        aria-hidden="true"
      >
        {roleLetter}
      </span>

      {count !== null && (
        <strong className="participation-role-count">{count}</strong>
      )}
    </Component>
  );
}

function PlayerNotesStats({ stats, mode }) {
  if (!stats) {
    return null;
  }

  if (mode === "season") {
    return (
      <div
        className="notes-player-stats season"
        aria-label="Estadístiques de temporada"
      >
        <ParticipationRoleIcon type="starter" count={stats.starts} />
        <ParticipationRoleIcon
          type="substitute"
          count={stats.substituteAppearances}
        />
        <ProtagonistEventIcon type="goal" count={stats.goals} />
        <ProtagonistEventIcon type="assist" count={stats.assists} />
      </div>
    );
  }

  return (
    <div
      className="notes-player-stats match"
      aria-label="Participació en el partit"
    >
      {stats.role && (
        <ParticipationRoleIcon
          type={stats.role === "T" ? "starter" : "substitute"}
        />
      )}

      {Array.from({ length: stats.goals }, (_, index) => (
        <ProtagonistEventIcon key={`goal-${index}`} type="goal" />
      ))}

      {Array.from({ length: stats.assists }, (_, index) => (
        <ProtagonistEventIcon key={`assist-${index}`} type="assist" />
      ))}
    </div>
  );
}

function RatingStars({ value, onRate, readOnly = false }) {
  return (
    <div
      className={readOnly ? "notes-stars read-only" : "notes-stars"}
      aria-label={`${value || 0} de 6 estrelles`}
    >
      {Array.from({ length: 6 }, (_, index) => {
        const starNumber = index + 1;
        const isActive = starNumber <= value;

        if (readOnly) {
          return (
            <span
              key={starNumber}
              className={isActive ? "notes-star active" : "notes-star"}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={starNumber}
            type="button"
            className={isActive ? "notes-star active" : "notes-star"}
            onClick={() => onRate(starNumber)}
            aria-label={`Valora amb ${starNumber} estrelles`}
            aria-pressed={value === starNumber}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// FONT REAL: Perfil, historial i medalles provenen exclusivament de Supabase.

const VESALAPORRA_CURRENT_MATCH_ID =
  import.meta.env.VITE_VESALAPORRA_CURRENT_MATCH_ID || null;

const VESALAPORRA_PUBLIC_CURRENT_MATCH_RPC =
  "vesalaporra_public_current_match_v2";

const VESALAPORRA_PUBLIC_NEXT_MATCH_RPC =
  "vesalaporra_public_next_match_v1";

const VESALAPORRA_ADMIN_MATCH_LIST_RPC =
  "vesalaporra_admin_list_matches_v3";

const VESALAPORRA_ADMIN_MATCH_UPSERT_RPC =
  "vesalaporra_admin_upsert_match_v3";

const VESALAPORRA_ADMIN_SET_MATCH_POINTS_MULTIPLIER_RPC =
  "vesalaporra_admin_set_match_points_multiplier";

const VESALAPORRA_MATCH_SCORING_RULES_TABLE =
  "vesalaporra_match_scoring_rules";

const VESALAPORRA_PRESENTATION_TIME_ZONE = "Europe/Madrid";

const VESALAPORRA_LIVE_SYNC_INTERVAL_MS = 15000;


const ADMIN_MATCH_COLOR_OPTIONS = [
  { value: "#ffffff", label: "Blanc" },
  { value: "#111111", label: "Negre" },
  { value: "#d71920", label: "Vermell" },
  { value: "#163f8f", label: "Blau" },
  { value: "#0a1f44", label: "Blau marí" },
  { value: "#53a7e8", label: "Blau cel" },
  { value: "#f4cf36", label: "Groc" },
  { value: "#1f8f4e", label: "Verd" },
];

const ADMIN_MATCH_SEASON_OPTIONS = [
  {
    value: "PRETEMPORADA_2026",
    label: "PRETEMPORADA 2026",
  },
  {
    value: "TEMPORADA_2026_27",
    label: "TEMPORADA 26/27",
  },
];

const getAdminMatchSeasonLabel = (seasonKey, fallback = "TEMPORADA") =>
  ADMIN_MATCH_SEASON_OPTIONS.find(
    (seasonOption) => seasonOption.value === seasonKey,
  )?.label || fallback;

const EMPTY_ADMIN_MATCH_FORM = {
  matchId: null,
  seasonKey: "PRETEMPORADA_2026",
  rivalName: "",
  rivalKey: "",
  rivalCountry: "",
  competitionName: "",
  venueName: "",
  kickoffText: "",
  barcaSide: "home",
  rivalColors: [],
  rivalPattern: "solid",
  makeCurrent: true,
  pointsMultiplier: 1,
};

const normalizePointsMultiplier = (value) =>
  Number(value) === 2 ? 2 : 1;

const loadMatchPointsMultipliers = async (matchIds) => {
  const normalizedMatchIds = [
    ...new Set(
      (Array.isArray(matchIds) ? matchIds : [matchIds])
        .map((matchId) => String(matchId || "").trim())
        .filter(Boolean),
    ),
  ];

  if (normalizedMatchIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from(VESALAPORRA_MATCH_SCORING_RULES_TABLE)
    .select("match_id, points_multiplier")
    .in("match_id", normalizedMatchIds);

  if (error) {
    throw error;
  }

  return Object.fromEntries(
    (Array.isArray(data) ? data : []).map((row) => [
      String(row.match_id),
      normalizePointsMultiplier(row.points_multiplier),
    ]),
  );
};

const slugifyTeamKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const getTimeZoneOffsetMilliseconds = (
  date,
  timeZone = VESALAPORRA_PRESENTATION_TIME_ZONE,
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const representedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return representedAsUtc - date.getTime();
};

const madridDatePartsToIso = ({ year, month, day, hour, minute }) => {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let resolvedUtc =
    utcGuess -
    getTimeZoneOffsetMilliseconds(
      new Date(utcGuess),
      VESALAPORRA_PRESENTATION_TIME_ZONE,
    );

  resolvedUtc =
    utcGuess -
    getTimeZoneOffsetMilliseconds(
      new Date(resolvedUtc),
      VESALAPORRA_PRESENTATION_TIME_ZONE,
    );

  return new Date(resolvedUtc).toISOString();
};

const parseAdminMatchDateText = (value) => {
  const match = String(value || "")
    .trim()
    .match(
      /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})\s*(?:i|,|a\s+les)?\s*(\d{1,2})\s*:\s*(\d{2})$/i,
    );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  if (
    year < 2020 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const calendarCheck = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    day,
    month,
    year,
    hour,
    minute,
    iso: madridDatePartsToIso({ year, month, day, hour, minute }),
  };
};

const isoToAdminMatchDateText = (isoValue) => {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VESALAPORRA_PRESENTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${Number(values.day)}/${Number(values.month)}/${String(values.year).slice(-2)} i ${values.hour}:${values.minute}`;
};

const isBarcelonaTeam = (teamKey, displayName) => {
  const normalizedKey = slugifyTeamKey(teamKey);
  const normalizedName = slugifyTeamKey(displayName);

  return (
    normalizedKey === "barcelona" ||
    normalizedKey === "fc-barcelona" ||
    normalizedName === "barca" ||
    normalizedName === "fc-barcelona" ||
    normalizedName === "barcelona"
  );
};

const normalizeAdminMatch = (row) => {
  const explicitHomeTeamKey =
    row?.home_team_key || row?.homeTeamKey || "";
  const explicitAwayTeamKey =
    row?.away_team_key || row?.awayTeamKey || "";
  const explicitHomeDisplayName =
    row?.home_display_name || row?.homeDisplayName || "";
  const explicitAwayDisplayName =
    row?.away_display_name || row?.awayDisplayName || "";

  const storedBarcelonaFirst = readOptionalBoolean(
    row?.barcelona_first,
    row?.barcelonaFirst,
    row?.barca_is_home,
    row?.barcaIsHome,
  );

  const detectedBarcelonaFirst = isBarcelonaTeam(
    explicitHomeTeamKey,
    explicitHomeDisplayName,
  );

  const barcaIsHome =
    typeof storedBarcelonaFirst === "boolean"
      ? storedBarcelonaFirst
      : detectedBarcelonaFirst;

  const canonicalOpponentTeamKey =
    row?.opponent_team_key || row?.rival_team_key || "";
  const canonicalOpponentDisplayName =
    row?.opponent_display_name || row?.rival_display_name || "";

  const rivalTeamKey =
    canonicalOpponentTeamKey ||
    (barcaIsHome ? explicitAwayTeamKey : explicitHomeTeamKey);

  const rivalDisplayName =
    canonicalOpponentDisplayName ||
    (barcaIsHome ? explicitAwayDisplayName : explicitHomeDisplayName);

  const homeTeamKey = barcaIsHome
    ? explicitHomeTeamKey || "barcelona"
    : rivalTeamKey;

  const homeDisplayName = barcaIsHome
    ? explicitHomeDisplayName || "Barça"
    : rivalDisplayName;

  const awayTeamKey = barcaIsHome
    ? rivalTeamKey
    : explicitAwayTeamKey || "barcelona";

  const awayDisplayName = barcaIsHome
    ? rivalDisplayName
    : explicitAwayDisplayName || "Barça";

  const rivalColors = normalizeTeamBadgeColors(
    getMatchTeamBadgeColors(row, "opponent"),
    getMatchTeamBadgeColors(row, "rival"),
    getMatchTeamBadgeColors(row, barcaIsHome ? "away" : "home"),
  );

  const rivalPattern = normalizeTeamBadgePattern(
    row?.opponent_badge_pattern ||
      row?.rival_badge_pattern,
    rivalColors,
  );

  return {
    matchId: String(row?.match_id || row?.id || ""),
    seasonKey:
      row?.season_key || row?.seasonKey || "PRETEMPORADA_2026",
    seasonName:
      row?.season_display_name ||
      row?.seasonName ||
      getAdminMatchSeasonLabel(
        row?.season_key || row?.seasonKey,
      ),
    seasonMatchNo: Number(
      row?.season_match_no || row?.seasonMatchNo || 0,
    ),
    barcaSide: barcaIsHome ? "home" : "away",
    homeTeamKey,
    homeDisplayName,
    awayTeamKey,
    awayDisplayName,
    rivalTeamKey,
    rivalDisplayName,
    rivalCountry:
      row?.opponent_country ||
      row?.rival_country ||
      row?.[`${barcaIsHome ? "away" : "home"}_country`] ||
      "",
    competitionName:
      row?.competition_name || row?.competitionName || "",
    venueName: row?.venue_name || row?.venueName || "",
    kickoffAt:
      row?.scheduled_kickoff_at || row?.kickoff_at || row?.kickoffAt || null,
    predictionsCloseAt:
      row?.predictions_close_at || row?.predictionsCloseAt || null,
    rivalColors,
    rivalPattern,
    status: row?.match_status || row?.status || "scheduled",
    predictionsAreOpen: Boolean(
      row?.predictions_are_open ?? row?.predictionsAreOpen,
    ),
    pointsMultiplier: normalizePointsMultiplier(
      row?.points_multiplier ?? row?.pointsMultiplier,
    ),
    isCurrent: Boolean(
      row?.is_current ??
        row?.isCurrent ??
        row?.is_public ??
        row?.isPublic,
    ),
  };
};

const adminMatchToForm = (match) => {
  const rivalColors = normalizeTeamBadgeColors(match.rivalColors).slice(0, 2);

  return {
    matchId: match.matchId || null,
    seasonKey: match.seasonKey || "PRETEMPORADA_2026",
    rivalName: match.rivalDisplayName || "",
    rivalKey: match.rivalTeamKey || "",
    rivalCountry: match.rivalCountry || "",
    competitionName: match.competitionName || "",
    venueName: match.venueName || "",
    kickoffText: isoToAdminMatchDateText(match.kickoffAt),
    barcaSide: match.barcaSide || "home",
    rivalColors: rivalColors.length > 0 ? rivalColors : [],
    rivalPattern: normalizeTeamBadgePattern(
      match.rivalPattern,
      rivalColors,
    ),
    makeCurrent: match.isCurrent,
    pointsMultiplier: normalizePointsMultiplier(match.pointsMultiplier),
  };
};

const PLAYER_SOURCE_MAX_BYTES = 5 * 1024 * 1024;

const PLAYER_SOURCE_ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const EMPTY_ADMIN_PLAYER_FORM = {
  displayName: "",
};

const createAdminAuditId = (action) => {
  const safeAction = String(action || "ACTION")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .slice(0, 48);

  return `VLP_UI_${safeAction}_20260713_016_${crypto.randomUUID()}`;
};

const getPayloadValue = (payload, candidateKeys) => {
  const keys = new Set(candidateKeys);
  const visited = new Set();

  const visit = (value, depth) => {
    if (depth > 5 || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value !== "object") {
      return undefined;
    }

    if (visited.has(value)) {
      return undefined;
    }

    visited.add(value);

    for (const [key, nestedValue] of Object.entries(value)) {
      if (keys.has(key) && nestedValue !== null && nestedValue !== undefined) {
        return nestedValue;
      }
    }

    for (const nestedValue of Object.values(value)) {
      const result = visit(nestedValue, depth + 1);

      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  };

  return visit(payload, 0);
};

const getPublicStorageImageUrl = (bucket, path, version = null) => {
  if (!bucket || !path) {
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || null;

  if (!publicUrl) {
    return null;
  }

  const cacheVersion = version || "current";

  return `${publicUrl}?v=${encodeURIComponent(cacheVersion)}`;
};

const normalizeAdminPlayer = (row) => ({
  playerId: row.player_id,
  playerKey: row.player_key,
  displayName: row.display_name,
  shortName: row.short_name || row.display_name,
  shirtNumber: row.shirt_number,
  catalogStatus: row.catalog_status,
  sourceImageBucket: row.source_image_bucket,
  sourceImagePath: row.source_image_path,
  sourceImageVersion: row.source_image_version,
  sourceImageMimeType: row.source_image_mime_type,
  sourceImageOriginalFilename: row.source_image_original_filename,
  portraitBucket: row.portrait_bucket,
  portraitPath: row.portrait_path,
  portraitVersion: row.portrait_version,
  portraitMimeType: row.portrait_mime_type,
  portraitOriginalFilename: row.portrait_original_filename,
  portraitUrl: getPublicStorageImageUrl(
    row.portrait_bucket,
    row.portrait_path,
    row.portrait_version,
  ),
  badgeProcessingStatus: row.badge_processing_status,
  badgeProcessingError: row.badge_processing_error,
  currentBadgeJobId: row.current_badge_job_id,
  currentJobStatus: row.current_job_status,
  currentJobReviewStatus: row.current_job_review_status,
  currentJobPreviewBucket: row.current_job_preview_bucket,
  currentJobPreviewPath: row.current_job_preview_path,
  assignedToMatch: Boolean(row.assigned_to_match),
  assignedMatchId: row.assigned_match_id,
  rosterOrder: row.roster_order,
  availabilityStatus: row.availability_status || "available",
  isPublicVisible: Boolean(row.is_public_visible),
  eligibleForLineup: Boolean(row.eligible_for_lineup),
  eligibleForProtagonist: Boolean(row.eligible_for_protagonist),
  eligibleForRatings: Boolean(row.eligible_for_ratings),
  adminNote: row.admin_note || "",
  protagonistGroupKey: normalizeProtagonistGroupKey(
    row.protagonist_group_key ||
      row.protagonist_group ||
      getProtagonistGroupKeyFromAdminNote(row.admin_note),
  ),
});

const normalizePublicMatchPlayer = (row) => ({
  id: String(row.player_id),
  name: row.display_name,
  shortName: row.short_name || row.display_name,
  shirtNumber: row.shirt_number,
  image:
    getPublicStorageImageUrl(
      row.avatar_bucket,
      row.avatar_path,
      row.avatar_version,
    ) || "/fcb/PLAYER_PLACEHOLDER.png",
  availabilityStatus: row.availability_status || "available",
  eligibleForLineup: Boolean(row.eligible_for_lineup),
  eligibleForProtagonist: Boolean(row.eligible_for_protagonist),
  eligibleForRatings: Boolean(row.eligible_for_ratings),
  protagonistGroupKey: normalizeProtagonistGroupKey(
    row.protagonist_group_key ||
      row.protagonist_group ||
      getProtagonistGroupKeyFromAdminNote(row.admin_note),
  ),
  rosterOrder: Number(row.roster_order || 9999),
  isDynamicPlayer: true,
});

const getDefaultDynamicProtagonistScoring = (player) => {
  const groupKey = normalizeProtagonistGroupKey(
    player?.protagonistGroupKey || "e",
  );

  const group = PROTAGONIST_GROUP_BY_KEY[groupKey];

  if (
    !player?.eligibleForProtagonist ||
    group?.excludesProtagonist === true
  ) {
    return null;
  }

  return {
    groupLabel: group.label,
    groupKey,
    goalContributions: 0,
    hitPoints: group.hitPoints,
    missPoints: group.missPoints,
    order: group.sortOrder + Number(player.rosterOrder || 0),
  };
};

const formation4231 = [
  {
    id: "striker",
    label: "Davanter centre",
    slots: [0],
  },
  {
    id: "attacking-midfielders",
    label: "Línia de tres mitjapuntes",
    slots: [1, 2, 3],
  },
  {
    id: "holding-midfielders",
    label: "Doble pivot",
    slots: [4, 5],
  },
  {
    id: "defenders",
    label: "Defenses",
    slots: [6, 7, 8, 9],
  },
  {
    id: "goalkeeper",
    label: "Porter",
    slots: [10],
  },
];

function App() {
  const initialRouteState = useRef(
    getVesalaporraRouteState(),
  ).current;

  const routeHistoryReadyRef = useRef(false);

  const [activePage, setActivePage] = useState(
    initialRouteState.activePage,
  );

  const [rankingTab, setRankingTab] = useState(
    initialRouteState.rankingTab,
  );

  const [visibleRankingCount, setVisibleRankingCount] =
    useState(RANKING_PAGE_SIZE);

  const [selectedProfileUserId, setSelectedProfileUserId] =
    useState(initialRouteState.selectedProfileUserId);

  const [profileTab, setProfileTab] = useState(
    initialRouteState.profileTab,
  );

  const [authSession, setAuthSession] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [authActionLoading, setAuthActionLoading] = useState(false);

  const [authError, setAuthError] = useState("");


  const [authProfile, setAuthProfile] = useState(null);

  const [profileLoading, setProfileLoading] = useState(false);

  const [profileNameEditorOpen, setProfileNameEditorOpen] = useState(false);

  const [profileDraftName, setProfileDraftName] = useState("");

  const [profileActionLoading, setProfileActionLoading] = useState(false);

  const [profileFeedback, setProfileFeedback] = useState(null);

  
  const [barcaScore, setBarcaScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [scoreTouched, setScoreTouched] = useState(false);

  const [lineup, setLineup] = useState(Array.from({ length: 11 }, () => null));

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const [protagonistId, setProtagonistId] = useState(null);

  const [protagonistSelectionActive, setProtagonistSelectionActive] =
    useState(false);

  const [protagonistPreviewId, setProtagonistPreviewId] = useState(null);

  const [openInfoSection, setOpenInfoSection] = useState(null);

  const [matchData, setMatchData] = useState(EMPTY_MATCH_DATA);

  const [matchLoading, setMatchLoading] = useState(true);

   const [countdown, setCountdown] = useState(() =>
    getCountdown(null),
  );

  const [openingCountdown, setOpeningCountdown] = useState(() =>
    getCountdown(null),
  );

  const [predictionLoading, setPredictionLoading] = useState(false);

  const [predictionSubmitting, setPredictionSubmitting] = useState(false);

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const [confirmationMode, setConfirmationMode] = useState("prediction");

  const [predictionConfirmed, setPredictionConfirmed] = useState(false);

  const [confirmedPrediction, setConfirmedPrediction] = useState(null);

  const [confirmationAnimationActive, setConfirmationAnimationActive] =
    useState(false);

  const [predictionCelebrationOrigin, setPredictionCelebrationOrigin] =
    useState({
      left: "50vw",
      top: "78vh",
    });

  const confirmationAnimationTimerRef = useRef(null);

  const protagonistSelectionAreaRef = useRef(null);

  const protagonistCardRef = useRef(null);

  const protagonistInputTypeRef = useRef("mouse");

  const protagonistTouchPreviewIdRef = useRef(null);

    const [notesTab, setNotesTab] = useState(
    initialRouteState.notesTab,
  );

  const [notesRatingsByPlayerId, setNotesRatingsByPlayerId] = useState({});

  const [notesRows, setNotesRows] = useState([]);
  const [seasonNotesRows, setSeasonNotesRows] = useState([]);
  const [notesMatchData, setNotesMatchData] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [notesSubmissionClosed, setNotesSubmissionClosed] = useState(false);
  const [ratingSavingPlayerId, setRatingSavingPlayerId] = useState(null);
  const [notesMatchOrder, setNotesMatchOrder] = useState({
    matchId: "",
    playerIds: [],
  });
  const [notesRankingRefreshing, setNotesRankingRefreshing] = useState(false);

const [rankingUsers, setRankingUsers] = useState([]);
const [rankingLoading, setRankingLoading] = useState(false);
const [rankingError, setRankingError] = useState("");
const [rankingJornadaNumber, setRankingJornadaNumber] =
  useState(null);

  const [profileHistory, setProfileHistory] = useState([]);

const [expandedProfilePrediction, setExpandedProfilePrediction] =
  useState(null);

  const [profileAchievements, setProfileAchievements] = useState(
    ACHIEVEMENT_CATALOG.map((achievement) => ({
      ...achievement,
      unlocked: false,
      progress: "",
    })),
  );

  const [profileJornadaWins, setProfileJornadaWins] = useState(0);

  const [profileDataLoading, setProfileDataLoading] = useState(false);
  const [profileDataError, setProfileDataError] = useState("");

  const [privateLeagues, setPrivateLeagues] = useState([]);
  const [privateLeaguesLoading, setPrivateLeaguesLoading] = useState(false);
  const [privateLeaguesError, setPrivateLeaguesError] = useState("");
  const [privateLeagueActionLoading, setPrivateLeagueActionLoading] =
    useState(false);
  const [privateLeagueFeedback, setPrivateLeagueFeedback] =
    useState(null);
  const [privateLeagueCreateOpen, setPrivateLeagueCreateOpen] =
    useState(false);
  const [privateLeagueJoinOpen, setPrivateLeagueJoinOpen] =
    useState(false);
  const [privateLeagueInfoOpen, setPrivateLeagueInfoOpen] =
    useState(false);
  const [privateLeagueDraftName, setPrivateLeagueDraftName] =
    useState("");
  const [privateLeagueJoinCode, setPrivateLeagueJoinCode] =
    useState("");
  const [selectedPrivateLeagueId, setSelectedPrivateLeagueId] =
    useState(null);
  const [privateLeagueMembers, setPrivateLeagueMembers] =
    useState([]);
  const [privateLeagueMembersLoading, setPrivateLeagueMembersLoading] =
    useState(false);
  const [privateLeagueRankingTab, setPrivateLeagueRankingTab] =
    useState("general");

  const [officialMatchState, setOfficialMatchState] = useState(() =>
    createEmptyOfficialMatchState(null),
  );

  const [officialMatchSaving, setOfficialMatchSaving] = useState(false);

  const [officialMatchFeedback, setOfficialMatchFeedback] = useState(null);


  const [backendIsAdmin, setBackendIsAdmin] = useState(false);

   const [adminScoringTab, setAdminScoringTab] = useState(
    initialRouteState.adminScoringTab,
  );

  useEffect(() => {
    const handlePopState = () => {
      const routeState = getVesalaporraRouteState();

      setActivePage(routeState.activePage);
      setNotesTab(routeState.notesTab);
      setRankingTab(routeState.rankingTab);
      setProfileTab(routeState.profileTab);
      setAdminScoringTab(routeState.adminScoringTab);
      setSelectedProfileUserId(
        routeState.selectedProfileUserId,
      );
      setVisibleRankingCount(RANKING_PAGE_SIZE);
    };

    window.addEventListener("popstate", handlePopState);

    return () =>
      window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(
      VESALAPORRA_ACTIVE_PAGE_STORAGE_KEY,
      activePage,
    );

    const currentPath =
      window.location.pathname.replace(/\/+$/, "") || "/";

    const isAuthPath =
      currentPath === "/auth/callback" ||
      currentPath === "/entra-x";

    let shouldScroll = false;

    if (!isAuthPath) {
      const nextPath = getVesalaporraPath({
        activePage,
        notesTab,
        rankingTab,
        profileTab,
        adminScoringTab,
        selectedProfileUserId,
      });

      shouldScroll =
        !routeHistoryReadyRef.current ||
        currentPath !== nextPath;

      if (currentPath !== nextPath) {
        const historyMethod = routeHistoryReadyRef.current
          ? "pushState"
          : "replaceState";

        window.history[historyMethod](
          { vesalaporra: true },
          document.title,
          nextPath,
        );
      }
    }

    routeHistoryReadyRef.current = true;

    if (shouldScroll) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  }, [
    activePage,
    notesTab,
    rankingTab,
    profileTab,
    adminScoringTab,
    selectedProfileUserId,
  ]);

  const [publicMatchPlayers, setPublicMatchPlayers] = useState([]);

  const [adminPlayerCatalog, setAdminPlayerCatalog] = useState([]);

  const [adminPlayerCatalogLoading, setAdminPlayerCatalogLoading] =
    useState(false);

  const [adminPlayerForm, setAdminPlayerForm] = useState(
    EMPTY_ADMIN_PLAYER_FORM,
  );

  const [adminPlayerCreating, setAdminPlayerCreating] = useState(false);

  const [adminPlayerBusyId, setAdminPlayerBusyId] = useState(null);

  const [adminSelectedUploadPlayerId, setAdminSelectedUploadPlayerId] =
    useState(null);

  const [adminBadgeReviewQueue, setAdminBadgeReviewQueue] = useState([]);

  const [adminPreviewUrlsByJobId, setAdminPreviewUrlsByJobId] = useState({});

  const [adminPlayerFeedback, setAdminPlayerFeedback] = useState(null);

  const [adminUpcomingMatches, setAdminUpcomingMatches] = useState([]);

  const [adminMatchesLoading, setAdminMatchesLoading] = useState(false);

  const [adminMatchSaving, setAdminMatchSaving] = useState(false);

  const [adminDeletingMatchId, setAdminDeletingMatchId] =
    useState(null);

  const [adminMatchForm, setAdminMatchForm] = useState(
    EMPTY_ADMIN_MATCH_FORM,
  );

  const [adminMatchFeedback, setAdminMatchFeedback] = useState(null);

  const adminPlayerFileInputRef = useRef(null);

  const officialMatchStatsByPlayerId = officialMatchState.statsByPlayerId || {};
  const officialHomeScore = officialMatchState.homeScore;
  const officialAwayScore = officialMatchState.awayScore;

  const authUser = authSession?.user ?? null;

  const isAdmin =
    backendIsAdmin ||
    Boolean(
      authUser && VESALAPORRA_ADMIN_USER_IDS.includes(String(authUser.id)),
    );

    const activeAdminMatchId = matchData.id || VESALAPORRA_CURRENT_MATCH_ID || null;

  const isWaitingForOpening = Boolean(
    matchData.id && matchData.isUpcomingPreview,
  );

  const displayedCountdown = isWaitingForOpening
    ? openingCountdown
    : countdown;

  const barcaIsHome = isBarcelonaTeam(
    matchData.homeTeamId,
    matchData.homeName,
  );

  const homePredictionScore = barcaIsHome ? barcaScore : rivalScore;
  const awayPredictionScore = barcaIsHome ? rivalScore : barcaScore;

  const hasOfficialResult = Boolean(matchData.hasOfficialResult);

  const displayedHomeScore = hasOfficialResult
    ? matchData.officialHomeScore
    : homePredictionScore;

  const displayedAwayScore = hasOfficialResult
    ? matchData.officialAwayScore
    : awayPredictionScore;

  const changeHomePredictionScore = (updater) => {
    if (barcaIsHome) {
      setBarcaScore(updater);
      return;
    }

    setRivalScore(updater);
  };

  const changeAwayPredictionScore = (updater) => {
    if (barcaIsHome) {
      setRivalScore(updater);
      return;
    }

    setBarcaScore(updater);
  };

  const formatPredictionScore = (barcelonaGoals, opponentGoals) =>
    barcaIsHome
      ? `${barcelonaGoals}-${opponentGoals}`
      : `${opponentGoals}-${barcelonaGoals}`;

  const publicMatchPlayersWithAdminConfig = publicMatchPlayers.map(
    (publicPlayer) => {
      const adminPlayer = adminPlayerCatalog.find(
        (catalogPlayer) => catalogPlayer.playerId === publicPlayer.id,
      );

      return {
        ...publicPlayer,
        protagonistGroupKey: normalizeProtagonistGroupKey(
          publicPlayer.protagonistGroupKey ||
            adminPlayer?.protagonistGroupKey ||
            "e",
        ),
      };
    },
  );

  const gamePlayers = [...publicMatchPlayersWithAdminConfig]
    .filter(
      (player, index, allPlayers) =>
        player.id &&
        allPlayers.findIndex((candidate) => candidate.id === player.id) === index,
    )
    .sort(
      (firstPlayer, secondPlayer) =>
        firstPlayer.rosterOrder - secondPlayer.rosterOrder,
    );

  const lineupPlayers = gamePlayers.filter(
    (player) => player.eligibleForLineup !== false,
  );

  const gamePlayersById = Object.fromEntries(
    gamePlayers.map((player) => [player.id, player]),
  );

  const getPlayerProtagonistScoring = (player) =>
    getDefaultDynamicProtagonistScoring(player);

  const authMetadata = authUser?.user_metadata ?? {};

  const authProvider = String(
    authUser?.app_metadata?.provider ||
      authUser?.app_metadata?.providers?.[0] ||
      "vesalaporra",
  ).toLowerCase();

  const authIsX = authProvider === "x" || authProvider === "twitter";

  const providerDisplayName = getSafePublicDisplayName(
    [
      authMetadata.full_name,
      authMetadata.name,
      authMetadata.user_name,
      authMetadata.preferred_username,
    ],
    authUser?.email,
  );

  const providerAvatarUrl =
    authMetadata.avatar_url ||
    authMetadata.picture ||
    authMetadata.profile_image_url ||
    authMetadata.profile_image_url_https ||
    null;

  const providerHandleSlug = String(
    authMetadata.preferred_username ||
      authMetadata.user_name ||
      authMetadata.username ||
      authMetadata.screen_name ||
      "",
  )
    .replace(/^@/, "")
    .trim();

  const providerTwitterUrl =
    authIsX && providerHandleSlug
      ? `https://x.com/${providerHandleSlug}`
      : null;

  const profileDisplayName = getSafePublicDisplayName(
    [authProfile?.displayName, providerDisplayName],
    authUser?.email,
  );

  const profileAvatarUrl = authProfile?.avatarUrl || providerAvatarUrl || null;

  const profileJoinedYear =
    authProfile?.joinedYear ||
    (authUser?.created_at ? new Date(authUser.created_at).getFullYear() : 2026);

  const lineupCount = lineup.filter(Boolean).length;
  const lineupIsComplete = lineupCount === 11;

  const protagonist = protagonistId ? gamePlayersById[protagonistId] : null;

  const protagonistScoring = protagonist
    ? getPlayerProtagonistScoring(protagonist)
    : null;

  const protagonistPreview = protagonistPreviewId
    ? gamePlayersById[protagonistPreviewId]
    : null;

  const protagonistPreviewScoring = protagonistPreview
    ? getPlayerProtagonistScoring(protagonistPreview)
    : null;

  const protagonistIsComplete = Boolean(protagonist && protagonistScoring);

  const resultIsConfirmed = predictionConfirmed;

  const lineupIsConfirmed =
    confirmedPrediction?.lineup?.filter(Boolean).length === 11;

  const protagonistIsConfirmed = Boolean(
    confirmedPrediction?.protagonistId,
  );

  const predictionScoreIsLocked =
    resultIsConfirmed || countdown.isClosed || hasOfficialResult;

  const lineupEditingIsLocked =
    lineupIsConfirmed || countdown.isClosed || hasOfficialResult;

  const protagonistEditingIsLocked =
    protagonistIsConfirmed || countdown.isClosed || hasOfficialResult;

  const predictionIsComplete =
    resultIsConfirmed && lineupIsConfirmed && protagonistIsConfirmed;

  const hasNewSectionToSubmit =
    (!lineupIsConfirmed && lineupIsComplete) ||
    (!protagonistIsConfirmed && protagonistIsComplete);

  const confirmButtonLabel = predictionIsComplete
    ? "PRONÒSTIC CONFIRMAT"
    : matchLoading || predictionLoading
      ? "CARREGANT PORRA..."
      : predictionSubmitting
        ? "CONFIRMANT..."
        : countdown.isClosed
          ? "PORRA TANCADA"
          : !authLoading && !authUser
            ? "ENTRA PER CONFIRMAR"
            : resultIsConfirmed
              ? "COMPLETA EL PRONÒSTIC"
              : "CONFIRMA ELS TEUS PRONÒSTICS";

  const authenticatedProfileUser = authUser &&
    !isVesalaporraTechnicalAccount({
      id: authUser.id,
      displayName: profileDisplayName,
      handleSlug: providerHandleSlug,
    })
    ? {
        id: String(authUser.id),
        authUserId: String(authUser.id),
        twitterId: String(authUser.id),
        displayName: profileDisplayName,
        handle:
          authIsX && providerHandleSlug ? `@${providerHandleSlug}` : "",
        handleSlug: authIsX ? providerHandleSlug : "",
        twitterAvatarUrl: profileAvatarUrl,
        twitterUrl: providerTwitterUrl,
        hasXIdentity: authIsX && Boolean(providerHandleSlug),
        identityProvider: authProvider || "vesalaporra",
        identityLabel: authIsX ? "X" : "VESALAPORRA",
        joinedYear: profileJoinedYear,
        createdAt: authUser.created_at || null,
        isCurrentUser: true,
        position: 0,
        general: {
          resultPoints: 0,
          xiPoints: 0,
          protagonistPoints: 0,
          totalPoints: 0,
        },
        jornada: {
          resultPoints: 0,
          xiPoints: 0,
          protagonistPoints: 0,
          totalPoints: 0,
        },
        achievementIds: [],
      }
    : null;

  const publicRankingUsers = rankingUsers.filter(
    (user) => !isVesalaporraTechnicalAccount(user),
  );

  const rankingUsersWithAuth = publicRankingUsers;

  const getRankingScopePosition = (user, scope) => {
    const rawPosition =
      scope === "general"
        ? user?.generalPosition
        : user?.jornadaPosition;

    const numericPosition = Number(rawPosition);

    return Number.isFinite(numericPosition) &&
      numericPosition > 0
      ? numericPosition
      : Number.MAX_SAFE_INTEGER;
  };

  const generalRankingHasOfficialPoints = rankingUsersWithAuth.some(
    (user) => Number(user?.general?.totalPoints || 0) !== 0,
  );

  const generalRankingHasPreseasonFinalOrder = rankingUsersWithAuth.some(
    (user) =>
      Number.isFinite(Number(user?.preseasonFinalPosition)) &&
      Number(user.preseasonFinalPosition) > 0,
  );

  const compareRankingUsers = (firstUser, secondUser, scope) => {
    if (scope === "general" && !generalRankingHasOfficialPoints) {
      if (generalRankingHasPreseasonFinalOrder) {
        const firstPreseasonPosition = Number(
          firstUser?.preseasonFinalPosition,
        );
        const secondPreseasonPosition = Number(
          secondUser?.preseasonFinalPosition,
        );
        const firstWasInPreseason =
          Number.isFinite(firstPreseasonPosition) &&
          firstPreseasonPosition > 0;
        const secondWasInPreseason =
          Number.isFinite(secondPreseasonPosition) &&
          secondPreseasonPosition > 0;

        if (firstWasInPreseason !== secondWasInPreseason) {
          return firstWasInPreseason ? -1 : 1;
        }

        if (firstWasInPreseason && secondWasInPreseason) {
          return (
            firstPreseasonPosition - secondPreseasonPosition ||
            String(firstUser.id).localeCompare(String(secondUser.id))
          );
        }

        const firstSignupAt = getRankingSignupTimestamp(firstUser);
        const secondSignupAt = getRankingSignupTimestamp(secondUser);

        return (
          (firstSignupAt ?? Number.MAX_SAFE_INTEGER) -
            (secondSignupAt ?? Number.MAX_SAFE_INTEGER) ||
          String(firstUser.id).localeCompare(String(secondUser.id))
        );
      }

      const firstSignupAt = getRankingSignupTimestamp(firstUser);
      const secondSignupAt = getRankingSignupTimestamp(secondUser);
      const firstIsNew =
        firstSignupAt !== null &&
        firstSignupAt > PRESEASON_2026_ENDED_AT;
      const secondIsNew =
        secondSignupAt !== null &&
        secondSignupAt > PRESEASON_2026_ENDED_AT;

      if (firstIsNew !== secondIsNew) {
        return firstIsNew ? 1 : -1;
      }

      if (firstIsNew && secondIsNew) {
        return (
          firstSignupAt - secondSignupAt ||
          String(firstUser.id).localeCompare(String(secondUser.id))
        );
      }
    }

    return (
      getRankingScopePosition(firstUser, scope) -
        getRankingScopePosition(secondUser, scope) ||
      firstUser.displayName.localeCompare(
        secondUser.displayName,
        "ca",
      )
    );
  };

  const rankingRows = [...rankingUsersWithAuth].sort(
    (firstUser, secondUser) =>
      compareRankingUsers(firstUser, secondUser, rankingTab),
  );
  const visibleRankingRows = rankingRows.slice(0, visibleRankingCount);
  const rankingHasMore = visibleRankingCount < rankingRows.length;
  const currentRankingPosition =
    rankingRows.findIndex((user) => user.isCurrentUser) + 1;
  const currentRankingUser =
    rankingRows.find((user) => user.isCurrentUser) || null;

  const selectedProfileUser =
    rankingUsersWithAuth.find((user) => user.id === selectedProfileUserId) ||
    (authenticatedProfileUser?.id === selectedProfileUserId
      ? authenticatedProfileUser
      : null) ||
    currentRankingUser ||
    null;

    const generalRankingRows = [...rankingUsersWithAuth].sort(
    (firstUser, secondUser) =>
      compareRankingUsers(firstUser, secondUser, "general"),
  );

  const jornadaRankingRows = [...rankingUsersWithAuth].sort(
    (firstUser, secondUser) =>
      compareRankingUsers(firstUser, secondUser, "jornada"),
  );

  const selectedProfilePosition = selectedProfileUser
    ? generalRankingRows.findIndex(
        (user) => user.id === selectedProfileUser.id,
      ) + 1
    : 0;

  const selectedProfileJornadaPosition = selectedProfileUser
    ? jornadaRankingRows.findIndex(
        (user) => user.id === selectedProfileUser.id,
      ) + 1
    : 0;

  const selectedProfileData = buildRealProfileData(
    profileHistory,
    profileAchievements,
  );

  const isOwnAuthenticatedProfile = Boolean(
    authUser && selectedProfileUser?.id === String(authUser.id),
  );

  const selectedPrivateLeague =
    privateLeagues.find(
      (league) => league.id === selectedPrivateLeagueId,
    ) || null;

  const privateLeagueRankingUsers = privateLeagueMembers.map((member) => {
    const rankingUser = rankingUsersWithAuth.find(
      (user) => user.id === member.userId,
    );

    if (rankingUser) {
      return {
        ...rankingUser,
        privateLeagueRole: member.role,
      };
    }

    return {
      id: member.userId,
      authUserId: member.userId,
      displayName: member.displayName,
      handle: member.xHandle ? `@${member.xHandle}` : "",
      handleSlug: member.xHandle,
      twitterAvatarUrl: member.avatarUrl,
      twitterUrl: member.xHandle
        ? `https://x.com/${member.xHandle}`
        : null,
      hasXIdentity: Boolean(member.xHandle),
      isCurrentUser: Boolean(
        authUser?.id &&
          String(authUser.id) === member.userId,
      ),
      generalPosition: null,
      jornadaPosition: null,
      generalPreviousPosition: null,
      generalMovement: null,
      general: {
        resultPoints: 0,
        xiPoints: 0,
        protagonistPoints: 0,
        totalPoints: 0,
      },
      jornada: {
        resultPoints: 0,
        xiPoints: 0,
        protagonistPoints: 0,
        totalPoints: 0,
      },
      achievementIds: [],
      privateLeagueRole: member.role,
    };
  });

  const selectedPrivateLeagueGeneralRankingRows = [
    ...privateLeagueRankingUsers,
  ].sort((firstUser, secondUser) =>
    compareRankingUsers(firstUser, secondUser, "general"),
  );

  const selectedPrivateLeagueRankingRows = [
    ...privateLeagueRankingUsers,
  ].sort((firstUser, secondUser) =>
    compareRankingUsers(
      firstUser,
      secondUser,
      privateLeagueRankingTab,
    ),
  );

  const getPrivateLeaguePosition = (leagueId) => {
    if (leagueId !== selectedPrivateLeagueId) {
      return null;
    }

    const position =
      selectedPrivateLeagueGeneralRankingRows.findIndex(
        (user) => user.isCurrentUser,
      ) + 1;

    return position > 0 ? position : null;
  };

    const notesMatchLiveRows = notesRows
    .filter(
  (row) =>
    row?.player &&
    row.player.eligibleForRatings !== false,
)
    .map((row) => ({
      ...row,
      ownStars: notesRatingsByPlayerId[row.player.id] ?? row.ownStars,
      displayStars:
        notesRatingsByPlayerId[row.player.id] ?? row.displayStars,
    }));

  const notesMatchOrderByPlayerId = new Map(
    notesMatchOrder.playerIds.map((playerId, index) => [playerId, index]),
  );

  const notesMatchRows = [...notesMatchLiveRows].sort(
    (firstRow, secondRow) => {
      const firstPosition = notesMatchOrderByPlayerId.has(firstRow.player.id)
        ? notesMatchOrderByPlayerId.get(firstRow.player.id)
        : Number.MAX_SAFE_INTEGER;
      const secondPosition = notesMatchOrderByPlayerId.has(secondRow.player.id)
        ? notesMatchOrderByPlayerId.get(secondRow.player.id)
        : Number.MAX_SAFE_INTEGER;

      return (
        firstPosition - secondPosition ||
        compareMatchNotesRows(firstRow, secondRow)
      );
    },
  );

  const notesSeasonRows = [...seasonNotesRows]
  .filter(
    (row) =>
      row?.player &&
      row.player.eligibleForRatings !== false,
  )
    .sort(
      (firstRow, secondRow) =>
        secondRow.average - firstRow.average ||
        secondRow.voteCount - firstRow.voteCount ||
        String(firstRow?.player?.name || "").localeCompare(
  String(secondRow?.player?.name || ""),
  "ca",
),
    );

  const visibleNotesRows =
    notesTab === "match" ? notesMatchRows : notesSeasonRows;

  const notesRatingsStatus = firstNonEmptyText(
    notesMatchData?.ratingsStatus,
  ).toLowerCase();

  const notesAreClosed =
    notesSubmissionClosed ||
    notesRatingsStatus === "closed" ||
    Boolean(
      notesMatchData?.ratingsCloseAt &&
        Date.now() >= new Date(notesMatchData.ratingsCloseAt).getTime(),
    );

  const notesAreScheduled = notesRatingsStatus === "scheduled";

  const notesJornadaNumber = toFiniteNumber(
    notesMatchData?.seasonMatchNo,
  );

  const notesJornadaLabel = notesJornadaNumber > 0
    ? `Jornada ${notesJornadaNumber}`
    : "jornada";

  const getRankingAchievements = (user) =>
    ACHIEVEMENT_CATALOG.filter((achievement) =>
      (user?.achievementIds || []).includes(achievement.id),
    ).map((achievement) => ({ ...achievement, unlocked: true }));

  const adminStarterCount = Object.values(officialMatchStatsByPlayerId).filter(
    (stats) => stats.role === "T",
  ).length;

  const adminSubstituteCount = Object.values(
    officialMatchStatsByPlayerId,
  ).filter((stats) => stats.role === "S").length;

  const adminGoalCount = Object.values(officialMatchStatsByPlayerId).reduce(
    (total, stats) => total + stats.goals,
    0,
  );

  const adminAssistCount = Object.values(officialMatchStatsByPlayerId).reduce(
    (total, stats) => total + stats.assists,
    0,
  );

  const loadMoreRanking = () => {
    setVisibleRankingCount((currentCount) =>
      Math.min(currentCount + RANKING_PAGE_SIZE, rankingRows.length),
    );
  };

  const changeRankingTab = (nextTab) => {
    setRankingTab(nextTab);
    setVisibleRankingCount(RANKING_PAGE_SIZE);
  };

  const openRankingProfile = (userId) => {
    setSelectedProfileUserId(userId);
    setProfileTab("overview");
    setActivePage("profile");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleInfoSection = (sectionId) => {
    setOpenInfoSection((currentSectionId) =>
      currentSectionId === sectionId ? null : sectionId,
    );
  };

  const handleRatePlayer = async (playerId, stars) => {
    if (notesAreClosed) {
      setNotesSubmissionClosed(true);
      setNotesError("");
      return;
    }

    if (notesAreScheduled) {
      setNotesError("");
      return;
    }

    if (!authUser) {
      await handleXSignIn();
      return;
    }

    if (!notesMatchData?.id || ratingSavingPlayerId) {
      return;
    }

    setRatingSavingPlayerId(playerId);
    setNotesError("");

    try {
      await callSubmitRatingWithPayloadFallbacks([
        {
          p_match_id: notesMatchData.id,
          p_player_id: playerId,
          p_stars: stars,
          p_audit_id: `VLP_UI_RATE_PLAYER_20260715_${crypto.randomUUID()}`,
        },
        {
          p_match_id: notesMatchData.id,
          p_player_id: playerId,
          p_rating_stars: stars,
        },
        {
          p_match_id: notesMatchData.id,
          p_player_id: playerId,
          p_rating_value: getRatingValueFromStars(stars),
        },
      ]);

      setNotesRatingsByPlayerId((currentRatings) => ({
        ...currentRatings,
        [playerId]: stars,
      }));

      await loadRealNotes({ quiet: true });
    } catch (error) {
      if (isRatingsClosedError(error)) {
        setNotesSubmissionClosed(true);
        setNotesError("");
      } else {
        setNotesError(
          error?.message || "No s’ha pogut guardar la valoració.",
        );
      }
    } finally {
      setRatingSavingPlayerId(null);
    }
  };

  const setOfficialMatchStatsByPlayerId = (statsUpdater) => {
    setOfficialMatchState((currentState) => {
      const nextStatsByPlayerId =
        typeof statsUpdater === "function"
          ? statsUpdater(currentState.statsByPlayerId)
          : statsUpdater;

      return {
        ...currentState,
        statsByPlayerId: nextStatsByPlayerId,
        publishedAt: null,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateOfficialMatchScore = (team, nextScore) => {
    const safeScore = Math.max(0, Number(nextScore || 0));

    setOfficialMatchState((currentState) => ({
      ...currentState,
      [team === "home" ? "homeScore" : "awayScore"]: safeScore,
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    }));
  };

  const validateOfficialMatch = () => {
    if (!activeAdminMatchId) {
      return "No hi ha cap partit real seleccionat.";
    }

    const starterCount = Object.values(
      officialMatchState.statsByPlayerId,
    ).filter((stats) => stats.role === "T").length;

    if (starterCount !== 11) {
      return `Cal marcar exactament 11 titulars. Ara n’hi ha ${starterCount}.`;
    }

    const barcaGoals = Object.values(
      officialMatchState.statsByPlayerId,
    ).reduce((total, stats) => total + Number(stats.goals || 0), 0);

    const officialBarcaScore = barcaIsHome
      ? officialMatchState.homeScore
      : officialMatchState.awayScore;

    if (barcaGoals !== officialBarcaScore) {
      return `Els gols assignats als jugadors (${barcaGoals}) han de coincidir amb els gols del Barça (${officialBarcaScore}).`;
    }

    const invalidEventPlayer = gamePlayers.find((player) => {
      const stats = officialMatchState.statsByPlayerId[player.id];

      return (
        stats &&
        !stats.role &&
        (Number(stats.goals || 0) > 0 || Number(stats.assists || 0) > 0)
      );
    });

    if (invalidEventPlayer) {
      return `${invalidEventPlayer.name} té gol o assistència però no té participació marcada.`;
    }

    return null;
  };

  const handleSaveOfficialMatch = async () => {
    if (officialMatchSaving) {
      return;
    }

    const validationError = validateOfficialMatch();

    if (validationError) {
      setOfficialMatchFeedback({
        type: "error",
        message: validationError,
      });
      return;
    }

    const playerStats = Object.entries(
      officialMatchState.statsByPlayerId,
    ).map(([playerId, stats]) => ({
      player_id: playerId,
      role: stats.role,
      is_starter: stats.role === "T",
      is_substitute: stats.role === "S",
      goals: Number(stats.goals || 0),
      assists: Number(stats.assists || 0),
    }));

    const starterIds = playerStats
      .filter((stats) => stats.is_starter)
      .map((stats) => stats.player_id);
    const substituteIds = playerStats
      .filter((stats) => stats.is_substitute)
      .map((stats) => stats.player_id);
    const auditId = `VLP_UI_FINALIZE_MATCH_20260715_${crypto.randomUUID()}`;

    setOfficialMatchSaving(true);
    setOfficialMatchFeedback(null);

    try {
      const result = await callRpcWithPayloadFallbacks(
        VESALAPORRA_ADMIN_FINALIZE_MATCH_RPC,
        [
          {
            p_match_id: activeAdminMatchId,
            p_home_score: officialMatchState.homeScore,
            p_away_score: officialMatchState.awayScore,
            p_player_stats: playerStats,
            p_audit_id: auditId,
          },
          {
            p_match_id: activeAdminMatchId,
            p_home_goals: officialMatchState.homeScore,
            p_away_goals: officialMatchState.awayScore,
            p_official_starter_player_ids: starterIds,
            p_official_substitute_player_ids: substituteIds,
            p_player_events: playerStats,
            p_audit_id: auditId,
          },
          {
            p_match_id: activeAdminMatchId,
            p_barcelona_goals: barcaIsHome
              ? officialMatchState.homeScore
              : officialMatchState.awayScore,
            p_opponent_goals: barcaIsHome
              ? officialMatchState.awayScore
              : officialMatchState.homeScore,
            p_official_lineup_player_ids: starterIds,
            p_player_stats: playerStats,
            p_audit_id: auditId,
          },
        ],
      );

      setOfficialMatchState((currentState) => ({
        ...currentState,
        version: toFiniteNumber(result?.version, currentState.version + 1),
        publishedAt:
          result?.published_at || result?.finalized_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setOfficialMatchFeedback({
        type: "success",
        message:
          "Partit publicat al backend. Les Notes, el Rànquing i el Perfil ja llegeixen la mateixa realitat oficial.",
      });

      await Promise.all([
        loadRealNotes({ quiet: true }),
        loadRealRanking({ quiet: true }),
        refreshPublicCurrentMatch({ quiet: true }),
      ]);
    } catch (error) {
      setOfficialMatchFeedback({
        type: "error",
        message:
          error?.message ||
          "No s'ha pogut publicar el partit oficial.",
      });
    } finally {
      setOfficialMatchSaving(false);
    }
  };

  const applyAdminToolToPlayer = (playerId, toolId) => {
    if (!isAdmin || !gamePlayersById[playerId]) {
      return;
    }

    setOfficialMatchStatsByPlayerId((currentStatsByPlayerId) => {
      const currentStats = currentStatsByPlayerId[playerId] || {
        role: null,
        goals: 0,
        assists: 0,
      };

      const nextStats = { ...currentStats };

      if (toolId === "starter") {
        nextStats.role = currentStats.role === "T" ? null : "T";
      }

      if (toolId === "substitute") {
        nextStats.role = currentStats.role === "S" ? null : "S";
      }

      if (toolId === "goal") {
        nextStats.goals += 1;
      }

      if (toolId === "assist") {
        nextStats.assists += 1;
      }

      return {
        ...currentStatsByPlayerId,
        [playerId]: nextStats,
      };
    });
  };

  const decrementAdminPlayerStat = (playerId, statKey) => {
    if (!isAdmin || !["goals", "assists"].includes(statKey)) {
      return;
    }

    setOfficialMatchStatsByPlayerId((currentStatsByPlayerId) => ({
      ...currentStatsByPlayerId,
      [playerId]: {
        ...currentStatsByPlayerId[playerId],
        [statKey]: Math.max(
          0,
          Number(currentStatsByPlayerId[playerId]?.[statKey] || 0) - 1,
        ),
      },
    }));
  };

   const loadPublicMatchPlayers = async (
    matchId = matchData.id,
  ) => {
    if (!matchId) {
      setPublicMatchPlayers([]);
      return;
    }

    const { data, error } = await supabase.rpc(
      "vesalaporra_public_match_players",
      {
        p_match_id: matchId,
      },
    );

    if (error) {
      console.warn("No s’ha pogut carregar la plantilla pública:", error);
      setPublicMatchPlayers([]);
      return;
    }

    const normalizedRows = (Array.isArray(data) ? data : [])
      .map(normalizePublicMatchPlayer)
      .filter((player) => player.id && player.name && player.image)
      .sort(
        (firstPlayer, secondPlayer) =>
          firstPlayer.rosterOrder - secondPlayer.rosterOrder,
      );

    setPublicMatchPlayers(normalizedRows);
  };

      const refreshPublicCurrentMatch = async ({ quiet = false } = {}) => {
    if (!quiet) {
      setMatchLoading(true);
    }

    try {
      const { data: currentData, error: currentError } =
        await supabase.rpc(
          VESALAPORRA_PUBLIC_CURRENT_MATCH_RPC,
        );

      if (currentError) {
        throw currentError;
      }

      const currentMatchRow = Array.isArray(currentData)
        ? currentData[0]
        : currentData;

      let displayedMatchRow = currentMatchRow;
      let officialHandoffAt = null;
      let isHoldingScoredMatch = false;

      try {
        const { data: latestScoredData, error: latestScoredError } =
          await supabase.rpc(
            VESALAPORRA_PUBLIC_LATEST_SCORED_MATCH_RPC,
          );

        if (latestScoredError) {
          throw latestScoredError;
        }

        const latestScoredMatchId = Array.isArray(latestScoredData)
          ? firstNonEmptyText(
              latestScoredData[0]?.match_id,
              latestScoredData[0]?.id,
              latestScoredData[0],
            )
          : firstNonEmptyText(
              latestScoredData?.match_id,
              latestScoredData?.id,
              latestScoredData,
            );

        if (latestScoredMatchId) {
          const [
            { data: scoredMatchCardData, error: scoredMatchCardError },
            ratingsStatePayload,
          ] = await Promise.all([
            supabase.rpc(
              VESALAPORRA_PUBLIC_SCORED_MATCH_CARD_RPC,
              {
                p_match_id: latestScoredMatchId,
              },
            ),
            callRpcWithPayloadFallbacks(
              VESALAPORRA_PUBLIC_MATCH_RATINGS_STATE_RPC,
              [
                { p_match_id: latestScoredMatchId },
                { match_id: latestScoredMatchId },
              ],
            ),
          ]);

          if (scoredMatchCardError) {
            throw scoredMatchCardError;
          }

          const scoredMatchRow =
            unwrapRpcRows(
              scoredMatchCardData,
              ["match", "card", "rows"],
            )[0] || null;

          const ratingsStateRow =
            unwrapRpcRows(
              ratingsStatePayload,
              ["state", "match", "rows"],
            )[0] || {};

          const scoredMatchId = firstNonEmptyText(
            scoredMatchRow?.match_id,
            latestScoredMatchId,
          );

          const ratingsStatus = firstNonEmptyText(
            ratingsStateRow?.ratings_status,
            scoredMatchRow?.ratings_status,
          ).toLowerCase();

          const ratingsCloseAt = firstNonEmptyText(
            ratingsStateRow?.ratings_close_at,
            scoredMatchRow?.ratings_close_at,
          );

          const ratingsCloseTimestamp = ratingsCloseAt
            ? new Date(ratingsCloseAt).getTime()
            : Number.NaN;

          const ratingsAreClosed =
            ratingsStatus === "closed" ||
            (Number.isFinite(ratingsCloseTimestamp) &&
              Date.now() >= ratingsCloseTimestamp);

          if (scoredMatchId && !ratingsAreClosed) {
            displayedMatchRow = {
              ...scoredMatchRow,
              ...ratingsStateRow,
              match_id: scoredMatchId,
              ratings_close_at: ratingsCloseAt || null,
              ratings_status: ratingsStatus || null,
            };

            officialHandoffAt = ratingsCloseAt || null;
            isHoldingScoredMatch = true;
          }
        }
      } catch (handoffError) {
        console.warn(
          "No s’ha pogut comprovar el relleu oficial segons Les Notes:",
          handoffError,
        );
      }

      let isUpcomingPreview = Boolean(
        !isHoldingScoredMatch &&
          displayedMatchRow?.match_id &&
          !displayedMatchRow?.predictions_are_open &&
          displayedMatchRow?.predictions_open_at &&
          new Date(displayedMatchRow.predictions_open_at).getTime() >
            Date.now(),
      );

      if (!displayedMatchRow?.match_id) {
        const { data: nextData, error: nextError } =
          await supabase.rpc(
            VESALAPORRA_PUBLIC_NEXT_MATCH_RPC,
          );

        if (nextError) {
          throw nextError;
        }

        displayedMatchRow = Array.isArray(nextData)
          ? nextData[0]
          : nextData;

        isUpcomingPreview = Boolean(
          displayedMatchRow?.match_id &&
            !displayedMatchRow?.predictions_are_open,
        );
      }

      if (!displayedMatchRow?.match_id) {
        throw new Error("No hi ha cap proper partit programat.");
      }

      const baseMatch = normalizeCurrentMatch(displayedMatchRow);
      const pointsMultipliers = await loadMatchPointsMultipliers(
        baseMatch.id,
      );

      const normalizedMatch = {
        ...baseMatch,
        predictionsAreOpen: isUpcomingPreview
          ? false
          : baseMatch.predictionsAreOpen,
        predictionsCloseAt: isUpcomingPreview
          ? null
          : baseMatch.predictionsCloseAt,
        isUpcomingPreview,
        officialHandoffAt,
        pointsMultiplier: normalizePointsMultiplier(
          pointsMultipliers[baseMatch.id],
        ),
      };

      setMatchData(normalizedMatch);
      setCountdown(
        getCountdown(normalizedMatch.predictionsCloseAt),
      );

      return normalizedMatch;
    } finally {
      if (!quiet) {
        setMatchLoading(false);
      }
    }
  };

  const loadAdminUpcomingMatches = async ({ quiet = false } = {}) => {
    if (!isAdmin) {
      return;
    }

    if (!quiet) {
      setAdminMatchesLoading(true);
    }

    try {
      const { data, error } = await supabase.rpc(
        VESALAPORRA_ADMIN_MATCH_LIST_RPC,
        {
          p_limit: 100,
        },
      );

      if (error) {
        throw error;
      }

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.matches)
          ? data.matches
          : [];

      const baseMatches = rows
        .map(normalizeAdminMatch)
        .filter((match) => match.matchId && match.kickoffAt)
        .sort(
          (firstMatch, secondMatch) =>
            new Date(firstMatch.kickoffAt).getTime() -
            new Date(secondMatch.kickoffAt).getTime(),
        );

      const pointsMultipliers = await loadMatchPointsMultipliers(
        baseMatches.map((match) => match.matchId),
      );

      const normalizedMatches = baseMatches.map((match) => ({
        ...match,
        pointsMultiplier: normalizePointsMultiplier(
          pointsMultipliers[match.matchId],
        ),
      }));

      setAdminUpcomingMatches(normalizedMatches);
    } catch (error) {
      setAdminMatchFeedback({
        type: "error",
        message:
          error?.message || "No s’han pogut carregar els propers partits.",
      });
    } finally {
      if (!quiet) {
        setAdminMatchesLoading(false);
      }
    }
  };

  const resetAdminMatchForm = () => {
    setAdminMatchForm(EMPTY_ADMIN_MATCH_FORM);
    setAdminMatchFeedback(null);
  };

  const editAdminMatch = (match) => {
    setAdminMatchForm(adminMatchToForm(match));
    setAdminMatchFeedback(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

 const updateAdminMatchForm = (field, value) => {
  setAdminMatchForm((currentForm) => ({
    ...currentForm,
    [field]: value,
  }));
};

const updateAdminMatchPattern = (pattern) => {
  setAdminMatchForm((currentForm) => ({
    ...currentForm,
    rivalPattern: pattern === "striped" ? "striped" : "solid",
  }));
};

const toggleAdminMatchColor = (colorValue) => {
  const normalizedColor = normalizeHexColor(colorValue);

  if (!normalizedColor) {
    return;
  }

  setAdminMatchForm((currentForm) => {
    const currentColors = normalizeTeamBadgeColors(
      currentForm.rivalColors,
    ).slice(0, 2);
    const selectedIndex = currentColors.indexOf(normalizedColor);

    if (selectedIndex >= 0) {
      if (currentColors.length === 1) {
        return currentForm;
      }

      return {
        ...currentForm,
        rivalColors: currentColors.filter(
          (selectedColor) => selectedColor !== normalizedColor,
        ),
      };
    }

    return {
      ...currentForm,
      rivalColors:
        currentColors.length < 2
          ? [...currentColors, normalizedColor]
          : [currentColors[0], normalizedColor],
    };
  });
};

const validateAdminMatchForm = () => {
  if (
    !ADMIN_MATCH_SEASON_OPTIONS.some(
      (seasonOption) => seasonOption.value === adminMatchForm.seasonKey,
    )
  ) {
    return "Tria PRETEMPORADA 2026 o TEMPORADA 26/27.";
  }

  if (adminMatchForm.rivalName.trim().length < 2) {
    return "Escriu el nom complet del rival.";
  }

  if (!parseAdminMatchDateText(adminMatchForm.kickoffText)) {
    return "Escriu la data així: 31/7/26 i 20:45.";
  }

  if (adminMatchForm.rivalColors.length < 1) {
    return "Tria almenys un color del rival.";
  }

  if (adminMatchForm.rivalColors.length > 2) {
    return "Només pots triar un o dos colors.";
  }

  if (
    adminMatchForm.rivalPattern === "striped" &&
    adminMatchForm.rivalColors.length !== 2
  ) {
    return "Si tries franges, has de marcar exactament dos colors.";
  }

  return null;
};

  const handleSaveAdminMatch = async (event) => {
    event.preventDefault();

    if (!isAdmin || adminMatchSaving) {
      return;
    }

    const validationError = validateAdminMatchForm();

    if (validationError) {
      setAdminMatchFeedback({
        type: "error",
        message: validationError,
      });
      return;
    }

    const parsedKickoff = parseAdminMatchDateText(
      adminMatchForm.kickoffText,
    );
    const kickoffAt = parsedKickoff?.iso || null;
    const rivalColors = normalizeTeamBadgeColors(
      adminMatchForm.rivalColors,
    ).slice(0, 2);
    const rivalKey =
      slugifyTeamKey(adminMatchForm.rivalKey) ||
      slugifyTeamKey(adminMatchForm.rivalName);
    const savedPointsMultiplier = normalizePointsMultiplier(
      adminMatchForm.pointsMultiplier,
    );

    setAdminMatchSaving(true);
    setAdminMatchFeedback({
      type: "working",
      message: adminMatchForm.matchId
        ? "Guardant els canvis del partit..."
        : "Creant el proper partit...",
    });

    try {
       const { data, error } = await supabase.rpc(
        VESALAPORRA_ADMIN_MATCH_UPSERT_RPC,
        {
          p_match_id: adminMatchForm.matchId || null,
          p_scheduled_kickoff_at: kickoffAt,
          p_barca_side: adminMatchForm.barcaSide,
          p_rival_team_key: rivalKey,
          p_rival_display_name: adminMatchForm.rivalName.trim(),
          p_rival_country: adminMatchForm.rivalCountry.trim() || null,
          p_competition_name:
            adminMatchForm.competitionName.trim() || null,
          p_venue_name: adminMatchForm.venueName.trim() || null,
          p_rival_primary_color: rivalColors[0] || null,
          p_rival_secondary_color: rivalColors[1] || null,
          p_make_current: Boolean(adminMatchForm.makeCurrent),
          p_rival_badge_pattern: normalizeTeamBadgePattern(
            adminMatchForm.rivalPattern,
            rivalColors,
          ),
          p_season_key: adminMatchForm.seasonKey,
          p_audit_id: createAdminAuditId(
            adminMatchForm.matchId ? "UPDATE_MATCH" : "CREATE_MATCH",
          ),
        },
      );

      if (error) {
        throw error;
      }

      const savedMatchId = getPayloadValue(data, [
        "match_id",
        "saved_match_id",
        "id",
      ]);

      const scoringMatchId = savedMatchId || adminMatchForm.matchId;

      if (!scoringMatchId) {
        throw new Error(
          "El partit s’ha guardat, però no s’ha pogut identificar per aplicar-hi els punts.",
        );
      }

      const { error: multiplierError } = await supabase.rpc(
        VESALAPORRA_ADMIN_SET_MATCH_POINTS_MULTIPLIER_RPC,
        {
          p_match_id: scoringMatchId,
          p_points_multiplier: savedPointsMultiplier,
          p_audit_id: createAdminAuditId(
            savedPointsMultiplier === 2
              ? "SET_MATCH_POINTS_X2"
              : "SET_MATCH_POINTS_NORMAL",
          ),
        },
      );

      if (multiplierError) {
        throw multiplierError;
      }

      await loadAdminUpcomingMatches({ quiet: true });

      const refreshedMatch = await refreshPublicCurrentMatch({ quiet: true });

      if (refreshedMatch?.id) {
        await loadPublicMatchPlayers(refreshedMatch.id);
      }

      setAdminMatchForm({
        ...EMPTY_ADMIN_MATCH_FORM,
        seasonKey: adminMatchForm.seasonKey,
      });
      setAdminMatchFeedback({
        type: "success",
        message:
          savedPointsMultiplier === 2
            ? "Partit guardat com a PARTIT DOBLE. Tots els punts comptaran x2."
            : savedMatchId
              ? "Partit guardat i portada actualitzada amb la nova font real."
              : "Partit guardat. La portada ja ha rellegit el partit públic real.",
      });
    } catch (error) {
      setAdminMatchFeedback({
        type: "error",
        message:
          error?.message || "No s’ha pogut guardar el proper partit.",
      });
    } finally {
      setAdminMatchSaving(false);
    }
  };

  const handleDeleteUnusedMatch = async (match) => {
    if (
      !isAdmin ||
      adminMatchSaving ||
      adminDeletingMatchId ||
      !match?.matchId
    ) {
      return;
    }

    const expectedName = String(
      match.rivalDisplayName || "",
    ).trim();

    if (!expectedName) {
      setAdminMatchFeedback({
        type: "error",
        message:
          "Aquest partit no té un nom de rival vàlid i no es pot confirmar l’eliminació.",
      });
      return;
    }

    const confirmation = window.prompt(
      [
        "Aquesta acció eliminarà definitivament el partit",
        `Barça vs ${expectedName}.`,
        "",
        "Només funcionarà si no té pronòstics, resultat, puntuacions ni valoracions.",
        "",
        `Escriu exactament: ${expectedName}`,
      ].join("\n"),
    );

    if (confirmation === null) {
      return;
    }

    if (confirmation.trim() !== expectedName) {
      setAdminMatchFeedback({
        type: "error",
        message:
          "El nom escrit no coincideix. El partit no s’ha eliminat.",
      });
      return;
    }

    setAdminDeletingMatchId(match.matchId);
    setAdminMatchFeedback({
      type: "working",
      message: `Eliminant definitivament el partit contra ${expectedName}...`,
    });

    try {
      const { data, error } = await supabase.rpc(
        "vesalaporra_admin_delete_unused_match",
        {
          p_match_id: match.matchId,
          p_audit_id: createAdminAuditId(
            "DELETE_UNUSED_MATCH",
          ),
        },
      );

      if (error) {
        throw error;
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (adminMatchForm.matchId === match.matchId) {
        setAdminMatchForm(EMPTY_ADMIN_MATCH_FORM);
      }

      await loadAdminUpcomingMatches({
        quiet: true,
      });

      try {
        const refreshedMatch =
          await refreshPublicCurrentMatch({
            quiet: true,
          });

        if (refreshedMatch?.id) {
          await loadPublicMatchPlayers(
            refreshedMatch.id,
          );
        }
      } catch (refreshError) {
        console.warn(
          "No queda cap partit públic disponible després de l’eliminació:",
          refreshError,
        );

        setMatchData(EMPTY_MATCH_DATA);
        setPublicMatchPlayers([]);
      }

      setAdminMatchFeedback({
        type: "success",
        message:
          result?.removed_match_player_rows > 0
            ? `Partit contra ${expectedName} eliminat. També s’han retirat ${result.removed_match_player_rows} assignacions de plantilla.`
            : `Partit contra ${expectedName} eliminat definitivament.`,
      });
    } catch (error) {
      setAdminMatchFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut eliminar el partit.",
      });
    } finally {
      setAdminDeletingMatchId(null);
    }
  };

  const loadAdminPlayerWorkspace = async ({ quiet = false } = {}) => {
    if (!isAdmin) {
      return;
    }

    if (!quiet) {
      setAdminPlayerCatalogLoading(true);
    }

    try {
      const [catalogResponse, reviewResponse] = await Promise.all([
        supabase.rpc("vesalaporra_admin_list_player_catalog", {
          p_match_id: activeAdminMatchId,
        }),
        supabase.rpc("vesalaporra_admin_list_badge_review_queue", {
          p_limit: 50,
        }),
      ]);

      if (catalogResponse.error) {
        throw catalogResponse.error;
      }

      if (reviewResponse.error) {
        throw reviewResponse.error;
      }

      const normalizedCatalog = (
        Array.isArray(catalogResponse.data) ? catalogResponse.data : []
      )
        .map(normalizeAdminPlayer)
        .sort((firstPlayer, secondPlayer) => {
          if (firstPlayer.catalogStatus !== secondPlayer.catalogStatus) {
            return firstPlayer.catalogStatus === "active" ? -1 : 1;
          }

          return firstPlayer.displayName.localeCompare(
            secondPlayer.displayName,
            "ca",
          );
        });

      const reviewRows = Array.isArray(reviewResponse.data)
        ? reviewResponse.data
        : [];

      const signedPreviewEntries = await Promise.all(
        reviewRows.map(async (job) => {
          if (!job.preview_bucket || !job.preview_path) {
            return [job.job_id, null];
          }

          const { data: signedData, error: signedError } = await supabase.storage
            .from(job.preview_bucket)
            .createSignedUrl(job.preview_path, 60 * 15);

          if (signedError) {
            console.warn(
              `No s’ha pogut signar la preview ${job.job_id}:`,
              signedError,
            );
          }

          return [job.job_id, signedData?.signedUrl || null];
        }),
      );

      setAdminPlayerCatalog(normalizedCatalog);
      setAdminBadgeReviewQueue(reviewRows);
      setAdminPreviewUrlsByJobId(Object.fromEntries(signedPreviewEntries));
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          error?.message || "No s’ha pogut carregar el catàleg de jugadors.",
      });
    } finally {
      if (!quiet) {
        setAdminPlayerCatalogLoading(false);
      }
    }
  };

  const handleCreateAdminPlayer = async (event) => {
    event.preventDefault();

    if (!isAdmin || adminPlayerCreating) {
      return;
    }

    const displayName = adminPlayerForm.displayName.trim();

    if (displayName.length < 2) {
      setAdminPlayerFeedback({
        type: "error",
        message: "Escriu el nom complet del jugador.",
      });
      return;
    }

    setAdminPlayerCreating(true);
    setAdminPlayerFeedback(null);

    try {
      const { data, error } = await supabase.rpc(
        "vesalaporra_admin_create_player",
        {
          p_audit_id: createAdminAuditId("CREATE_PLAYER"),
          p_display_name: displayName,
          p_short_name: null,
          p_shirt_number: null,
          p_player_key: null,
        },
      );

      if (error) {
        throw error;
      }

      const createdPlayerId = getPayloadValue(data, [
        "player_id",
        "created_player_id",
        "id",
      ]);

      setAdminPlayerForm(EMPTY_ADMIN_PLAYER_FORM);
      setAdminPlayerFeedback({
        type: "success",
        message: createdPlayerId
          ? `Jugador creat correctament · ${createdPlayerId}`
          : "Jugador creat correctament.",
      });

      await loadAdminPlayerWorkspace({ quiet: true });
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message: error?.message || "No s’ha pogut crear el jugador.",
      });
    } finally {
      setAdminPlayerCreating(false);
    }
  };

  const openAdminPlayerUpload = (playerId) => {
    if (!isAdmin || adminPlayerBusyId) {
      return;
    }

    setAdminSelectedUploadPlayerId(playerId);
    adminPlayerFileInputRef.current?.click();
  };

  const handleAdminPlayerSourceFile = async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    const playerId = adminSelectedUploadPlayerId;
    setAdminSelectedUploadPlayerId(null);

    if (!file || !playerId || !isAdmin || adminPlayerBusyId) {
      return;
    }

    if (!PLAYER_SOURCE_ALLOWED_TYPES.has(file.type)) {
      setAdminPlayerFeedback({
        type: "error",
        message: "La xapa ha de ser PNG, JPG o WEBP.",
      });
      return;
    }

    if (file.size > PLAYER_SOURCE_MAX_BYTES) {
      setAdminPlayerFeedback({
        type: "error",
        message: "La xapa no pot superar els 5 MB.",
      });
      return;
    }

    setAdminPlayerBusyId(playerId);
    setAdminPlayerFeedback({
      type: "working",
      message: "Pujant la imatge i preparant la previsualització...",
    });

    let uploadId = null;

    try {
      const prepareResponse = await supabase.rpc(
        "vesalaporra_admin_prepare_player_source_upload",
        {
          p_player_id: playerId,
          p_mime_type: file.type,
          p_original_filename: file.name,
          p_audit_id: createAdminAuditId("PREPARE_PLAYER_UPLOAD"),
        },
      );

      if (prepareResponse.error) {
        throw prepareResponse.error;
      }

      uploadId = getPayloadValue(prepareResponse.data, [
        "upload_id",
        "source_upload_id",
        "id",
      ]);

      const sourceBucket = getPayloadValue(prepareResponse.data, [
        "source_bucket",
        "upload_bucket",
        "bucket",
        "bucket_id",
      ]);

         const sourcePath = getPayloadValue(prepareResponse.data, [
        "storage_path",
        "source_path",
        "upload_path",
        "object_path",
        "path",
      ]);

      if (!uploadId || !sourceBucket || !sourcePath) {
        throw new Error(
          "La preparació de la pujada no ha retornat upload_id, bucket i storage_path.",
        );
      }

      const { error: storageError } = await supabase.storage
        .from(String(sourceBucket))
        .upload(String(sourcePath), file, {
          contentType: file.type,
          cacheControl: "0",
          upsert: false,
        });

      if (storageError) {
        throw storageError;
      }

      const finalizeResponse = await supabase.rpc(
        "vesalaporra_admin_finalize_source_upload",
        {
          p_upload_id: uploadId,
          p_processing_mode: "ready_portrait_import",
          p_audit_id: createAdminAuditId("FINALIZE_PLAYER_UPLOAD"),
        },
      );

      if (finalizeResponse.error) {
        throw finalizeResponse.error;
      }

      const jobId = getPayloadValue(finalizeResponse.data, [
        "job_id",
        "badge_job_id",
        "current_badge_job_id",
      ]);

      if (!jobId) {
        throw new Error("La pujada s’ha completat, però no ha retornat job_id.");
      }

      const workerResponse = await supabase.functions.invoke(
        "vesalaporra-badge-worker",
        {
          body: {
            action: "process",
            job_id: jobId,
          },
        },
      );

      if (workerResponse.error) {
        throw workerResponse.error;
      }

      if (workerResponse.data?.status !== "BADGE_PREVIEW_READY") {
        throw new Error(
          workerResponse.data?.error ||
            `Resposta inesperada del worker: ${
              workerResponse.data?.status || "sense estat"
            }`,
        );
      }

      setAdminPlayerFeedback({
        type: "success",
        message:
          "Previsualització preparada. Revisa-la i aprova-la abans de publicar.",
      });

      await loadAdminPlayerWorkspace({ quiet: true });
    } catch (error) {
      if (uploadId) {
        const cancelResponse = await supabase.rpc(
          "vesalaporra_admin_cancel_source_upload",
          {
            p_upload_id: uploadId,
            p_audit_id: createAdminAuditId("CANCEL_PLAYER_UPLOAD"),
          },
        );

        if (cancelResponse.error) {
          console.warn(
            "No s’ha pogut cancel·lar la pujada fallida:",
            cancelResponse.error,
          );
        }
      }

      setAdminPlayerFeedback({
        type: "error",
        message:
          error?.message || "No s’ha pogut processar la imatge del jugador.",
      });
    } finally {
      setAdminPlayerBusyId(null);
    }
  };

  const handleAdminBadgeDecision = async (job, decision) => {
    if (!isAdmin || adminPlayerBusyId) {
      return;
    }

    const isApproval = decision === "approve";
    setAdminPlayerBusyId(job.player_id);
    setAdminPlayerFeedback({
      type: "working",
      message: isApproval
        ? "Aprovant i publicant la xapa..."
        : "Rebutjant la previsualització...",
    });

    try {
      const reviewResponse = await supabase.rpc(
        "vesalaporra_admin_review_badge_job",
        {
          p_job_id: job.job_id,
          p_decision: decision,
          p_review_note: isApproval
            ? "Aprovada des de PUNTUACIONS."
            : "Rebutjada des de PUNTUACIONS.",
          p_audit_id: createAdminAuditId(
            isApproval ? "APPROVE_BADGE_JOB" : "REJECT_BADGE_JOB",
          ),
        },
      );

      if (reviewResponse.error) {
        throw reviewResponse.error;
      }

      if (isApproval) {
        const publishResponse = await supabase.functions.invoke(
          "vesalaporra-badge-worker",
          {
            body: {
              action: "publish",
              job_id: job.job_id,
            },
          },
        );

        if (publishResponse.error) {
          throw publishResponse.error;
        }

        if (publishResponse.data?.status !== "BADGE_PUBLISHED") {
          throw new Error(
            publishResponse.data?.error ||
              `Resposta inesperada publicant: ${
                publishResponse.data?.status || "sense estat"
              }`,
          );
        }
      }

      setAdminPlayerFeedback({
        type: "success",
        message: isApproval
          ? "Xapa aprovada i publicada correctament."
          : "Previsualització rebutjada. Pots pujar una imatge nova.",
      });

      await Promise.all([
        loadAdminPlayerWorkspace({ quiet: true }),
        loadPublicMatchPlayers(),
      ]);
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          error?.message || "No s’ha pogut completar la revisió de la xapa.",
      });
    } finally {
      setAdminPlayerBusyId(null);
    }
  };

const saveAdminMatchPlayer = async (player, patch) => {
  if (!isAdmin || adminPlayerBusyId) {
    return;
  }

  setAdminPlayerBusyId(player.playerId);
  setAdminPlayerFeedback(null);

  const nextRosterOrder =
    Number(player.rosterOrder) ||
    Math.max(
      0,
      ...adminPlayerCatalog.map((catalogPlayer) =>
        Number(catalogPlayer.rosterOrder || 0),
      ),
    ) + 1;

  const visibilityWasChanged = Object.prototype.hasOwnProperty.call(
    patch,
    "isPublicVisible",
  );

  const protagonistGroupWasChanged = Object.prototype.hasOwnProperty.call(
    patch,
    "protagonistGroupKey",
  );

  const nextVisibility = visibilityWasChanged
    ? Boolean(patch.isPublicVisible)
    : Boolean(player.isPublicVisible);

  const nextProtagonistGroupKey = normalizeProtagonistGroupKey(
    patch.protagonistGroupKey || player.protagonistGroupKey || "e",
  );

  const nextProtagonistGroup =
    PROTAGONIST_GROUP_BY_KEY[nextProtagonistGroupKey];

  const isGoalkeeperGroup =
    nextProtagonistGroup?.excludesProtagonist === true;

  const nextEligibleForProtagonist = isGoalkeeperGroup
    ? false
    : visibilityWasChanged || protagonistGroupWasChanged
      ? nextVisibility
      : patch.eligibleForProtagonist ??
        Boolean(player.eligibleForProtagonist);

  const baseAdminNote = patch.adminNote ?? player.adminNote ?? "";

  const nextValues = {
    availabilityStatus:
      patch.availabilityStatus ?? player.availabilityStatus ?? "available",

    isPublicVisible: nextVisibility,

    eligibleForLineup: visibilityWasChanged
      ? nextVisibility
      : patch.eligibleForLineup ?? Boolean(player.eligibleForLineup),

    eligibleForProtagonist: nextEligibleForProtagonist,

    eligibleForRatings: visibilityWasChanged
      ? nextVisibility
      : patch.eligibleForRatings ?? Boolean(player.eligibleForRatings),

    protagonistGroupKey: nextProtagonistGroupKey,

    adminNote: setProtagonistGroupInAdminNote(
      baseAdminNote,
      nextProtagonistGroupKey,
    ),
  };

  if (nextValues.isPublicVisible && !player.portraitPath) {
    setAdminPlayerFeedback({
      type: "error",
      message:
        "Abans de fer-lo visible has de pujar i aprovar la seva xapa.",
    });
    setAdminPlayerBusyId(null);
    return;
  }

  try {
    const { error } = await supabase.rpc(
      "vesalaporra_admin_upsert_match_player",
      {
        p_match_id: activeAdminMatchId,
        p_player_id: player.playerId,
        p_roster_order: nextRosterOrder,
        p_availability_status: nextValues.availabilityStatus,
        p_is_public_visible: nextValues.isPublicVisible,
        p_eligible_for_lineup: nextValues.eligibleForLineup,
        p_eligible_for_protagonist: nextValues.eligibleForProtagonist,
        p_eligible_for_ratings: nextValues.eligibleForRatings,
        p_admin_note: nextValues.adminNote || null,
        p_audit_id: createAdminAuditId("UPSERT_MATCH_PLAYER"),
      },
    );

    if (error) {
      throw error;
    }

    setAdminPlayerFeedback({
      type: "success",
      message: isGoalkeeperGroup
        ? "Porter guardat. Serà visible a l’XI i Les Notes, però no com a protagonista."
        : "Configuració del jugador guardada.",
    });

    await Promise.all([
      loadAdminPlayerWorkspace({ quiet: true }),
      loadPublicMatchPlayers(),
    ]);
  } catch (error) {
    setAdminPlayerFeedback({
      type: "error",
      message:
        error?.message || "No s’ha pogut guardar el jugador del partit.",
    });
  } finally {
    setAdminPlayerBusyId(null);
  }
};

  const removeAdminMatchPlayer = async (player) => {
    if (!isAdmin || adminPlayerBusyId || !player.assignedToMatch) {
      return;
    }

    setAdminPlayerBusyId(player.playerId);
    setAdminPlayerFeedback(null);

    try {
      const { error } = await supabase.rpc(
        "vesalaporra_admin_remove_match_player",
        {
          p_match_id: activeAdminMatchId,
          p_player_id: player.playerId,
          p_audit_id: createAdminAuditId("REMOVE_MATCH_PLAYER"),
        },
      );

      if (error) {
        throw error;
      }

      setAdminPlayerFeedback({
        type: "success",
        message: "Jugador retirat d’aquest partit. El seu historial es conserva.",
      });

      await Promise.all([
        loadAdminPlayerWorkspace({ quiet: true }),
        loadPublicMatchPlayers(),
      ]);
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message: error?.message || "No s’ha pogut retirar el jugador.",
      });
    } finally {
      setAdminPlayerBusyId(null);
    }
  };

    const toggleAdminPlayerArchive = async (player) => {
    if (!isAdmin || adminPlayerBusyId) {
      return;
    }

    const nextStatus =
      player.catalogStatus === "archived"
        ? "active"
        : "archived";

    setAdminPlayerBusyId(player.playerId);
    setAdminPlayerFeedback(null);

    try {
      const { error } = await supabase.rpc(
        "vesalaporra_admin_update_player",
        {
          p_player_id: player.playerId,
          p_patch: {
            catalog_status: nextStatus,
          },
          p_audit_id: createAdminAuditId(
            "UPDATE_PLAYER_STATUS",
          ),
        },
      );

      if (error) {
        throw error;
      }

      setAdminPlayerFeedback({
        type: "success",
        message:
          nextStatus === "archived"
            ? "Jugador arxivat. No s’ha esborrat cap historial."
            : "Jugador reactivat al catàleg.",
      });

      await loadAdminPlayerWorkspace({
        quiet: true,
      });
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut actualitzar el jugador.",
      });
    } finally {
      setAdminPlayerBusyId(null);
    }
  };

  const handleDeleteUnusedPlayer = async (player) => {
    if (
      !isAdmin ||
      adminPlayerBusyId ||
      !player?.playerId
    ) {
      return;
    }

    if (player.catalogStatus !== "archived") {
      setAdminPlayerFeedback({
        type: "error",
        message:
          "Primer has d’arxivar el jugador. Els jugadors actius no es poden eliminar.",
      });
      return;
    }

    const expectedName = String(
      player.displayName || "",
    ).trim();

    if (!expectedName) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          "Aquest jugador no té un nom vàlid per confirmar l’eliminació.",
      });
      return;
    }

    const confirmation = window.prompt(
      [
        "Aquesta acció eliminarà definitivament el jugador",
        `${expectedName}.`,
        "",
        "Només funcionarà si no té historial esportiu real.",
        "També s’intentaran eliminar les seves imatges i processos de xapa.",
        "",
        `Escriu exactament: ${expectedName}`,
      ].join("\n"),
    );

    if (confirmation === null) {
      return;
    }

    if (confirmation.trim() !== expectedName) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          "El nom escrit no coincideix. El jugador no s’ha eliminat.",
      });
      return;
    }

    setAdminPlayerBusyId(player.playerId);
    setAdminPlayerFeedback({
      type: "working",
      message: `Eliminant definitivament ${expectedName}...`,
    });

    try {
      const { data, error } = await supabase.rpc(
        "vesalaporra_admin_delete_unused_player",
        {
          p_player_id: player.playerId,
          p_audit_id: createAdminAuditId(
            "DELETE_UNUSED_PLAYER",
          ),
        },
      );

      if (error) {
        throw error;
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      const storageObjects = Array.isArray(
        result?.storage_objects_to_remove,
      )
        ? result.storage_objects_to_remove
        : [];

      const storagePathsByBucket =
        storageObjects.reduce(
          (pathsByBucket, storageObject) => {
            const bucket = String(
              storageObject?.bucket || "",
            ).trim();

            const path = String(
              storageObject?.path || "",
            ).trim();

            if (!bucket || !path) {
              return pathsByBucket;
            }

            if (!pathsByBucket.has(bucket)) {
              pathsByBucket.set(
                bucket,
                new Set(),
              );
            }

            pathsByBucket.get(bucket).add(path);

            return pathsByBucket;
          },
          new Map(),
        );

      let storageCleanupFailedBuckets = 0;

      for (const [
        bucket,
        pathSet,
      ] of storagePathsByBucket.entries()) {
        const paths = [...pathSet];

        const { error: storageError } =
          await supabase.storage
            .from(bucket)
            .remove(paths);

        if (storageError) {
          storageCleanupFailedBuckets += 1;

          console.warn(
            `El jugador s’ha eliminat, però no s’han pogut retirar els fitxers del bucket ${bucket}:`,
            storageError,
          );
        }
      }

      await Promise.all([
        loadAdminPlayerWorkspace({
          quiet: true,
        }),
        loadPublicMatchPlayers(),
      ]);

      setAdminPlayerFeedback({
        type:
          storageCleanupFailedBuckets > 0
            ? "error"
            : "success",

        message:
          storageCleanupFailedBuckets > 0
            ? `${expectedName} s’ha eliminat de la base de dades, però ${storageCleanupFailedBuckets} bucket(s) no han permès eliminar els fitxers. El jugador ja no apareixerà al joc.`
            : `${expectedName} i els seus fitxers associats s’han eliminat definitivament.`,
      });
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut eliminar el jugador.",
      });
    } finally {
      setAdminPlayerBusyId(null);
    }
  };

  const handleOAuthSignIn = async (provider, { automatic = false } = {}) => {
    if (authActionLoading) {
      return;
    }

    setAuthError("");
    setAuthActionLoading(true);

    if (provider === "x" && automatic) {
      window.sessionStorage.setItem(
        X_AUTO_LOGIN_STORAGE_KEY,
        String(Date.now()),
      );
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (provider === "x") {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);
      }

      const providerLabel =
        provider === "x"
          ? "X"
          : provider === "custom:disqus"
            ? "Disqus"
            : "Google";

      setAuthError(
        error?.message ||
          `No s’ha pogut obrir ${providerLabel}. Torna-ho a provar.`,
      );
      setAuthActionLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleOAuthSignIn("google");

  const handleXSignIn = () => handleOAuthSignIn("x");

  const handleDisqusSignIn = () =>
    handleOAuthSignIn("custom:disqus");

  const persistProfile = async ({ displayName, avatarUrl, avatarPath }) => {
    if (!authUser) {
      throw new Error("Has d’entrar abans d’editar el perfil.");
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        display_name: displayName,
        avatar_url: avatarUrl || null,
        avatar_path: avatarPath || null,
        provider: authProvider || "vesalaporra",
        x_handle: authIsX && providerHandleSlug ? providerHandleSlug : null,
      },
      {
        onConflict: "id",
      },
    );

    if (error) {
      throw error;
    }
  };

   const handleSaveProfileName = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!authUser || profileActionLoading) {
      return;
    }

    const nextDisplayName = profileDraftName.trim();

    const privateEmail = String(authUser.email || "")
      .trim()
      .toLowerCase();
    const privateEmailLocalPart = privateEmail.split("@")[0] || "";
    const normalizedNextDisplayName = nextDisplayName.toLowerCase();

    if (
      nextDisplayName.includes("@") ||
      normalizedNextDisplayName === privateEmail ||
      normalizedNextDisplayName === privateEmailLocalPart
    ) {
      setProfileFeedback({
        type: "error",
        message:
          "El nom públic no pot ser una adreça de correu ni el seu identificador privat.",
      });
      return;
    }

    if (
      nextDisplayName.length < PROFILE_NAME_MIN_LENGTH ||
      nextDisplayName.length > PROFILE_NAME_MAX_LENGTH
    ) {
      setProfileFeedback({
        type: "error",
        message: `El nom ha de tenir entre ${PROFILE_NAME_MIN_LENGTH} i ${PROFILE_NAME_MAX_LENGTH} caràcters.`,
      });
      return;
    }

    setProfileActionLoading(true);
    setProfileFeedback(null);

    window.sessionStorage.setItem(
      VESALAPORRA_ACTIVE_PAGE_STORAGE_KEY,
      "profile",
    );

    try {
      await persistProfile({
        displayName: nextDisplayName,
        avatarUrl: profileAvatarUrl,
        avatarPath: authProfile?.avatarPath || null,
      });

      setAuthProfile((currentProfile) => ({
        ...(currentProfile || {}),
        displayName: nextDisplayName,
        avatarUrl: profileAvatarUrl,
      }));

      setRankingUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === String(authUser.id)
            ? {
                ...user,
                displayName: nextDisplayName,
              }
            : user,
        ),
      );

      setProfileDraftName(nextDisplayName);
      setSelectedProfileUserId(String(authUser.id));
      setActivePage("profile");
      setProfileNameEditorOpen(false);

      setProfileFeedback({
        type: "success",
        message: "Nom actualitzat correctament.",
      });
    } catch (error) {
      setProfileFeedback({
        type: "error",
        message: error?.message || "No s’ha pogut guardar el nom.",
      });
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleProfileAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !authUser || profileActionLoading) {
      return;
    }

    const allowedExtensions = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };

    const extension = allowedExtensions[file.type];

    if (!extension) {
      setProfileFeedback({
        type: "error",
        message: "L’avatar ha de ser PNG, JPG o WEBP.",
      });
      return;
    }

    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      setProfileFeedback({
        type: "error",
        message: "L’avatar no pot superar els 2 MB.",
      });
      return;
    }

    setProfileActionLoading(true);
    setProfileFeedback(null);

    let uploadedPath = null;

    try {
      uploadedPath = `${authUser.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .upload(uploadedPath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .getPublicUrl(uploadedPath);

      const nextAvatarUrl = publicUrlData?.publicUrl
        ? `${publicUrlData.publicUrl}?v=${Date.now()}`
        : null;

      if (!nextAvatarUrl) {
        throw new Error("No s’ha pogut obtenir la URL de l’avatar.");
      }

      await persistProfile({
        displayName: profileDisplayName,
        avatarUrl: nextAvatarUrl,
        avatarPath: uploadedPath,
      });

      const { data, error } = await supabase.auth.updateUser({
        data: {
          avatar_url: nextAvatarUrl,
        },
      });

      if (error) {
        console.warn(
          "No s’ha pogut sincronitzar l’avatar amb auth metadata:",
          error,
        );
      }

      if (data?.user) {
        setAuthSession((currentSession) =>
          currentSession
            ? {
                ...currentSession,
                user: data.user,
              }
            : currentSession,
        );
      }

      const previousAvatarPath = authProfile?.avatarPath;

      setAuthProfile((currentProfile) => ({
        ...(currentProfile || {}),
        displayName: currentProfile?.displayName || profileDisplayName,
        avatarUrl: nextAvatarUrl,
        avatarPath: uploadedPath,
      }));

      if (previousAvatarPath && previousAvatarPath !== uploadedPath) {
        await supabase.storage
          .from(PROFILE_AVATAR_BUCKET)
          .remove([previousAvatarPath]);
      }

      setProfileFeedback({
        type: "success",
        message: "Avatar actualitzat correctament.",
      });
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage
          .from(PROFILE_AVATAR_BUCKET)
          .remove([uploadedPath]);
      }

      setProfileFeedback({
        type: "error",
        message: error?.message || "No s’ha pogut guardar l’avatar.",
      });
    } finally {
      setProfileActionLoading(false);
    }
  };

    const handleSignOut = async () => {
    if (authActionLoading) {
      return;
    }

    setAuthError("");
    setAuthActionLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setActivePage("play");
      setSelectedProfileUserId(null);
    } catch (error) {
      setAuthError(error?.message || "No s’ha pogut tancar la sessió.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const rememberPredictionCelebrationOrigin = (buttonElement) => {
    const buttonBounds = buttonElement?.getBoundingClientRect();

    if (!buttonBounds) {
      return;
    }

    setPredictionCelebrationOrigin({
      left: `${buttonBounds.left + buttonBounds.width / 2}px`,
      top: `${buttonBounds.top + Math.min(8, buttonBounds.height / 2)}px`,
    });
  };

  const handleConfirmResultOnly = (event) => {
    if (
      resultIsConfirmed ||
      predictionLoading ||
      predictionSubmitting ||
      matchLoading ||
      !matchData.id ||
      countdown.isClosed ||
      !scoreTouched ||
      authLoading ||
      authActionLoading
    ) {
      return;
    }

    if (!authUser) {
      handleXSignIn();
      return;
    }

    rememberPredictionCelebrationOrigin(event?.currentTarget);
    setConfirmationMode("result-only");
    setConfirmationDialogOpen(true);
  };

  const handleConfirmPrediction = (event) => {
    if (
      predictionIsComplete ||
      predictionLoading ||
      predictionSubmitting ||
      matchLoading ||
      !matchData.id ||
      countdown.isClosed ||
      !scoreTouched ||
      authLoading ||
      authActionLoading ||
      (resultIsConfirmed && !hasNewSectionToSubmit)
    ) {
      return;
    }

    if (!authUser) {
      handleXSignIn();
      return;
    }

    rememberPredictionCelebrationOrigin(event?.currentTarget);
    setConfirmationMode("prediction");
    setConfirmationDialogOpen(true);
  };

  const handleCancelPredictionConfirmation = () => {
    if (predictionSubmitting) {
      return;
    }

    setConfirmationMode("prediction");
    setConfirmationDialogOpen(false);
  };

  const handleFinalizePrediction = async () => {
    if (
      !authUser ||
      !matchData.id ||
      predictionSubmitting ||
      countdown.isClosed ||
      !scoreTouched ||
      predictionIsComplete ||
      (resultIsConfirmed &&
        !hasNewSectionToSubmit &&
        confirmationMode !== "result-only")
    ) {
      return;
    }

    setPredictionSubmitting(true);
    setAuthError("");

    try {
      const lineupDraftBeforeSubmit = [...lineup];
      const protagonistDraftBeforeSubmit = protagonistId;

      const submittedLineup =
        confirmationMode !== "result-only" && lineupIsComplete
        ? lineup.filter(Boolean)
        : [];

      const submittedProtagonistId =
        confirmationMode !== "result-only"
          ? protagonistId || null
          : null;

      const { data: submitPayload, error: submitError } =
        await supabase.rpc(
          "vesalaporra_submit_prediction",
          {
            p_match_id: matchData.id,
            p_barcelona_goals: barcaScore,
            p_opponent_goals: rivalScore,
            p_lineup_player_ids: submittedLineup,
            p_protagonist_player_id: submittedProtagonistId,
            p_audit_id:
              `VLP_UI_INCREMENTAL_PREDICTION_20260725_061_${crypto.randomUUID()}`,
          },
        );

      if (submitError) {
        throw submitError;
      }

      const submitStatus = submitPayload?.status;

      if (
        submitStatus !== "PREDICTION_CONFIRMED" &&
        submitStatus !== "PREDICTION_COMPLETED" &&
        submitStatus !== "PREDICTION_ALREADY_CONFIRMED"
      ) {
        throw new Error(
          `Resposta inesperada confirmant la porra: ${
            submitStatus || "sense estat"
          }.`,
        );
      }

      const { data: predictionRows, error: readError } =
        await supabase.rpc(
          "vesalaporra_my_prediction",
          {
            p_match_id: matchData.id,
          },
        );

      if (readError) {
        throw readError;
      }

      const savedPrediction = Array.isArray(predictionRows)
        ? predictionRows[0]
        : predictionRows;

      if (!savedPrediction?.prediction_id) {
        throw new Error(
          "La porra s’ha enviat però no s’ha pogut recuperar.",
        );
      }

      const restoredLineup = Array.from(
        { length: 11 },
        (_, index) =>
          savedPrediction.lineup_player_ids?.[index] || null,
      );

      const predictionSnapshot = {
        matchId: String(savedPrediction.match_id),
        confirmedAt: savedPrediction.confirmed_at,
        barcaScore: Number(
          savedPrediction.predicted_barcelona_goals,
        ),
        rivalScore: Number(
          savedPrediction.predicted_opponent_goals,
        ),
        lineup: restoredLineup,
        protagonistId:
          savedPrediction.protagonist_player_id || null,
        submissionMode: confirmationMode,
      };

      setBarcaScore(predictionSnapshot.barcaScore);
      setRivalScore(predictionSnapshot.rivalScore);
      setScoreTouched(true);
      setLineup(
        restoredLineup.filter(Boolean).length === 11
          ? restoredLineup
          : lineupDraftBeforeSubmit,
      );
      setProtagonistId(
        predictionSnapshot.protagonistId ||
          protagonistDraftBeforeSubmit ||
          null,
      );
      setProtagonistSelectionActive(false);
      setProtagonistPreviewId(null);
      protagonistInputTypeRef.current = "mouse";
      protagonistTouchPreviewIdRef.current = null;
      setConfirmedPrediction(predictionSnapshot);
      setPredictionConfirmed(true);
      setConfirmationMode("prediction");
      setConfirmationDialogOpen(false);
      setSelectedSlotIndex(null);
      setSelectedPlayerId(null);
      setConfirmationAnimationActive(false);

      window.requestAnimationFrame(() => {
        setConfirmationAnimationActive(true);
      });

      if (confirmationAnimationTimerRef.current) {
        window.clearTimeout(
          confirmationAnimationTimerRef.current,
        );
      }

      confirmationAnimationTimerRef.current =
        window.setTimeout(() => {
          setConfirmationAnimationActive(false);
          confirmationAnimationTimerRef.current = null;
        }, PREDICTION_CELEBRATION_MS);
    } catch (error) {
      console.warn(
        "No s’ha pogut confirmar el pronòstic real:",
        error,
      );

      setAuthError(
        error?.message ||
          "No s’ha pogut confirmar la porra. Torna-ho a provar.",
      );
    } finally {
      setPredictionSubmitting(false);
    }
  };

const fetchRankingScope = async (scope) => {
  const { data: payload, error } = await supabase.rpc(
    VESALAPORRA_PUBLIC_RANKING_RPC,
    {
      p_scope: scope,
      p_limit: 500,
    },
  );

  if (error) {
    throw error;
  }

  return unwrapRpcRows(payload, ["ranking", "rows", "items", "users"])
    .map((row, index) =>
      normalizeRankingUser(row, scope, authUser?.id, index),
    )
    .filter(Boolean);
};

const fetchRankingProfileCreatedAtMap = async (userIds) => {
  const safeUserIds = [
    ...new Set((userIds || []).map(String).filter(Boolean)),
  ];

  if (safeUserIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, created_at")
    .in("id", safeUserIds);

  if (error) {
    console.warn(
      "No s’han pogut carregar les dates d’alta del rànquing:",
      error,
    );

    return {};
  }

  return Object.fromEntries(
    (data || [])
      .filter((row) => row?.id)
      .map((row) => [String(row.id), row.created_at || null]),
  );
};

const fetchPreseasonFinalPositionMap = async () => {
  const { data: payload, error } = await supabase.rpc(
    VESALAPORRA_PUBLIC_PRESEASON_FINAL_ORDER_RPC,
  );

  if (error) {
    throw error;
  }

  return Object.fromEntries(
    unwrapRpcRows(payload, ["ranking", "rows", "items", "users"])
      .map((row) => {
        const userId = firstNonEmptyText(row?.user_id, row?.id);
        const position = toFiniteNumber(
          row?.preseason_position,
          row?.ranking_position,
          row?.position,
        );

        return userId && position > 0
          ? [String(userId), position]
          : null;
      })
      .filter(Boolean),
  );
};

const fetchLatestScoredJornadaNumber = async () => {
  const { data: payload, error } = await supabase.rpc(
    VESALAPORRA_PUBLIC_LATEST_SCORED_JORNADA_NUMBER_RPC,
  );

  if (error) {
    throw error;
  }

  const rawValue = Array.isArray(payload)
    ? payload[0]?.jornada_number ?? payload[0]
    : payload?.jornada_number ?? payload;

  const jornadaNumber = toFiniteNumber(rawValue);

  return Number.isInteger(jornadaNumber) && jornadaNumber > 0
    ? jornadaNumber
    : null;
};

const loadRealRanking = async ({ quiet = false } = {}) => {
  if (!quiet) {
    setRankingLoading(true);
  }

  setRankingError("");

  try {
    const [
      generalRows,
      jornadaRows,
      jornadaNumber,
      preseasonFinalPositionById,
    ] =
      await Promise.all([
        fetchRankingScope("general"),
        fetchRankingScope("jornada"),
        fetchLatestScoredJornadaNumber().catch((error) => {
          console.warn(
            "No s’ha pogut carregar el número de jornada:",
            error,
          );

          return null;
        }),
        fetchPreseasonFinalPositionMap().catch((error) => {
          console.warn(
            "No s’ha pogut carregar l’ordre final de pretemporada:",
            error,
          );

          return {};
        }),
      ]);

    const mergedRows = mergeRankingScopes(
      generalRows,
      jornadaRows,
    );

    const profileCreatedAtById =
      await fetchRankingProfileCreatedAtMap(
        mergedRows.map((user) => user.id),
      );

    const mergedRowsWithSignupDates = mergedRows.map((user) => ({
      ...user,
      preseasonFinalPosition:
        preseasonFinalPositionById[user.id] || null,
      createdAt:
        profileCreatedAtById[user.id] ||
        user.createdAt ||
        null,
    }));

    setRankingUsers(mergedRowsWithSignupDates);
    setRankingJornadaNumber(jornadaNumber);

    if (!selectedProfileUserId && authUser?.id) {
      setSelectedProfileUserId(String(authUser.id));
    }
  } catch (error) {
    if (quiet) {
      console.warn(
        "No s’ha pogut actualitzar el rànquing en segon pla:",
        error,
      );
    } else {
      setRankingUsers([]);
      setRankingJornadaNumber(null);
      setRankingError(
        error?.message || "No s’ha pogut carregar el rànquing real.",
      );
    }
  } finally {
    if (!quiet) {
      setRankingLoading(false);
    }
  }
};

   const loadRealNotes = async ({
    quiet = false,
    matchId = null,
    refreshOrder = false,
  } = {}) => {
    if (!quiet) {
      setNotesLoading(true);
    }

    setNotesError("");

    try {
      let notesTargetMatchId = matchId;

      if (!notesTargetMatchId) {
        const { data, error } = await supabase.rpc(
          VESALAPORRA_PUBLIC_LATEST_SCORED_MATCH_RPC,
        );

        if (error) {
          throw error;
        }

        notesTargetMatchId = Array.isArray(data)
          ? firstNonEmptyText(
              data[0]?.match_id,
              data[0]?.id,
              data[0],
            )
          : firstNonEmptyText(
              data?.match_id,
              data?.id,
              data,
            );
      }

      if (!notesTargetMatchId) {
        setNotesRows([]);
        setSeasonNotesRows([]);
        setNotesMatchData(null);
        setNotesSubmissionClosed(false);
        setNotesMatchOrder({ matchId: "", playerIds: [] });
        return;
      }
     const [
       matchPayload,
       seasonPayload,
       matchCardPayload,
       ratingsStatePayload,
     ] =
  await Promise.all([
    callRpcWithPayloadFallbacks(
      VESALAPORRA_PUBLIC_MATCH_NOTES_RPC,
      [
        { p_match_id: notesTargetMatchId },
        { match_id: notesTargetMatchId },
      ],
    ),
    callRpcWithPayloadFallbacks(
      VESALAPORRA_PUBLIC_ACTIVE_SEASON_NOTES_RPC,
      [{}],
    ),
    callRpcWithPayloadFallbacks(
      VESALAPORRA_PUBLIC_SCORED_MATCH_CARD_RPC,
      [{ p_match_id: notesTargetMatchId }],
    ),
    callRpcWithPayloadFallbacks(
      VESALAPORRA_PUBLIC_MATCH_RATINGS_STATE_RPC,
      [{ p_match_id: notesTargetMatchId }],
    ).catch((error) => {
      if (isMissingRpcSignatureError(error)) {
        console.warn(
          "L’estat temporal de Les Notes encara no està disponible; es carreguen igualment les valoracions.",
          error,
        );

        return null;
      }

      throw error;
    }),
  ]);

      const rawRows = unwrapRpcRows(
        matchPayload,
        ["notes", "rows", "players"],
      );

      const normalizedRows = rawRows
        .map((row) => normalizeNotesRow(row, gamePlayersById))
        .filter(Boolean);

      const rawSeasonRows = unwrapRpcRows(
        seasonPayload,
        ["notes", "rows", "players"],
      );

      const normalizedSeasonRows = rawSeasonRows
        .map((row) => {
          const playerId = firstNonEmptyText(
            row?.player_id,
            row?.id,
          );

          if (!playerId) {
            return null;
          }

          const rosterPlayer = gamePlayersById[playerId] || null;

          const player = rosterPlayer || {
            id: playerId,
            name: firstNonEmptyText(
              row?.display_name,
              row?.player_name,
              row?.name,
              "Jugador",
            ),
            shortName: firstNonEmptyText(
              row?.short_name,
              row?.display_name,
              row?.player_name,
              "Jugador",
            ),
            image:
              getPublicStorageImageUrl(
                row?.avatar_bucket,
                row?.avatar_path,
                row?.avatar_version,
              ) ||
              firstNonEmptyText(
                row?.avatar_url,
                row?.portrait_url,
              ) ||
              "/fcb/PLAYER_PLACEHOLDER.png",
            eligibleForRatings: true,
          };

          const average = toFiniteNumber(
            row?.rating_average,
            row?.season_average,
            row?.average,
          );

          const voteCount = toFiniteNumber(
            row?.rating_count,
            row?.season_vote_count,
            row?.vote_count,
            row?.ratings_count,
          );

          return {
            player,
            stats: {
              role: null,
              starts: toFiniteNumber(
                row?.starts,
                row?.season_starts,
              ),
              substituteAppearances: toFiniteNumber(
                row?.substitute_appearances,
                row?.season_substitute_appearances,
              ),
              goals: toFiniteNumber(
                row?.goals,
                row?.goals_scored,
              ),
              assists: toFiniteNumber(row?.assists),
            },
            ownStars: 0,
            displayStars:
              voteCount > 0
                ? getStarsFromAverage(average)
                : 0,
            average,
            voteCount,
            seasonAverage: average,
            seasonVoteCount: voteCount,
            matchId: "",
            homeScore: 0,
            awayScore: 0,
            publishedAt: null,
          };
        })
        .filter(Boolean);

      const matchCardRow =
        unwrapRpcRows(
          matchCardPayload,
          ["match", "card", "rows"],
        )[0] || {};

      const ratingsStateRow =
        unwrapRpcRows(
          ratingsStatePayload,
          ["state", "match", "rows"],
        )[0] || {};

      const normalizedNotesMatch = normalizeCurrentMatch({
        ...matchCardRow,
        match_id: firstNonEmptyText(
          matchCardRow?.match_id,
          notesTargetMatchId,
        ),
      });

      const normalizedMatch = {
        ...normalizedNotesMatch,
        id: firstNonEmptyText(
          matchCardRow?.match_id,
          notesTargetMatchId,
        ),
        homeScore: toFiniteNumber(
          matchCardRow?.official_home_goals,
        ),
        awayScore: toFiniteNumber(
          matchCardRow?.official_away_goals,
        ),
        seasonMatchNo: toFiniteNumber(
          ratingsStateRow?.season_match_no,
          matchCardRow?.season_match_no,
          matchCardRow?.jornada_number,
          normalizedNotesMatch?.seasonMatchNo,
        ),
        ratingsOpenAt:
          ratingsStateRow?.ratings_open_at ||
          matchCardRow?.ratings_open_at ||
          normalizedNotesMatch?.ratingsOpenAt ||
          null,
        ratingsCloseAt:
          ratingsStateRow?.ratings_close_at ||
          matchCardRow?.ratings_close_at ||
          normalizedNotesMatch?.ratingsCloseAt ||
          null,
        ratingsAreOpen: readOptionalBoolean(
          ratingsStateRow?.ratings_are_open ??
            matchCardRow?.ratings_are_open ??
            normalizedNotesMatch?.ratingsAreOpen,
        ),
        ratingsStatus: firstNonEmptyText(
          ratingsStateRow?.ratings_status,
          matchCardRow?.ratings_status,
          normalizedNotesMatch?.ratingsStatus,
        ).toLowerCase(),
      };
      setNotesRows(normalizedRows);
      setSeasonNotesRows(normalizedSeasonRows);
      setNotesMatchData(normalizedMatch);
      setNotesSubmissionClosed(
        normalizedMatch.ratingsStatus === "closed",
      );
      setNotesMatchOrder((currentOrder) => {
        const shouldKeepCurrentOrder =
          !refreshOrder &&
          currentOrder.matchId === normalizedMatch.id &&
          currentOrder.playerIds.length > 0;

        if (shouldKeepCurrentOrder) {
          return currentOrder;
        }

        return {
          matchId: normalizedMatch.id,
          playerIds: [...normalizedRows]
            .filter(
  (row) =>
    row?.player &&
    row.player.eligibleForRatings !== false,
)
            .sort(compareMatchNotesRows)
            .map((row) => row.player.id),
        };
      });

      const restoredRatings = Object.fromEntries(
        normalizedRows
          .filter((row) => row.ownStars > 0)
          .map((row) => [
            row.player.id,
            row.ownStars,
          ]),
      );

      setNotesRatingsByPlayerId(restoredRatings);

    } catch (error) {
      if (quiet) {
        console.warn(
          "No s’han pogut actualitzar Les Notes en segon pla:",
          error,
        );
      } else {
        setNotesRows([]);
        setSeasonNotesRows([]);
        setNotesMatchData(matchData);
        setNotesError(
          error?.message ||
            "No s’han pogut carregar Les Notes reals.",
        );
      }
    } finally {
      if (!quiet) {
        setNotesLoading(false);
      }
    }
  };

  const handleRefreshNotesRanking = async () => {
    if (notesLoading || notesRankingRefreshing || ratingSavingPlayerId) {
      return;
    }

    setNotesRankingRefreshing(true);

    try {
      await loadRealNotes({
        quiet: true,
        matchId: notesMatchData?.id || null,
        refreshOrder: true,
      });
    } finally {
      setNotesRankingRefreshing(false);
    }
  };

     const loadRealProfileData = async (
    userId,
    { quiet = false } = {},
  ) => {
    if (!userId) {
      setProfileHistory([]);
      setProfileJornadaWins(0);

      setProfileAchievements(
        ACHIEVEMENT_CATALOG.map((achievement) => ({
          ...achievement,
          unlocked: false,
          progress: "",
        })),
      );

      return;
    }

    if (!quiet) {
      setProfileDataLoading(true);
    }
    setProfileDataError("");

    if (!quiet) {
      setProfileJornadaWins(0);
    }

    try {
      const [
        achievementPayload,
        historyPayload,
        competitiveSummaryPayload,
      ] = await Promise.all([
        callRpcWithPayloadFallbacks(
          VESALAPORRA_PUBLIC_USER_ACHIEVEMENTS_RPC,
          [
            { p_user_id: userId },
            { user_id: userId },
          ],
        ),

        callRpcWithPayloadFallbacks(
          VESALAPORRA_PUBLIC_PROFILE_HISTORY_RPC,
          [
            { p_user_id: userId },
            { user_id: userId },
          ],
        ),

        callRpcWithPayloadFallbacks(
          VESALAPORRA_PUBLIC_PROFILE_COMPETITIVE_SUMMARY_RPC,
          [
            { p_user_id: userId },
            { user_id: userId },
          ],
        ),
      ]);

      const historyRows = unwrapRpcRows(
        historyPayload,
        ["history", "rows", "items"],
      );

      const competitiveSummaryRows = unwrapRpcRows(
        competitiveSummaryPayload,
        ["summary", "rows", "items"],
      );

      const competitiveSummaryRow =
        competitiveSummaryRows[0] || null;

      setProfileAchievements(
        normalizeAchievementRows(achievementPayload),
      );

      setProfileJornadaWins(
        toFiniteNumber(
          competitiveSummaryRow?.jornada_wins,
        ),
      );

      setProfileHistory(
        historyRows
          .map(normalizeScoreHistoryRow)
          .sort((first, second) => {
            const firstTime = new Date(
              first.scoredAt || 0,
            ).getTime();

            const secondTime = new Date(
              second.scoredAt || 0,
            ).getTime();

            return secondTime - firstTime;
          })
          .slice(0, 100),
      );
    } catch (error) {
      if (quiet) {
        console.warn(
          "No s’ha pogut actualitzar el perfil en segon pla:",
          error,
        );
      } else {
        setProfileHistory([]);
        setProfileJornadaWins(0);

        setProfileDataError(
          error?.message ||
            "No s’ha pogut carregar el perfil real.",
        );
      }
    } finally {
      if (!quiet) {
        setProfileDataLoading(false);
      }
    }
  };

  const loadPrivateLeagues = async ({
    quiet = false,
  } = {}) => {
    if (!authUser) {
      setPrivateLeagues([]);
      setSelectedPrivateLeagueId(null);
      setPrivateLeagueMembers([]);
      setPrivateLeaguesError("");
      return;
    }

    if (!quiet) {
      setPrivateLeaguesLoading(true);
    }

    setPrivateLeaguesError("");

    try {
      const { data, error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.list,
      );

      if (error) {
        throw error;
      }

      const leagues = unwrapRpcRows(
        data,
        ["leagues", "rows", "items"],
      )
        .map(normalizePrivateLeague)
        .filter(Boolean)
        .sort((firstLeague, secondLeague) =>
          firstLeague.name.localeCompare(
            secondLeague.name,
            "ca",
          ),
        );

      setPrivateLeagues(leagues);

      setSelectedPrivateLeagueId((currentLeagueId) => {
        if (
          currentLeagueId &&
          leagues.some(
            (league) => league.id === currentLeagueId,
          )
        ) {
          return currentLeagueId;
        }

        return leagues[0]?.id || null;
      });
    } catch (error) {
      if (quiet) {
        console.warn(
          "No s’han pogut actualitzar les lligues privades:",
          error,
        );
      } else {
        setPrivateLeagues([]);
        setSelectedPrivateLeagueId(null);
        setPrivateLeagueMembers([]);
        setPrivateLeaguesError(
          error?.message ||
            "No s’han pogut carregar les teves lligues.",
        );
      }
    } finally {
      if (!quiet) {
        setPrivateLeaguesLoading(false);
      }
    }
  };

  const loadPrivateLeagueMembers = async (
    leagueId,
    { quiet = false } = {},
  ) => {
    if (!authUser || !leagueId) {
      setPrivateLeagueMembers([]);
      return;
    }

    if (!quiet) {
      setPrivateLeagueMembersLoading(true);
    }

    try {
      const { data, error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.members,
        {
          p_league_id: leagueId,
        },
      );

      if (error) {
        throw error;
      }

      const members = unwrapRpcRows(
        data,
        ["members", "rows", "items"],
      )
        .map(normalizePrivateLeagueMember)
        .filter(Boolean);

      setPrivateLeagueMembers(members);
    } catch (error) {
      if (quiet) {
        console.warn(
          "No s’han pogut actualitzar els membres de la lliga:",
          error,
        );
      } else {
        setPrivateLeagueMembers([]);
        setPrivateLeagueFeedback({
          type: "error",
          message:
            error?.message ||
            "No s’ha pogut carregar la classificació de la lliga.",
        });
      }
    } finally {
      if (!quiet) {
        setPrivateLeagueMembersLoading(false);
      }
    }
  };

  const handleCreatePrivateLeague = async (event) => {
    event?.preventDefault();

    if (!authUser || privateLeagueActionLoading) {
      return;
    }

    const leagueName = privateLeagueDraftName
      .replace(/\s+/g, " ")
      .trim();

    if (
      leagueName.length < PRIVATE_LEAGUE_NAME_MIN_LENGTH ||
      leagueName.length > PRIVATE_LEAGUE_NAME_MAX_LENGTH
    ) {
      setPrivateLeagueFeedback({
        type: "error",
        message: `El nom ha de tenir entre ${PRIVATE_LEAGUE_NAME_MIN_LENGTH} i ${PRIVATE_LEAGUE_NAME_MAX_LENGTH} caràcters.`,
      });
      return;
    }

    setPrivateLeagueActionLoading(true);
    setPrivateLeagueFeedback(null);

    try {
      const { data, error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.create,
        {
          p_name: leagueName,
        },
      );

      if (error) {
        throw error;
      }

      const createdLeague =
        unwrapRpcRows(
          data,
          ["league", "rows", "items"],
        )
          .map(normalizePrivateLeague)
          .filter(Boolean)[0] || null;

      setPrivateLeagueDraftName("");
      setPrivateLeagueCreateOpen(false);

      await loadPrivateLeagues({ quiet: true });

      if (createdLeague?.id) {
        setPrivateLeagueRankingTab("general");
        setSelectedPrivateLeagueId(createdLeague.id);
        await loadPrivateLeagueMembers(createdLeague.id);
      }

      setPrivateLeagueFeedback({
        type: "success",
        message: createdLeague?.inviteCode
          ? `Lliga creada. Codi d’invitació: ${createdLeague.inviteCode}`
          : "Lliga creada correctament.",
      });
    } catch (error) {
      setPrivateLeagueFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut crear la lliga.",
      });
    } finally {
      setPrivateLeagueActionLoading(false);
    }
  };

  const handleJoinPrivateLeague = async (event) => {
    event?.preventDefault();

    if (!authUser || privateLeagueActionLoading) {
      return;
    }

    const inviteCode = normalizePrivateLeagueCode(
      privateLeagueJoinCode,
    );

    if (inviteCode.length < 4) {
      setPrivateLeagueFeedback({
        type: "error",
        message: "Escriu un codi d’invitació vàlid.",
      });
      return;
    }

    setPrivateLeagueActionLoading(true);
    setPrivateLeagueFeedback(null);

    try {
      const { data, error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.join,
        {
          p_code: inviteCode,
        },
      );

      if (error) {
        throw error;
      }

      const joinedLeague =
        unwrapRpcRows(
          data,
          ["league", "rows", "items"],
        )
          .map(normalizePrivateLeague)
          .filter(Boolean)[0] || null;

      setPrivateLeagueJoinCode("");
      setPrivateLeagueJoinOpen(false);

      await loadPrivateLeagues({ quiet: true });

      if (joinedLeague?.id) {
        setPrivateLeagueRankingTab("general");
        setSelectedPrivateLeagueId(joinedLeague.id);
        await loadPrivateLeagueMembers(joinedLeague.id);
      }

      if (
        window.location.search.includes("join=")
      ) {
        window.history.replaceState(
          { vesalaporra: true },
          document.title,
          "/perfil/lligues",
        );
      }

      setPrivateLeagueFeedback({
        type: "success",
        message: joinedLeague?.name
          ? `Ja formes part de “${joinedLeague.name}”.`
          : "Has entrat a la lliga.",
      });
    } catch (error) {
      const message = String(
        error?.message || "",
      );

      setPrivateLeagueFeedback({
        type: "error",
        message:
          message.includes("PRIVATE_LEAGUE_INVALID_CODE")
            ? "Aquest codi no existeix o la lliga ja no està activa."
            : message.includes("PRIVATE_LEAGUE_FULL")
              ? "Aquesta lliga ha arribat al límit de participants."
              : message ||
                "No s’ha pogut entrar a la lliga.",
      });
    } finally {
      setPrivateLeagueActionLoading(false);
    }
  };

  const handleOpenPrivateLeague = async (leagueId) => {
    if (!leagueId) {
      return;
    }

    setSelectedPrivateLeagueId(leagueId);
    setPrivateLeagueRankingTab("general");
    setPrivateLeagueFeedback(null);

    await loadPrivateLeagueMembers(leagueId);

    window.requestAnimationFrame(() => {
      document
        .getElementById("private-league-ranking")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  const buildPrivateLeagueInviteUrl = (league) =>
    `${window.location.origin}/perfil/lligues?join=${encodeURIComponent(
      league?.inviteCode || "",
    )}`;

  const copyPrivateLeagueInvite = async (league) => {
    if (!league?.inviteCode) {
      return;
    }

    const inviteUrl = buildPrivateLeagueInviteUrl(league);

    try {
      await navigator.clipboard.writeText(inviteUrl);

      setPrivateLeagueFeedback({
        type: "success",
        message: "Enllaç d’invitació copiat.",
      });
    } catch {
      setPrivateLeagueFeedback({
        type: "success",
        message: `Codi d’invitació: ${league.inviteCode}`,
      });
    }
  };

  const sharePrivateLeague = (league, channel) => {
    if (!league?.inviteCode) {
      return;
    }

    const inviteUrl = buildPrivateLeagueInviteUrl(league);
    const shareText =
      `T’he convidat a “${league.name}”, la nostra lliga privada de Vesalaporra. ` +
      `Fas la porra una sola vegada i els mateixos punts compten aquí i al rànquing general. ` +
      `Codi: ${league.inviteCode}`;

    const shareUrl =
      channel === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(
            `${shareText}\n${inviteUrl}`,
          )}`
        : `https://x.com/intent/post?text=${encodeURIComponent(
            `${shareText}\n${inviteUrl}`,
          )}`;

    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleLeavePrivateLeague = async (league) => {
    if (
      !authUser ||
      !league?.id ||
      league.memberRole === "owner" ||
      privateLeagueActionLoading
    ) {
      return;
    }

    if (
      !window.confirm(
        `Vols sortir de “${league.name}”?`,
      )
    ) {
      return;
    }

    setPrivateLeagueActionLoading(true);
    setPrivateLeagueFeedback(null);

    try {
      const { error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.leave,
        {
          p_league_id: league.id,
        },
      );

      if (error) {
        throw error;
      }

      setSelectedPrivateLeagueId(null);
      setPrivateLeagueMembers([]);

      await loadPrivateLeagues({ quiet: true });

      setPrivateLeagueFeedback({
        type: "success",
        message: `Has sortit de “${league.name}”.`,
      });
    } catch (error) {
      setPrivateLeagueFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut sortir de la lliga.",
      });
    } finally {
      setPrivateLeagueActionLoading(false);
    }
  };

  const handleDeletePrivateLeague = async (league) => {
    if (
      !authUser ||
      !league?.id ||
      league.memberRole !== "owner" ||
      privateLeagueActionLoading
    ) {
      return;
    }

    if (
      !window.confirm(
        `Eliminar definitivament “${league.name}”? Els membres deixaran de veure aquesta lliga, però no es perdrà cap punt ni cap porra.`,
      )
    ) {
      return;
    }

    setPrivateLeagueActionLoading(true);
    setPrivateLeagueFeedback(null);

    try {
      const { error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.deleteLeague,
        {
          p_league_id: league.id,
        },
      );

      if (error) {
        throw error;
      }

      setSelectedPrivateLeagueId(null);
      setPrivateLeagueMembers([]);

      await loadPrivateLeagues({ quiet: true });

      setPrivateLeagueFeedback({
        type: "success",
        message: `“${league.name}” s’ha eliminat.`,
      });
    } catch (error) {
      setPrivateLeagueFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut eliminar la lliga.",
      });
    } finally {
      setPrivateLeagueActionLoading(false);
    }
  };

  const handleRemovePrivateLeagueMember = async (
    league,
    member,
  ) => {
    if (
      !authUser ||
      !league?.id ||
      league.memberRole !== "owner" ||
      !member?.userId ||
      member.userId === String(authUser.id) ||
      privateLeagueActionLoading
    ) {
      return;
    }

    if (
      !window.confirm(
        `Expulsar ${member.displayName} de “${league.name}”?`,
      )
    ) {
      return;
    }

    setPrivateLeagueActionLoading(true);
    setPrivateLeagueFeedback(null);

    try {
      const { error } = await supabase.rpc(
        VESALAPORRA_PRIVATE_LEAGUES_RPC.removeMember,
        {
          p_league_id: league.id,
          p_user_id: member.userId,
        },
      );

      if (error) {
        throw error;
      }

      await Promise.all([
        loadPrivateLeagues({ quiet: true }),
        loadPrivateLeagueMembers(league.id, {
          quiet: true,
        }),
      ]);

      setPrivateLeagueFeedback({
        type: "success",
        message: `${member.displayName} ja no forma part de la lliga.`,
      });
    } catch (error) {
      setPrivateLeagueFeedback({
        type: "error",
        message:
          error?.message ||
          "No s’ha pogut expulsar aquest membre.",
      });
    } finally {
      setPrivateLeagueActionLoading(false);
    }
  };

  const handleToggleProfilePrediction = async (match) => {
    const userId = selectedProfileUser?.id;
    const matchId = match?.matchId;

    if (!userId || !matchId) {
      return;
    }

    const detailKey = `${userId}:${matchId}`;

    if (expandedProfilePrediction?.key === detailKey) {
      setExpandedProfilePrediction(null);
      return;
    }

    setExpandedProfilePrediction({
      key: detailKey,
      loading: true,
      error: "",
      lineupPlayers: [],
      protagonistDisplayName: "",
      protagonistImageUrl: "",
    });

    try {
      const [{ data, error }, matchNotesPayload] = await Promise.all([
        supabase.rpc(
          "vesalaporra_public_prediction_detail",
          {
            p_user_id: userId,
            p_match_id: matchId,
          },
        ),
        callRpcWithPayloadFallbacks(
          VESALAPORRA_PUBLIC_MATCH_NOTES_RPC,
          [
            { p_match_id: matchId },
            { match_id: matchId },
          ],
        ),
      ]);

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No s’ha trobat el detall d’aquesta aposta.");
      }

      const officialStarterPlayerIds = new Set(
        unwrapRpcRows(matchNotesPayload, ["notes", "rows", "players"])
          .filter((row) =>
            ["T", "STARTER", "TITULAR"].includes(
              firstNonEmptyText(
                row?.role,
                row?.participation_role,
                row?.lineup_role,
              ).toUpperCase(),
            ),
          )
          .map((row) => firstNonEmptyText(row?.player_id, row?.id))
          .filter(Boolean),
      );

      const lineupPlayers = Array.isArray(data.lineup_players)
        ? data.lineup_players
            .map((player, playerIndex) => {
              const playerId = firstNonEmptyText(
                player?.player_id,
                player?.id,
              );

              const displayName = firstNonEmptyText(
                player?.display_name,
                player?.player_name,
                player?.name,
              );

              if (!playerId || !displayName) {
                return null;
              }

              return {
                id: playerId,
                displayName,
                isStarter: officialStarterPlayerIds.has(playerId),
                position: playerIndex + 1,
              };
            })
            .filter(Boolean)
        : [];

      const protagonistDisplayName = firstNonEmptyText(
        data.protagonist_display_name,
      );

      const protagonistImageUrl =
        getPublicStorageImageUrl(
          data.protagonist_avatar_bucket,
          data.protagonist_avatar_path,
          data.protagonist_avatar_version,
        ) || "";

      setExpandedProfilePrediction((currentPrediction) =>
        currentPrediction?.key === detailKey
          ? {
              key: detailKey,
              loading: false,
              error: "",
              lineupPlayers,
              protagonistDisplayName,
              protagonistImageUrl,
            }
          : currentPrediction,
      );
    } catch (error) {
      setExpandedProfilePrediction((currentPrediction) =>
        currentPrediction?.key === detailKey
          ? {
              ...currentPrediction,
              loading: false,
              error:
                error?.message ||
                "No s’ha pogut carregar aquesta aposta.",
            }
          : currentPrediction,
      );
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const resolveBackendAdmin = async () => {
      if (!authUser) {
        if (isCurrent) {
          setBackendIsAdmin(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc(
        "vesalaporra_current_user_is_admin",
      );

      if (isCurrent) {
        setBackendIsAdmin(!error && data === true);
      }
    };

    resolveBackendAdmin();

    return () => {
      isCurrent = false;
    };
  }, [authUser?.id]);

    useEffect(() => {
    let isCurrent = true;

    refreshPublicCurrentMatch().catch((error) => {
      console.warn(
        "No s’ha pogut carregar la porra ni el següent partit:",
        error,
      );

      if (isCurrent) {
        setMatchData(EMPTY_MATCH_DATA);
        setAuthError(
          error?.message ||
            "No s’ha pogut carregar el pròxim partit.",
        );
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  /*
   * Sincronització competitiva silenciosa:
   * - detecta una puntuació feta en un altre navegador;
   * - manté portada, rànquing i perfil al dia sense recarregar la web;
   * - refresca immediatament en tornar a la pestanya;
   * - evita peticions superposades.
   */
  useEffect(() => {
    let isCancelled = false;
    let refreshInFlight = false;

    const refreshVisibleCompetitiveState = async () => {
      if (
        isCancelled ||
        refreshInFlight ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      refreshInFlight = true;

      try {
        await refreshPublicCurrentMatch({ quiet: true });

        if (
          activePage === "ranking" ||
          activePage === "profile" ||
          activePage === "scoring"
        ) {
          await loadRealRanking({ quiet: true });
        }

        if (
          activePage === "notes" &&
          !ratingSavingPlayerId
        ) {
          await loadRealNotes({
            quiet: true,
            refreshOrder: false,
          });
        }

        if (
          activePage === "profile" &&
          selectedProfileUser?.id
        ) {
          await loadRealProfileData(
            selectedProfileUser.id,
            { quiet: true },
          );
        }
      } catch (error) {
        console.warn(
          "No s’ha pogut sincronitzar l’estat competitiu en segon pla:",
          error,
        );
      } finally {
        refreshInFlight = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshVisibleCompetitiveState();
      }
    };

    const handleWindowFocus = () => {
      refreshVisibleCompetitiveState();
    };

    const liveSyncInterval = window.setInterval(
      refreshVisibleCompetitiveState,
      VESALAPORRA_LIVE_SYNC_INTERVAL_MS,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isCancelled = true;

      window.clearInterval(liveSyncInterval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [
    activePage,
    authUser?.id,
    ratingSavingPlayerId,
    selectedProfileUser?.id,
  ]);

  useEffect(() => {
    if (!matchData.id) {
      setPublicMatchPlayers([]);
      return;
    }

    loadPublicMatchPlayers(matchData.id);
  }, [matchData.id]);
  useEffect(() => {
    if (activePage === "scoring" && isAdmin && adminScoringTab === "players") {
      loadAdminPlayerWorkspace();
    }
  }, [activePage, adminScoringTab, isAdmin, activeAdminMatchId]);

  useEffect(() => {
    if (
      activePage === "scoring" &&
      isAdmin &&
      adminScoringTab === "upcoming"
    ) {
      loadAdminUpcomingMatches();
    }
  }, [activePage, adminScoringTab, isAdmin]);

  useEffect(() => {
    let isMounted = true;

    const cleanAuthUrl = () => {
      if (
        window.location.pathname === "/auth/callback" ||
        window.location.pathname === "/entra-x"
      ) {
                window.history.replaceState({}, document.title, "/porra");
      }
    };

    const readOAuthErrorFromUrl = () => {
      const queryParams = new URLSearchParams(window.location.search);

      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );

      return (
        queryParams.get("error_description") ||
        queryParams.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error") ||
        ""
      );
    };

    const maybeStartAutomaticXSignIn = async () => {
      if (window.location.pathname !== "/entra-x") {
        return;
      }

      const previousAttemptAt = Number(
        window.sessionStorage.getItem(X_AUTO_LOGIN_STORAGE_KEY) || 0,
      );

      const hasRecentAttempt =
        Date.now() - previousAttemptAt < X_AUTO_LOGIN_COOLDOWN_MS;

      if (hasRecentAttempt) {
        return;
      }

      await handleOAuthSignIn("x", {
        automatic: true,
      });
    };

       const loadSession = async () => {
      const oauthError = readOAuthErrorFromUrl();
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setAuthSession(data.session ?? null);
      setAuthLoading(false);
      setAuthActionLoading(false);

      if (data.session) {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);
        setAuthError("");
        cleanAuthUrl();
        return;
      }

      if (error) {
        setAuthError(error.message);
        cleanAuthUrl();
        return;
      }

      if (oauthError) {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);
        setAuthError(
          "L’enllaç d’accés ha caducat. Torna a entrar amb X, Google o Disqus.",
        );
        cleanAuthUrl();
        return;
      }

      await maybeStartAutomaticXSignIn();
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setAuthSession(nextSession ?? null);
      setAuthLoading(false);
      setAuthActionLoading(false);

          if (event === "SIGNED_IN") {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);
        setAuthError("");
        cleanAuthUrl();
      }

      if (event === "SIGNED_OUT") {
        setAuthProfile(null);
        setProfileDraftName("");
        setProfileNameEditorOpen(false);
        setProfileFeedback(null);
        setPrivateLeagues([]);
        setSelectedPrivateLeagueId(null);
        setPrivateLeagueMembers([]);
        setPrivateLeagueFeedback(null);
        setPrivateLeagueDraftName("");
        setPrivateLeagueJoinCode("");
        setPrivateLeagueCreateOpen(false);
        setPrivateLeagueJoinOpen(false);
        setPrivateLeagueInfoOpen(false);
        setPrivateLeagueRankingTab("general");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (!authUser) {
      setAuthProfile(null);
      setProfileDraftName("");
      setProfileLoading(false);
      return undefined;
    }

    const fallbackProfile = {
      displayName: providerDisplayName,
      avatarUrl: providerAvatarUrl,
      avatarPath: null,
      provider: authProvider || "vesalaporra",
      xHandle: authIsX && providerHandleSlug ? providerHandleSlug : null,
      joinedYear: authUser.created_at
        ? new Date(authUser.created_at).getFullYear()
        : 2026,
    };

    const loadProfile = async () => {
      setProfileLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, display_name, avatar_url, avatar_path, provider, x_handle, created_at",
          )
          .eq("id", authUser.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        let storedProfile = data;

        if (!storedProfile) {
          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: authUser.id,
                display_name: fallbackProfile.displayName,
                avatar_url: fallbackProfile.avatarUrl,
                avatar_path: null,
                provider: fallbackProfile.provider,
                x_handle: fallbackProfile.xHandle,
              },
              {
                onConflict: "id",
              },
            )
            .select(
              "id, display_name, avatar_url, avatar_path, provider, x_handle, created_at",
            )
            .single();

          if (createError) {
            throw createError;
          }

          storedProfile = createdProfile;
        }

        if (!isCurrent) {
          return;
        }

        const nextProfile = {
          displayName:
            storedProfile.display_name || fallbackProfile.displayName,
          avatarUrl: storedProfile.avatar_url || fallbackProfile.avatarUrl,
          avatarPath: storedProfile.avatar_path || null,
          provider: storedProfile.provider || fallbackProfile.provider,
          xHandle: storedProfile.x_handle || fallbackProfile.xHandle,
          joinedYear: storedProfile.created_at
            ? new Date(storedProfile.created_at).getFullYear()
            : fallbackProfile.joinedYear,
        };

        setAuthProfile(nextProfile);
        setProfileDraftName(nextProfile.displayName);
      } catch (error) {
        console.warn(
          "Perfil públic no disponible; s’utilitzen les dades del proveïdor:",
          error,
        );

        if (!isCurrent) {
          return;
        }

        setAuthProfile(fallbackProfile);
        setProfileDraftName(fallbackProfile.displayName);
      } finally {
        if (isCurrent) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [authUser?.id]);

   useEffect(() => {
    let isCurrent = true;

    const resetPredictionDraft = () => {
      setBarcaScore(0);
      setRivalScore(0);
      setScoreTouched(false);
      setLineup(Array.from({ length: 11 }, () => null));
      setProtagonistId(null);
      setProtagonistSelectionActive(false);
      setProtagonistPreviewId(null);
      protagonistInputTypeRef.current = "mouse";
      protagonistTouchPreviewIdRef.current = null;
      setSelectedSlotIndex(null);
      setSelectedPlayerId(null);
      setPredictionConfirmed(false);
      setConfirmedPrediction(null);
      setConfirmationMode("prediction");
      setConfirmationDialogOpen(false);
      setConfirmationAnimationActive(false);
    };

    if (!authUser || !matchData.id) {
      resetPredictionDraft();
      setPredictionLoading(false);

      return () => {
        isCurrent = false;
      };
    }

    const loadRealPrediction = async () => {
      setPredictionLoading(true);

      try {
        const { data, error } = await supabase.rpc(
          "vesalaporra_my_prediction",
          {
            p_match_id: matchData.id,
          },
        );

        if (error) {
          throw error;
        }

        if (!isCurrent) {
          return;
        }

        const storedPrediction = Array.isArray(data)
          ? data[0]
          : data;

        if (!storedPrediction?.prediction_id) {
          resetPredictionDraft();
          return;
        }

        const restoredLineup = Array.from(
          { length: 11 },
          (_, index) =>
            storedPrediction.lineup_player_ids?.[index] ||
            null,
        );

        const predictionSnapshot = {
          matchId: String(storedPrediction.match_id),
          confirmedAt: storedPrediction.confirmed_at,
          barcaScore: Number(
            storedPrediction.predicted_barcelona_goals,
          ),
          rivalScore: Number(
            storedPrediction.predicted_opponent_goals,
          ),
          lineup: restoredLineup,
          protagonistId:
            storedPrediction.protagonist_player_id || null,
        };

        setBarcaScore(predictionSnapshot.barcaScore);
        setRivalScore(predictionSnapshot.rivalScore);
        setScoreTouched(true);
        setLineup(restoredLineup);
        setProtagonistId(predictionSnapshot.protagonistId);
        setProtagonistSelectionActive(false);
        setProtagonistPreviewId(null);
        protagonistInputTypeRef.current = "mouse";
        protagonistTouchPreviewIdRef.current = null;
        setConfirmedPrediction(predictionSnapshot);
        setPredictionConfirmed(true);
      } catch (error) {
        console.warn(
          "No s’ha pogut recuperar el pronòstic real:",
          error,
        );

        if (isCurrent) {
          resetPredictionDraft();

          setAuthError(
            error?.message ||
              "No s’ha pogut carregar la teva porra.",
          );
        }
      } finally {
        if (isCurrent) {
          setPredictionLoading(false);
        }
      }
    };

    loadRealPrediction();

    return () => {
      isCurrent = false;
    };
  }, [authUser?.id, matchData.id]);

  useEffect(
    () => () => {
      if (confirmationAnimationTimerRef.current) {
        window.clearTimeout(confirmationAnimationTimerRef.current);
      }
    },
    [],
  );

     useEffect(() => {
    setCountdown(
      getCountdown(matchData.predictionsCloseAt),
    );

    if (!matchData.predictionsCloseAt) {
      return undefined;
    }

    const countdownInterval = window.setInterval(() => {
      setCountdown(
        getCountdown(matchData.predictionsCloseAt),
      );
    }, 1000);

    return () =>
      window.clearInterval(countdownInterval);
  }, [matchData.predictionsCloseAt]);

  useEffect(() => {
    if (
      !isWaitingForOpening ||
      !matchData.predictionsOpenAt
    ) {
      setOpeningCountdown(getCountdown(null));
      return undefined;
    }

    let refreshInFlight = false;

    const updateOpeningCountdown = () => {
      const nextCountdown = getCountdown(
        matchData.predictionsOpenAt,
      );

      setOpeningCountdown(nextCountdown);

      if (nextCountdown.isClosed && !refreshInFlight) {
        refreshInFlight = true;

        refreshPublicCurrentMatch({ quiet: true })
          .catch((error) => {
            console.warn(
              "La porra encara no s’ha activat:",
              error,
            );
          })
          .finally(() => {
            refreshInFlight = false;
          });
      }
    };

    updateOpeningCountdown();

    const openingInterval = window.setInterval(
      updateOpeningCountdown,
      1000,
    );

    return () =>
      window.clearInterval(openingInterval);
  }, [
    isWaitingForOpening,
    matchData.predictionsOpenAt,
  ]);

  useEffect(() => {
    const handoffAt =
      matchData.officialHandoffAt ||
      matchData.ratingsCloseAt ||
      null;

    if (
      !matchData.hasOfficialResult ||
      !handoffAt
    ) {
      return undefined;
    }

    const handoffTimestamp = new Date(handoffAt).getTime();

    if (!Number.isFinite(handoffTimestamp)) {
      return undefined;
    }

    const delayUntilHandoff = Math.max(
      0,
      handoffTimestamp - Date.now() + 1000,
    );

    const handoffTimeout = window.setTimeout(() => {
      refreshPublicCurrentMatch({ quiet: true }).catch((error) => {
        console.warn(
          "No s’ha pogut fer el relleu automàtic després del tancament de Les Notes:",
          error,
        );
      });
    }, delayUntilHandoff);

    return () =>
      window.clearTimeout(handoffTimeout);
  }, [
    matchData.id,
    matchData.hasOfficialResult,
    matchData.officialHandoffAt,
    matchData.ratingsCloseAt,
  ]);

  useEffect(() => {
    if (activePage !== "ranking" || !rankingHasMore) {
      return undefined;
    }

    const handleRankingScroll = () => {
      const viewportBottom = window.scrollY + window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - viewportBottom < 260) {
        setVisibleRankingCount((currentCount) =>
          Math.min(currentCount + RANKING_PAGE_SIZE, rankingRows.length),
        );
      }
    };

    window.addEventListener("scroll", handleRankingScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleRankingScroll);
  }, [activePage, rankingHasMore, rankingRows.length]);

  useEffect(() => {
    if (!protagonistId) {
      return;
    }

    const protagonistPlayer = gamePlayersById[protagonistId];

    const isStillEligible =
      protagonistPlayer &&
      !protagonistPlayer.isGoalkeeper &&
      Boolean(getPlayerProtagonistScoring(protagonistPlayer));

    if (!isStillEligible) {
      setProtagonistId(null);
      setProtagonistSelectionActive(false);
      setProtagonistPreviewId(null);
      protagonistTouchPreviewIdRef.current = null;
    }
  }, [protagonistId, publicMatchPlayers]);

  useEffect(() => {
    if (
      activePage === "ranking" ||
      activePage === "profile" ||
      activePage === "scoring"
    ) {
      loadRealRanking();
    }
  }, [activePage, authUser?.id, matchData.id]);

    useEffect(() => {
    if (activePage === "notes") {
      loadRealNotes({ refreshOrder: true });
    }
  }, [activePage, matchData.id, publicMatchPlayers.length]);

  useEffect(() => {
    if (activePage === "profile" && selectedProfileUser?.id) {
      loadRealProfileData(selectedProfileUser.id);
    }
  }, [activePage, selectedProfileUser?.id]);

  useEffect(() => {
    if (
      activePage !== "profile" ||
      profileTab !== "leagues" ||
      !isOwnAuthenticatedProfile
    ) {
      return;
    }

    const inviteCodeFromUrl = normalizePrivateLeagueCode(
      new URLSearchParams(window.location.search).get("join"),
    );

    if (inviteCodeFromUrl) {
      setPrivateLeagueJoinCode(inviteCodeFromUrl);
      setPrivateLeagueJoinOpen(true);
      setPrivateLeagueCreateOpen(false);
    }

    loadPrivateLeagues();
  }, [
    activePage,
    profileTab,
    isOwnAuthenticatedProfile,
    authUser?.id,
  ]);

  useEffect(() => {
    if (
      activePage === "profile" &&
      profileTab === "leagues" &&
      selectedPrivateLeagueId &&
      isOwnAuthenticatedProfile
    ) {
      loadPrivateLeagueMembers(
        selectedPrivateLeagueId,
        { quiet: true },
      );
    }
  }, [
    activePage,
    profileTab,
    selectedPrivateLeagueId,
    isOwnAuthenticatedProfile,
  ]);

  useEffect(() => {
    if (matchData.id && officialMatchState.matchId !== matchData.id) {
      setOfficialMatchState(createEmptyOfficialMatchState(matchData.id));
    }
  }, [matchData.id]);

  useEffect(() => {
    if (activePage === "scoring" && !isAdmin) {
      setActivePage("play");
    }
  }, [activePage, isAdmin]);

  const isPlayerEligibleForProtagonist = (player) =>
    Boolean(
      player &&
        !player.isGoalkeeper &&
        player.eligibleForProtagonist !== false &&
        getPlayerProtagonistScoring(player),
    );

  const clearProtagonistSelectionMode = () => {
    setProtagonistSelectionActive(false);
    setProtagonistPreviewId(null);
    protagonistInputTypeRef.current = "mouse";
    protagonistTouchPreviewIdRef.current = null;
  };

    const handleProtagonistSelectorClick = () => {
    if (protagonistEditingIsLocked || predictionSubmitting) {
      return;
    }

    if (protagonistId) {
      setProtagonistId(null);
      clearProtagonistSelectionMode();
      return;
    }

    setProtagonistPreviewId(null);
    protagonistTouchPreviewIdRef.current = null;

    setProtagonistSelectionActive((currentValue) => !currentValue);
  };

  const handleProtagonistPlayerPreview = (playerId) => {
    const player = gamePlayersById[playerId];

    if (
      !protagonistSelectionActive ||
      protagonistEditingIsLocked ||
      !isPlayerEligibleForProtagonist(player)
    ) {
      return;
    }

    setProtagonistPreviewId(playerId);
  };

  const handleProtagonistPlayerPreviewEnd = (playerId) => {
    if (protagonistInputTypeRef.current !== "mouse") {
      return;
    }

    setProtagonistPreviewId((currentPlayerId) =>
      currentPlayerId === playerId ? null : currentPlayerId,
    );
  };

  const handleProtagonistPlayerClick = (
    playerId,
    interactionType = "mouse",
  ) => {
    const player = gamePlayersById[playerId];

    if (
      !protagonistSelectionActive ||
      protagonistEditingIsLocked ||
      !isPlayerEligibleForProtagonist(player)
    ) {
      return;
    }

    const isTouchInteraction =
      interactionType === "touch" || interactionType === "pen";

    if (
      isTouchInteraction &&
      protagonistTouchPreviewIdRef.current !== playerId
    ) {
      protagonistTouchPreviewIdRef.current = playerId;
      setProtagonistPreviewId(playerId);
      return;
    }

    setProtagonistId(playerId);
    clearProtagonistSelectionMode();

    window.requestAnimationFrame(() => {
      protagonistCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const placePlayerInSlot = (playerId, targetSlotIndex) => {
    if (lineupEditingIsLocked || !gamePlayersById[playerId]) {
      return;
    }

    setLineup((currentLineup) => {
      const nextLineup = [...currentLineup];

      const sourceSlotIndex = nextLineup.indexOf(playerId);

      const displacedPlayerId = nextLineup[targetSlotIndex];

      if (sourceSlotIndex === targetSlotIndex) {
        return currentLineup;
      }

      if (sourceSlotIndex !== -1) {
        nextLineup[sourceSlotIndex] = displacedPlayerId;
      }

      nextLineup[targetSlotIndex] = playerId;

      return nextLineup;
    });

    setSelectedSlotIndex(null);
    setSelectedPlayerId(null);
  };

  const removePlayerFromLineup = (playerId) => {
    if (lineupEditingIsLocked || !gamePlayersById[playerId]) {
      return;
    }

    setLineup((currentLineup) =>
      currentLineup.map((currentPlayerId) =>
        currentPlayerId === playerId ? null : currentPlayerId,
      ),
    );

    setSelectedSlotIndex(null);
    setSelectedPlayerId(null);
  };

  const handleSlotClick = (slotIndex) => {
    const fieldPlayerId = lineup[slotIndex];

    if (protagonistSelectionActive) {
      if (fieldPlayerId) {
        handleProtagonistPlayerClick(
          fieldPlayerId,
          protagonistInputTypeRef.current,
        );
      }

      return;
    }

    if (lineupEditingIsLocked) {
      return;
    }

    if (selectedPlayerId) {
      if (fieldPlayerId && selectedPlayerId === fieldPlayerId) {
        removePlayerFromLineup(fieldPlayerId);

        return;
      }

      placePlayerInSlot(selectedPlayerId, slotIndex);

      return;
    }

    if (fieldPlayerId) {
      setSelectedPlayerId(fieldPlayerId);
      setSelectedSlotIndex(null);

      return;
    }

    setSelectedSlotIndex((currentSlotIndex) =>
      currentSlotIndex === slotIndex ? null : slotIndex,
    );
  };

  const handlePlayerClick = (playerId) => {
    if (protagonistSelectionActive) {
      handleProtagonistPlayerClick(
        playerId,
        protagonistInputTypeRef.current,
      );

      return;
    }

    if (lineupEditingIsLocked) {
      return;
    }

    const isInLineup = lineup.includes(playerId);

    if (isInLineup && selectedPlayerId === playerId) {
      removePlayerFromLineup(playerId);

      return;
    }

    if (selectedSlotIndex !== null) {
      placePlayerInSlot(playerId, selectedSlotIndex);

      return;
    }

    setSelectedPlayerId((currentPlayerId) =>
      currentPlayerId === playerId ? null : playerId,
    );
  };

  const handlePlayerBadgeDrop = (event, targetPlayerId) => {
    event.preventDefault();

    if (lineupEditingIsLocked || protagonistSelectionActive) {
      return;
    }

    const draggedPlayerId = event.dataTransfer.getData("text/plain");

    if (
      draggedPlayerId === targetPlayerId &&
      lineup.includes(draggedPlayerId)
    ) {
      removePlayerFromLineup(draggedPlayerId);
    }
  };

  const handleDragStart = (event, playerId) => {
    if (lineupEditingIsLocked || protagonistSelectionActive) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("text/plain", playerId);

    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, targetSlotIndex) => {
    event.preventDefault();

    if (lineupEditingIsLocked || protagonistSelectionActive) {
      return;
    }

    const playerId = event.dataTransfer.getData("text/plain");

    if (!gamePlayersById[playerId]) {
      return;
    }

    placePlayerInSlot(playerId, targetSlotIndex);
  };

  return (
    <div className="app-shell">
      <style>{`
        .profile-history-bet-toggle {
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
          gap: 6px;
          margin-top: 8px;
          padding: 2px 0;
          border: 0;
          background: transparent;
          color: #f7cf4a;
          font: inherit;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          cursor: pointer;
        }

        .profile-history-bet-toggle span {
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          transition: transform 180ms ease;
        }

        .profile-history-bet-toggle.open span {
          transform: rotate(180deg);
        }

        .profile-history-bet-toggle:disabled {
          opacity: 0.45;
          cursor: default;
        }

        .profile-history-bet-detail {
          grid-column: 1 / -1;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(190px, 0.7fr) minmax(0, 1.6fr);
          gap: 14px;
          padding-top: 16px;
          margin-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.09);
          animation: profile-history-bet-open 180ms ease-out;
        }

        .profile-history-protagonist-detail,
        .profile-history-lineup-detail {
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }

        .profile-history-protagonist-detail {
          min-height: 210px;
          display: grid;
          grid-template-columns: minmax(150px, 1.35fr) minmax(82px, 0.65fr);
          align-items: center;
          gap: 12px;
          padding: 14px 12px;
          overflow: hidden;
          border-color: rgba(247, 207, 74, 0.28);
          background: rgba(247, 207, 74, 0.07);
        }

        .profile-history-protagonist-detail.no-player {
          min-height: auto;
          grid-template-columns: 1fr;
        }

        .profile-history-protagonist-image {
          align-self: center;
          justify-self: center;
          width: 100%;
          max-width: 160px;
          height: auto;
          aspect-ratio: 1;
          object-fit: cover;
          object-position: center;
          filter: drop-shadow(0 10px 13px rgba(0, 0, 0, 0.3));
        }

        .profile-history-protagonist-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 10px;
        }

        .profile-history-protagonist-detail
          .profile-history-protagonist-star {
          display: inline-block;
          font-size: 20px;
          line-height: 1;
          letter-spacing: 0;
          vertical-align: middle;
        }

        .profile-history-protagonist-detail span,
        .profile-history-lineup-detail header span {
          color: #f7cf4a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .profile-history-protagonist-detail strong {
          color: #fff;
          font-size: 16px;
          line-height: 1.15;
        }

        .profile-history-protagonist-result {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .profile-history-protagonist-verdict {
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 23px;
          font-weight: 950;
          line-height: 1;
        }

        .profile-history-protagonist-verdict.hit {
          color: #37f58a;
          border: 1px solid rgba(55, 245, 138, 0.42);
          background: rgba(55, 245, 138, 0.12);
        }

        .profile-history-protagonist-verdict.miss {
          color: #ff5f6d;
          border: 1px solid rgba(255, 95, 109, 0.42);
          background: rgba(255, 95, 109, 0.12);
        }

        .profile-history-lineup-detail header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .profile-history-lineup-detail header strong {
          color: #fff;
          font-size: 12px;
        }

        .profile-history-lineup-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .profile-history-lineup-player {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 9px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.055);
        }

        .profile-history-lineup-player > span {
          flex: 0 0 21px;
          display: grid;
          place-items: center;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          background: rgba(247, 207, 74, 0.14);
          color: #f7cf4a;
          font-size: 9px;
          font-weight: 900;
        }

        .profile-history-lineup-player > strong {
          min-width: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 11px;
          line-height: 1.25;
        }

        .profile-history-lineup-player.hit > strong {
          color: #37f58a;
        }

        .profile-history-lineup-player.miss > strong {
          color: #ff6b76;
        }

        .profile-history-bet-state {
          grid-column: 1 / -1;
          padding: 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.72);
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .profile-history-bet-state.error {
          color: #ff9898;
          background: rgba(255, 70, 70, 0.08);
        }

        @keyframes profile-history-bet-open {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

/* INFO CLICABLE · una mica més visible sense embrutar el disseny */
.section-info-button {
  width: 30px !important;
  height: 30px !important;
  flex: 0 0 30px !important;
  border-color: rgba(255, 222, 99, 0.54) !important;
  background: rgba(255, 211, 54, 0.105) !important;
  color: #ffe36a !important;
  font-size: 15px !important;
  font-weight: 950 !important;
  box-shadow:
    0 0 0 1px rgba(255, 211, 54, 0.08),
    0 0 10px rgba(255, 211, 54, 0.08);
  animation: section-info-attention-pulse 900ms ease-out 350ms 2;
}

.section-info-button:hover {
  transform: translateY(-1px) scale(1.06);
  box-shadow:
    0 0 0 1px rgba(255, 211, 54, 0.14),
    0 0 15px rgba(255, 211, 54, 0.18);
}

@keyframes section-info-attention-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(255, 211, 54, 0.08),
      0 0 10px rgba(255, 211, 54, 0.08);
  }

  50% {
    box-shadow:
      0 0 0 4px rgba(255, 211, 54, 0.13),
      0 0 18px rgba(255, 211, 54, 0.26);
  }
}

@media (max-width: 760px) {
  .section-info-button {
    width: 28px !important;
    height: 28px !important;
    flex-basis: 28px !important;
    font-size: 14px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-info-button {
    animation: none;
  }
}

/* LES NOTES · actualització manual del rànquing sense moure jugadors mentre es vota */
.notes-board-heading .notes-board-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.notes-board-heading .notes-board-actions > small {
  color: rgba(166, 178, 215, 0.78);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.notes-ranking-refresh-button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 13px;
  border: 1px solid rgba(247, 207, 74, 0.38);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(247, 207, 74, 0.13), rgba(247, 207, 74, 0.045)),
    rgba(7, 11, 28, 0.72);
  color: #f7d654;
  font: inherit;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 0.1em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 20px rgba(0, 0, 0, 0.2);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.notes-ranking-refresh-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(247, 207, 74, 0.68);
  background:
    linear-gradient(135deg, rgba(247, 207, 74, 0.2), rgba(247, 207, 74, 0.07)),
    rgba(7, 11, 28, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 10px 24px rgba(0, 0, 0, 0.28),
    0 0 18px rgba(247, 207, 74, 0.08);
}

.notes-ranking-refresh-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.notes-ranking-refresh-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

.notes-ranking-refresh-icon {
  display: inline-grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border: 1px solid rgba(247, 207, 74, 0.34);
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
}

.notes-ranking-refresh-button.refreshing .notes-ranking-refresh-icon {
  animation: notes-ranking-refresh-spin 700ms linear infinite;
}

@keyframes notes-ranking-refresh-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 680px) {
  .notes-board-heading .notes-board-actions {
    align-items: flex-end;
    flex-direction: column;
    gap: 7px;
  }

  .notes-ranking-refresh-button {
    min-height: 31px;
    padding: 6px 10px;
    font-size: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notes-ranking-refresh-button,
  .notes-ranking-refresh-button.refreshing .notes-ranking-refresh-icon {
    animation: none;
    transition: none;
  }
}

.app-shell .scoreboard {
  position: relative;
}

.app-shell .scoreboard > .score-match-label {
  position: absolute;
  left: 50%;
  top: 13px;
  bottom: auto;
  margin: 0;
  color: #f0cc47;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 0.14em;
  white-space: nowrap;
  transform: translateX(-50%);
}

@media (min-width: 681px) {
  .app-shell .scoreboard > .score-match-label {
    top: 16px;
    font-size: 10px;
  }
}

/* DESKTOP · capçalera en 3 blocs + accessos equilibrats */
@media (min-width: 981px) {
  .app-header {
    display: grid;
    grid-template-columns:
      minmax(190px, 1fr)
      auto
      minmax(190px, 1fr);
    align-items: center;
  }

  .app-header > .brand {
    grid-column: 1;
    justify-self: start;
  }

  .app-header > .header-actions {
    display: contents;
  }

  .app-header .main-nav {
    position: relative;
    grid-column: 2;
    justify-self: center;
    justify-content: center;
  }

  .app-header .auth-area {
    grid-column: 3;
    justify-self: end;
  }

  .app-header .main-nav .nav-button.admin {
    position: absolute;
    top: 50%;
    left: calc(100% + 8px);
    transform: translateY(-50%);
  }

  .app-header .main-nav .nav-button.admin:active {
    transform: translateY(-50%) scale(0.97);
  }

  .auth-provider-button.x > span,
  .auth-provider-button .auth-google-mark,
  .auth-provider-button .auth-disqus-mark {
    display: grid !important;
    place-items: center !important;
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
    flex: 0 0 20px !important;
  }

  .auth-provider-button.x > span {
    font-size: 20px;
    line-height: 1;
    transform: none;
  }

  .auth-provider-button .auth-google-mark {
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .auth-provider-button .auth-google-mark svg {
    display: block;
    width: 20px;
    height: 20px;
  }

  .auth-provider-button .auth-disqus-mark {
    font-size: 11px !important;
    line-height: 1 !important;
  }
}

.nav-guest-mobile-label {
  display: none;
}

@media (max-width: 980px) {
  .app-header .nav-full-label {
    display: none;
  }

  .app-header .nav-guest-mobile-label {
    display: inline;
  }

  .app-header .main-nav {
    transform: none !important;
    margin-left: 14px !important;
  }

  .desktop-only-disqus {
    display: none !important;
  }
}
.nav-help-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.nav-help-icon {
  display: inline-grid;
  place-items: center;
  width: 19px;
  height: 19px;
  flex: 0 0 19px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 950;
  line-height: 1;
}

.instructions-page {
  width: min(calc(100% - 24px), 1240px);
  margin: 0 auto;
  padding: clamp(20px, 4vw, 44px) 0 100px;
}

@media (max-width: 520px) {
  .nav-help-button {
    width: 32px;
    height: 32px;
    padding: 0 !important;
  }

  .nav-help-label {
    display: none;
  }
}

     @media (max-width: 680px) {
          .app-shell .player-tray .player-badges {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            column-gap: 6px;
            row-gap: 12px;
          }

          .app-shell .player-tray .player-badge {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
          }

          .app-shell .player-tray .player-badge-avatar {
            width: clamp(54px, 16vw, 62px);
            height: clamp(54px, 16vw, 62px);
          }

  

          .app-shell
            .notes-player-stats.season
            .participation-role-stat.substitute {
            display: none;
          }

          .app-shell .notes-player-stats.season {
            flex-wrap: nowrap;
            white-space: nowrap;
          }

          .profile-history-bet-detail {
  grid-template-columns: 1fr;
}

/* PERFIL > HISTORIAL · enquadrat correcte en mobile */
.profile-history-row-v2 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.profile-history-row-v2 > * {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.profile-history-match-v2,
.profile-history-score-v2,
.profile-history-bet-detail {
  grid-column: 1 / -1;
}

.profile-history-score-v2 {
  width: 100%;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.profile-history-score-v2 > div {
  min-width: 0;
}

.profile-history-points-v2 {
  grid-column: 1 / span 3;
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.profile-history-points-v2 > div {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.profile-history-total-v2 {
  grid-column: 4;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
        }

        @media (max-width: 430px) {
  .app-shell .score-center-controls {
    align-self: start;
    margin-top: 27.2px;
  }

 .app-shell .scoreboard > .score-match-label {
  top: 12px;
}
  .profile-history-lineup-list {
    grid-template-columns: 1fr;
  }
}
      `}</style>

      <header
        className={authUser ? "app-header" : "app-header guest"}
      >
        <div className="brand">
          <span className="brand-mark">V</span>

          <div className="brand-copy">
            <strong>VESALAPORRA</strong>

            <span>La porra dels culers</span>
          </div>
        </div>

        <div className="header-actions">
          <nav className="main-nav" aria-label="Navegació principal">
            <button
              type="button"
              className={
                activePage === "play" ? "nav-button active" : "nav-button"
              }
              onClick={() => setActivePage("play")}
            >
              <span className="nav-full-label">LA PORRA</span>
              <span className="nav-guest-mobile-label">PORRA</span>
            </button>

            <button
              type="button"
              className={
                activePage === "ranking" ? "nav-button active" : "nav-button"
              }
              onClick={() => setActivePage("ranking")}
            >
              <span className="nav-full-label">RÀNQUING</span>
              <span className="nav-guest-mobile-label">RANK</span>
            </button>

            <button
              type="button"
              className={
                activePage === "profile" ? "nav-button active" : "nav-button"
              }
              onClick={() => {
                setSelectedProfileUserId(authUser?.id ? String(authUser.id) : null);
                setProfileTab("overview");
                setActivePage("profile");
              }}
            >
              PERFIL
            </button>

            <button
              type="button"
              className={
                activePage === "notes" ? "nav-button active" : "nav-button"
              }
              onClick={() => setActivePage("notes")}
            >
              <span className="nav-full-label">LES NOTES</span>
              <span className="nav-guest-mobile-label">NOTES</span>
            </button>

            <button
              type="button"
              className={
                activePage === "instructions"
                  ? "nav-button nav-help-button active"
                  : "nav-button nav-help-button"
              }
              onClick={() => setActivePage("instructions")}
              aria-label="Com jugar: instruccions de Vesalaporra"
              title="Com jugar"
            >
              <span className="nav-help-icon" aria-hidden="true">
                ?
              </span>
              <span className="nav-help-label">COM JUGAR</span>
            </button>
                        <button
              type="button"
              className="nav-button nav-blog-placeholder"
            >
              BLOG
            </button>

            {isAdmin && (
              <button
                type="button"
                className={
                  activePage === "scoring"
                    ? "nav-button admin active"
                    : "nav-button admin"
                }
                onClick={() => setActivePage("scoring")}
                title="Puntuacions oficials"
              >
                <span className="admin-nav-full">PUNTUACIONS</span>
                <span className="admin-nav-short">PTS</span>
              </button>
            )}
          </nav>

                    <div className="auth-area">
            {authUser ? (
              <button
                type="button"
                className="auth-account-button signed-in"
                disabled={authLoading || authActionLoading}
                onClick={() => openRankingProfile(String(authUser.id))}
                aria-label={`Obre el perfil de ${profileDisplayName}`}
                title={profileDisplayName}
              >
                <AuthAvatar
                  imageUrl={profileAvatarUrl}
                  displayName={profileDisplayName}
                />
              </button>
            ) : (
              <div
                className="auth-provider-buttons"
                aria-label="Opcions d’accés"
              >
                <button
                  type="button"
                  className="auth-provider-button x"
                  disabled={authLoading || authActionLoading}
                  onClick={handleXSignIn}
                  aria-label="Entra amb X"
                  title="Entra amb X"
                >
                  <span aria-hidden="true">𝕏</span>
                </button>

                <button
                  type="button"
                  className="auth-provider-button google"
                  disabled={authLoading || authActionLoading}
                  onClick={handleGoogleSignIn}
                  aria-label="Entra amb Google"
                  title="Entra amb Google"
                >
                  <GoogleMark className="auth-google-mark" />
                </button>

                <button
  type="button"
  className="auth-provider-button disqus desktop-only-disqus"
  disabled={authLoading || authActionLoading}
  onClick={handleDisqusSignIn}
  aria-label="Entra amb Disqus"
  title="Entra amb Disqus"
>
  <DisqusMark className="auth-disqus-mark" />
</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activePage === "play" && (
        <VesalaporraDesktopAppLauncher />
      )}

      {authError && (
        <div className="auth-error-banner" role="alert">
          <strong>ACCÉS</strong>
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError("")}
            aria-label="Tanca l’avís d’error"
          >
            ×
          </button>
        </div>
      )}

      <main className="app-main">
        {activePage === "instructions" && (
          <section
            className="instructions-page"
            aria-label="Com jugar a Vesalaporra"
          >
            <div
              dangerouslySetInnerHTML={{ __html: enhancedInstructionsHtml }}
            />
          </section>
        )}

        {activePage === "play" && (
          <section
            className={[
              "play-page",
              predictionScoreIsLocked ? "result-locked" : "",
              lineupEditingIsLocked ? "lineup-locked" : "",
              protagonistEditingIsLocked ? "protagonist-locked" : "",
              protagonistSelectionActive ? "protagonist-pick-mode" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <section className="prediction-card score-card">
              <div className="section-heading score-heading">
                <div>
                  <h2>
                    {hasOfficialResult
                      ? "Resultat del partit"
                      : "Pronostica el resultat"}
                  </h2>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() => toggleInfoSection("score")}
                    aria-label="Informació sobre el pronòstic del resultat"
                    aria-expanded={openInfoSection === "score"}
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                             <span
                  className={
                    hasOfficialResult || resultIsConfirmed || scoreTouched
                      ? "status-pill completed"
                      : "status-pill"
                  }
                >
                  {isWaitingForOpening
                    ? "TANCADA"
                    : hasOfficialResult
                      ? "FINAL"
                      : resultIsConfirmed
                      ? "ENVIAT"
                      : scoreTouched
                        ? "FET"
                        : "PENDENT"}
                </span>
              </div>

                           <div className="score-match-overview">
                <div className="score-match-date">
                  <span>
                    {isWaitingForOpening
                      ? "SEGÜENT PARTIT"
                      : hasOfficialResult
                        ? "PARTIT PUNTUAT"
                        : "PROPER PARTIT"}
                  </span>

                  <strong>{matchData.kickoffLabel}</strong>
                </div>

                <div
                  className={
                    isWaitingForOpening || countdown.isClosed
                      ? "score-deadline closed"
                      : "score-deadline"
                  }
                >
                  <span className="score-deadline-title">
                    {isWaitingForOpening
                      ? "PORRA TANCADA · S’OBRE EN"
                      : countdown.isClosed
                        ? "ESTAT"
                        : "TANCA EN"}
                  </span>

                  {!isWaitingForOpening && countdown.isClosed ? (
                    <strong className="score-deadline-closed">
                      PORRA TANCADA
                    </strong>
                  ) : (
                    <div className="score-countdown-grid">
                      <div className="score-countdown-unit">
                        <strong>
                          {String(displayedCountdown.days).padStart(2, "0")}
                        </strong>

                        <span>DIES</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(displayedCountdown.hours).padStart(2, "0")}
                        </strong>

                        <span>HORES</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(displayedCountdown.minutes).padStart(2, "0")}
                        </strong>

                        <span>MIN</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(displayedCountdown.seconds).padStart(2, "0")}
                        </strong>

                        <span>SEG</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {matchData.pointsMultiplier === 2 && (
                <div
                  role="note"
                  aria-label="Partit doble, tots els punts compten per dos"
                  style={{
                    display: "grid",
                    gap: "4px",
                    margin: "0 0 18px",
                    padding: "13px 16px",
                    border: "1px solid rgba(244, 207, 54, 0.68)",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, rgba(244, 207, 54, 0.2), rgba(165, 0, 68, 0.18))",
                    boxShadow:
                      "0 12px 28px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <strong
                    style={{
                      color: "#f4cf36",
                      fontSize: "clamp(0.98rem, 3.6vw, 1.18rem)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    🔥 PARTIT DOBLE · PUNTS x2
                  </strong>

                  <span
                    style={{
                      color: "rgba(255, 255, 255, 0.92)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    Tots els punts positius i negatius compten el doble.
                  </span>
                </div>
              )}

              {openInfoSection === "score" && (
                <div className="section-info-panel" role="note">
                  <strong className="section-info-title">
                    PUNTS DEL RESULTAT
                  </strong>

                  <div className="section-info-points-list">
                    <div className="section-info-points-row featured">
                      <span>Marcador exacte</span>

                      <strong>+50</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Encertar el signe del partit</span>

                      <strong>+10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Encertar els gols del Barça</span>

                      <strong>+15</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Encertar els gols del rival</span>

                      <strong>+10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Encertar els gols totals del partit</span>

                      <strong>+5</strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    El marcador exacte val +50 i no suma parcials. Si no és
                    exacte, el signe (+10) es pot acumular amb els gols del
                    Barça (+15), amb els gols del rival (+10) o amb els gols
                    totals del partit (+5). Mai se sumen signe + gols del
                    Barça + gols del rival: si encertes els dos marcadors és
                    resultat exacte i són +50.
                  </small>
                </div>
              )}

              <div className="scoreboard">
                <div className="score-team home">
                  <div className="score-team-label">
                                    <span
                      className="team-color-dot"
                      style={{
                        background: getTeamBadgeBackground(
                          matchData.homeTeamId,
                          matchData.homeBadgeColors,
                          matchData.homeBadgePattern,
                        ),
                      }}
                      aria-hidden="true"
                    ></span>

                    <span className="score-team-copy">
                      <strong>{matchData.homeName}</strong>

                      
                    </span>
                  </div>
                </div>

                <div className="score-center-controls">
                  <div className="score-control">
                    <button
                      type="button"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (predictionScoreIsLocked) {
                          return;
                        }

                        setScoreTouched(true);
                        changeHomePredictionScore((score) =>
                          Math.max(0, score - 1),
                        );
                      }}
                      aria-label={`Resta un gol a ${matchData.homeName}`}
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (!predictionScoreIsLocked) {
                          setScoreTouched(true);
                        }
                      }}
                      aria-label={`Confirmar ${homePredictionScore} gols de ${matchData.homeName}`}
                    >
                      {displayedHomeScore}
                    </button>

                    <button
                      type="button"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (predictionScoreIsLocked) {
                          return;
                        }

                        setScoreTouched(true);
                        changeHomePredictionScore((score) => score + 1);
                      }}
                      aria-label={`Suma un gol a ${matchData.homeName}`}
                    >
                      +
                    </button>
                  </div>

                  <span className="score-separator" aria-hidden="true">
                    vs
                  </span>

                  <div className="score-control">
                    <button
                      type="button"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (predictionScoreIsLocked) {
                          return;
                        }

                        setScoreTouched(true);
                        changeAwayPredictionScore((score) =>
                          Math.max(0, score - 1),
                        );
                      }}
                      aria-label={`Resta un gol a ${matchData.awayName}`}
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (!predictionScoreIsLocked) {
                          setScoreTouched(true);
                        }
                      }}
                      aria-label={`Confirmar ${awayPredictionScore} gols de ${matchData.awayName}`}
                    >
                      {displayedAwayScore}
                    </button>

                    <button
                      type="button"
                      disabled={predictionScoreIsLocked}
                      onClick={() => {
                        if (predictionScoreIsLocked) {
                          return;
                        }

                        setScoreTouched(true);
                        changeAwayPredictionScore((score) => score + 1);
                      }}
                      aria-label={`Suma un gol a ${matchData.awayName}`}
                                        >
                      +
                    </button>
                  </div>

                                  </div>

                <small className="score-match-label">
                  EL PARTIT
                </small>

                <div className="score-team away">
                  <div className="score-team-label">
                                      <span
                      className="team-color-dot"
                      style={{
                        background: getTeamBadgeBackground(
                          matchData.awayTeamId,
                          matchData.awayBadgeColors,
                          matchData.awayBadgePattern,
                        ),
                      }}
                      aria-hidden="true"
                    ></span>

                    <span className="score-team-copy">
                      <strong>{matchData.awayName}</strong>

                      <small>{matchData.awayCountry}</small>
                    </span>
                  </div>
                </div>
              </div>

              <div className="result-only-action">
                <button
                  type="button"
                  className={
                    resultIsConfirmed
                      ? "result-only-button confirmed"
                      : "result-only-button"
                  }
                  disabled={
                    !scoreTouched ||
                    matchLoading ||
                    predictionLoading ||
                    predictionSubmitting ||
                    countdown.isClosed ||
                    authLoading ||
                    authActionLoading ||
                    resultIsConfirmed
                  }
                  onClick={handleConfirmResultOnly}
                >
                  {resultIsConfirmed
                    ? "✓ RESULTAT ENVIAT"
                    : "NOMÉS VULL PRONOSTICAR EL RESULTAT"}
                </button>
              </div>
            </section>

            <section
              className="prediction-card lineup-card"
              aria-label={
                protagonistSelectionActive
                  ? "Mode de selecció de protagonista actiu"
                  : "La Lotto Flick"
              }
            >
              <div className="section-heading lotto-heading">
                <div className="lotto-heading-main">
                  <span className="flick-avatar-shell">
                    <img
                      src="/fcb/HANSI_FLICK.png"
                      className="flick-avatar"
                      alt="Hansi Flick"
                    />
                  </span>

                  <div className="lotto-title-copy">
                    <h2>La Lotto Flick</h2>

                    <span className="formation-label">4-2-3-1 FIX</span>
                  </div>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() => toggleInfoSection("lineup")}
                    aria-label="Informació sobre la Lotto Flick"
                    aria-expanded={openInfoSection === "lineup"}
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                <span
                  className={
                    lineupIsConfirmed || lineupIsComplete
                      ? "lineup-counter completed"
                      : "lineup-counter"
                  }
                >
                  {lineupIsConfirmed
                    ? "ENVIADA · 11 / 11"
                    : lineupIsComplete
                      ? "FET · 11 / 11"
                    : `OPCIONAL · ${lineupCount} / 11`}
                </span>
              </div>

              {openInfoSection === "lineup" && (
                <div className="section-info-panel" role="note">
                  <strong className="section-info-title">
                    PUNTS DE LA LOTTO FLICK
                  </strong>

                  <div className="section-info-xi-grid">
                    <div className="section-info-points-row featured">
                      <span>11/11 encerts</span>
                      <strong>+50</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>10/11 encerts</span>
                      <strong>+30</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>9/11 encerts</span>
                      <strong>+20</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>8/11 encerts</span>
                      <strong>+10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>7/11 encerts</span>
                      <strong>+5</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>6/11 encerts</span>
                      <strong>−5</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>5/11 encerts</span>
                      <strong>−10</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>4/11 encerts</span>
                      <strong>−15</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>3/11 encerts</span>
                      <strong>−20</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>2/11 encerts</span>
                      <strong>−25</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>1/11 encerts</span>
                      <strong>−30</strong>
                    </div>

                    <div className="section-info-points-row troll">
                      <span>0/11 encerts 😈</span>
                      <strong>+30</strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    Compten els jugadors encertats, no la posició on els
                    col·loques al camp.
                  </small>
                </div>
              )}

              {protagonistSelectionActive && (
                <div className="protagonist-selection-guide" role="status">
                  <span className="protagonist-selection-guide-star">★</span>

                  <div>
                    <strong>MODE PROTAGONISTA ACTIU</strong>
                    <span>
                      Passa per sobre d’una xapa i clica-la. En mòbil: primer
                      toc per veure els punts, segon toc per escollir.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearProtagonistSelectionMode}
                  >
                    CANCEL·LA
                  </button>
                </div>
              )}

              <p className="section-help">
                {countdown.isClosed || hasOfficialResult
                  ? "La porra està tancada. L’XI ja no es pot modificar."
                  : "Clica una posició i després un jugador (o a la inversa) i el jugador es posarà al lloc on vulguis. També pots arrossegar les xapes."}
              </p>

              <div
                ref={protagonistSelectionAreaRef}
                className={
                  protagonistSelectionActive
                    ? "football-field protagonist-pick-field"
                    : "football-field"
                }
              >
                <div className="field-line halfway-line"></div>

                <div className="field-circle"></div>

                <div className="penalty-area penalty-area-top"></div>

                <div className="penalty-area penalty-area-bottom"></div>

                <div className="field-slots formation-4231">
                  {formation4231.map((line) => (
                    <div
                      key={line.id}
                      className={`formation-row formation-${line.id}`}
                      aria-label={line.label}
                    >
                      {line.slots.map((slotIndex) => {
                        const playerId = lineup[slotIndex];

                        const player = playerId ? gamePlayersById[playerId] : null;

                        const isTargetSelected =
                          selectedSlotIndex === slotIndex;

                        const isProtagonist =
                          Boolean(player) && protagonistId === player.id;

                        const isPlayerSelected =
                          Boolean(player) && selectedPlayerId === player.id;

                        const isEligibleProtagonist =
                          isPlayerEligibleForProtagonist(player);

                        const isProtagonistPreview =
                          Boolean(player) &&
                          protagonistPreviewId === player.id;

                        const fieldSlotClassName = [
                          "field-slot",
                          player ? "occupied" : "",
                          isTargetSelected ? "target-selected" : "",
                          isPlayerSelected ? "player-selected" : "",
                          isProtagonist ? "protagonist" : "",
                          isEligibleProtagonist
                            ? "protagonist-eligible"
                            : "",
                          isProtagonistPreview
                            ? "protagonist-preview"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <button
                            key={slotIndex}
                            type="button"
                            className={fieldSlotClassName}
                            disabled={
                              lineupEditingIsLocked &&
                              !(
                                protagonistSelectionActive &&
                                isEligibleProtagonist &&
                                !protagonistEditingIsLocked
                              )
                            }
                            draggable={
                              !lineupEditingIsLocked &&
                              !protagonistSelectionActive &&
                              Boolean(player)
                            }
                            onPointerDown={(event) => {
                              if (protagonistSelectionActive) {
                                protagonistInputTypeRef.current =
                                  event.pointerType || "mouse";
                              }
                            }}
                            onMouseEnter={() => {
                              if (player) {
                                protagonistInputTypeRef.current = "mouse";
                                handleProtagonistPlayerPreview(player.id);
                              }
                            }}
                            onMouseLeave={() => {
                              if (player) {
                                handleProtagonistPlayerPreviewEnd(player.id);
                              }
                            }}
                            onDragStart={(event) => {
                              if (player) {
                                handleDragStart(event, player.id);
                              }
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDrop(event, slotIndex)}
                            onClick={() => handleSlotClick(slotIndex)}
                            aria-pressed={
                              protagonistSelectionActive
                                ? isProtagonistPreview
                                : isTargetSelected || isPlayerSelected
                            }
                            aria-label={
                              player
                                ? protagonistSelectionActive &&
                                  isEligibleProtagonist
                                  ? `${player.name}. Protagonista: +${getPlayerProtagonistScoring(player).hitPoints} si marca o assisteix; ${getPlayerProtagonistScoring(player).missPoints} si no ho fa.`
                                  : `Posició de ${player.name}`
                                : `Posició lliure ${slotIndex + 1}`
                            }
                          >
                            {player ? (
                              <>
                                <img
                                  src={player.image}
                                  className="field-player-image"
                                  alt=""
                                />

                                {isProtagonist && (
                                  <span
                                    className="protagonist-crown"
                                    aria-hidden="true"
                                  >
                                    ★
                                  </span>
                                )}

                                <small className="field-player-name">
                                  {player.shortName}
                                </small>
                              </>
                            ) : (
                              <span className="field-slot-plus">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="player-tray">
                <div className="player-tray-header">
                  <strong>XAPES DEL BARÇA</strong>

                  <span>{lineupPlayers.length} jugadors</span>
                </div>

                <div className="player-badges">
                  {lineupPlayers.map((player) => {
                    const isInLineup = lineup.includes(player.id);

                    const isPendingSelection = selectedPlayerId === player.id;

                    const isEligibleProtagonist =
                      isPlayerEligibleForProtagonist(player);

                    const isProtagonistPreview =
                      protagonistPreviewId === player.id;

                    const isSelectedProtagonist =
                      protagonistId === player.id;

                    const playerBadgeClassName = [
                      "player-badge",
                      isInLineup ? "selected" : "",
                      isPendingSelection ? "pending-selection" : "",
                      isEligibleProtagonist
                        ? "protagonist-eligible"
                        : "",
                      isProtagonistPreview
                        ? "protagonist-preview"
                        : "",
                      isSelectedProtagonist
                        ? "protagonist-selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={player.id}
                        type="button"
                        className={playerBadgeClassName}
                        disabled={
                          lineupEditingIsLocked &&
                          !(
                            protagonistSelectionActive &&
                            isEligibleProtagonist &&
                            !protagonistEditingIsLocked
                          )
                        }
                        draggable={
                          !lineupEditingIsLocked &&
                          !protagonistSelectionActive
                        }
                        onPointerDown={(event) => {
                          if (protagonistSelectionActive) {
                            protagonistInputTypeRef.current =
                              event.pointerType || "mouse";
                          }
                        }}
                        onMouseEnter={() => {
                          protagonistInputTypeRef.current = "mouse";
                          handleProtagonistPlayerPreview(player.id);
                        }}
                        onMouseLeave={() =>
                          handleProtagonistPlayerPreviewEnd(player.id)
                        }
                        onDragStart={(event) =>
                          handleDragStart(event, player.id)
                        }
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) =>
                          handlePlayerBadgeDrop(event, player.id)
                        }
                        onClick={() => handlePlayerClick(player.id)}
                        aria-pressed={
                          protagonistSelectionActive
                            ? isProtagonistPreview
                            : isPendingSelection
                        }
                        aria-label={
                          protagonistSelectionActive &&
                          isEligibleProtagonist
                            ? `${player.name}. Protagonista: +${getPlayerProtagonistScoring(player).hitPoints} si marca o assisteix; ${getPlayerProtagonistScoring(player).missPoints} si no ho fa.`
                            : player.name
                        }
                      >
                        <img
                          src={player.image}
                          className="player-badge-avatar"
                          alt=""
                        />

                        <span>{player.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {protagonistSelectionActive &&
                protagonistPreview &&
                protagonistPreviewScoring && (
                  <div
                    className="protagonist-preview-hud"
                    role="status"
                    aria-live="polite"
                  >
                    <img src={protagonistPreview.image} alt="" />

                    <div>
                      <span>PROTAGONISTA</span>
                      <strong>{protagonistPreview.name}</strong>
                      <small>
                        Clica la xapa per escollir-lo · en mòbil, toca-la de
                        nou.
                      </small>
                    </div>

                    <span className="protagonist-preview-hit">
                      <small>MARCA O ASSISTEIX</small>
                      <strong>+{protagonistPreviewScoring.hitPoints}</strong>
                    </span>

                    <span className="protagonist-preview-miss">
                      <small>NO PARTICIPA EN GOL</small>
                      <strong>{protagonistPreviewScoring.missPoints}</strong>
                    </span>
                  </div>
                )}
            </section>

            <section
              ref={protagonistCardRef}
              className="prediction-card protagonist-card"
            >
              <div className="section-heading">
                <div>
                  <h2>El protagonista</h2>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() => toggleInfoSection("protagonist")}
                    aria-label="Informació sobre el protagonista"
                    aria-expanded={openInfoSection === "protagonist"}
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                <span
                  className={
                    protagonistIsConfirmed || protagonistIsComplete
                      ? "status-pill completed"
                      : "status-pill"
                  }
                >
                  {protagonistIsConfirmed
                    ? "ENVIAT"
                    : protagonistIsComplete
                      ? "FET"
                      : "OPCIONAL"}
                </span>
              </div>

              {openInfoSection === "protagonist" && (
                <div className="section-info-panel" role="note">
                  <strong className="section-info-title">
                    PUNTS DEL PROTAGONISTA
                  </strong>

                  <div className="section-info-protagonist-grid">
                    {PROTAGONIST_GROUP_OPTIONS.filter(
                      (group) => !group.excludesProtagonist,
                    ).map((group) => {
                      const groupPlayers = gamePlayers.filter(
                        (player) =>
                          isPlayerEligibleForProtagonist(player) &&
                          normalizeProtagonistGroupKey(
                            player.protagonistGroupKey,
                          ) === group.key,
                      );

                      if (groupPlayers.length === 0) {
                        return null;
                      }

                      return (
                        <div
                          key={group.key}
                          className={
                            group.key === "special"
                              ? "section-info-points-row special"
                              : "section-info-points-row"
                          }
                        >
                          <span>
                            {groupPlayers
                              .map((player) => player.name)
                              .join(" · ")}
                          </span>

                          <strong>
                            {`+${group.hitPoints} / ${group.missPoints}`}
                          </strong>
                        </div>
                      );
                    })}
                  </div>

                  <small className="section-info-note">
                    El primer número són els punts si marca o assisteix. El
                    segon és la penalització si no participa en cap gol. Gol i
                    assistència no acumulen.
                  </small>
                </div>
              )}

              <div
                className={[
                  "protagonist-combined-rule",
                  protagonistSelectionActive ? "selector-active" : "",
                  protagonistIsComplete ? "selector-selected" : "",
                  protagonistIsConfirmed ? "selector-confirmed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={[
                    "protagonist-selector-button",
                    protagonistSelectionActive ? "active" : "",
                    protagonistIsComplete ? "selected" : "",
                    protagonistIsConfirmed ? "confirmed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={
                    protagonistIsConfirmed ||
                    predictionSubmitting ||
                    countdown.isClosed
                  }
                  onClick={handleProtagonistSelectorClick}
                  aria-pressed={
                    protagonistSelectionActive || protagonistIsComplete
                  }
                  aria-label={
                    protagonistIsConfirmed
                      ? `${protagonist.name}, protagonista enviat`
                      : protagonistIsComplete
                        ? `Treu ${protagonist.name} com a protagonista`
                        : protagonistSelectionActive
                          ? "Desactiva el mode protagonista"
                          : "Activa el mode protagonista"
                  }
                >
                  {protagonistIsComplete ? (
                    <span className="protagonist-selector-player">
                      <img
                        src={protagonist.image}
                        alt=""
                      />

                      <span aria-hidden="true">
                        ★
                      </span>
                    </span>
                  ) : (
                    <span
                      className="protagonist-selector-star"
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  )}
                </button>

                <div className="protagonist-combined-copy">
                  <span>
                    {protagonistIsConfirmed
                      ? "APOSTA ENVIADA"
                      : protagonistIsComplete
                        ? "PROTAGONISTA ESCOLLIT"
                        : protagonistSelectionActive
                                                  ? "MODE PROTAGONISTA ACTIU"
                          : ""}
                  </span>

                  <strong>MARCA O ASSISTEIX</strong>

                  <small>
                    {protagonistIsComplete
                      ? `${protagonist.name} · +${protagonistScoring.hitPoints} si marca o assisteix · ${protagonistScoring.missPoints} si no participa en cap gol.${
                          protagonistIsConfirmed
                            ? " Ja no es pot canviar."
                            : " Clica el cromo amb estrella per desfer."
                        }`
                      : protagonistSelectionActive
                        ? "Passa per sobre d’una xapa per veure el premi i la penalització; clica-la per escollir."
                        : "Clica l’estrella i escull quin jugador creus que marcarà o assistirà."}
                  </small>
                </div>

                <span
                  className={[
                    "protagonist-binary-pill",
                    protagonistSelectionActive ? "active" : "",
                    protagonistIsComplete ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {protagonistIsConfirmed
                    ? "ENVIAT"
                    : protagonistIsComplete
                      ? "ESCOLLIT"
                      : protagonistSelectionActive
                        ? "TRIA UNA XAPA"
                        : "OPCIONAL"}
                </span>
              </div>
            </section>

            <section
              className={[
                "confirm-section",
                confirmationDialogOpen ? "confirming" : "",
                predictionIsComplete ? "confirmed" : "",
                resultIsConfirmed && !predictionIsComplete ? "partial" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="prediction-summary">
                <span>
                  {scoreTouched
                    ? `RESULTAT ${formatPredictionScore(barcaScore, rivalScore)}`
                    : "RESULTAT PENDENT"}
                </span>

                <span>
                  {lineupIsComplete
                    ? "XI 11/11"
                    : `XI ${lineupCount}/11 · OPCIONAL`}
                </span>

                <span>
                  {protagonistIsComplete
                    ? `PROTAGONISTA ${protagonist.shortName.toUpperCase()} · +${protagonistScoring.hitPoints}/${protagonistScoring.missPoints}`
                    : "PROTAGONISTA OPCIONAL"}
                </span>

                <button
                  type="button"
                  className="section-info-button confirm-info-button"
                  onClick={() => toggleInfoSection("confirm")}
                  aria-label="Informació sobre les combinacions de la porra"
                  aria-expanded={openInfoSection === "confirm"}
                  title="Què és obligatori i què és opcional?"
                >
                  i
                </button>
              </div>

              {openInfoSection === "confirm" && (
                <div className="confirm-info-panel" role="note">
                  <strong className="confirm-info-title">
                    ENVIA LA PORRA COM TU VULGUIS
                  </strong>

                  <p className="confirm-info-intro">
                    <strong>Només el resultat és obligatori.</strong> La Lotto
                    Flick i el protagonista són opcionals i els pots afegir per
                    separat o combinar-los.
                  </p>

                  <div className="confirm-info-options">
                    <div className="confirm-info-option">
                      <strong>RESULTAT</strong>

                      <span>La porra mínima i vàlida.</span>
                    </div>

                    <div className="confirm-info-option">
                      <strong>RESULTAT + LOTTO FLICK</strong>

                      <span>
                        La Lotto s’inclou quan completes els 11 titulars.
                      </span>
                    </div>

                    <div className="confirm-info-option">
                      <strong>RESULTAT + PROTAGONISTA</strong>

                      <span>Afegeix qui marcarà o assistirà.</span>
                    </div>

                    <div className="confirm-info-option featured">
                      <strong>PORRA COMPLETA</strong>

                      <span>Resultat + 11 titulars + protagonista.</span>
                    </div>
                  </div>
                </div>
              )}

                         <button
                type="button"
                className="confirm-button"
                disabled={
                  !scoreTouched ||
                  matchLoading ||
                  predictionLoading ||
                  predictionSubmitting ||
                  countdown.isClosed ||
                  authLoading ||
                  authActionLoading ||
                  predictionIsComplete ||
                  (resultIsConfirmed && !hasNewSectionToSubmit)
                }
                onClick={handleConfirmPrediction}
              >
                {confirmButtonLabel}
              </button>
            </section>
          </section>
        )}

        {activePage === "notes" && (
          <section className="notes-page">
            <header className="notes-hero">
              <div className="notes-hero-copy">
                <span className="notes-kicker">LA VEU DE LA CULERADA</span>

                <div className="notes-title-row">
                  <h1>LES NOTES</h1>

                  <button
                    type="button"
                    className="section-info-button notes-info-button"
                    onClick={() => toggleInfoSection("notes")}
                    aria-label="Informació sobre Les Notes"
                    aria-expanded={openInfoSection === "notes"}
                    title="Com funcionen les valoracions?"
                  >
                    i
                  </button>
                </div>

                <p>
                  Deixa anar les teves neures, filies i fòbies i caga't en les de la resta.
                </p>
              </div>

                                        <OfficialMatchCard
                match={notesMatchData || matchData}
                homeScore={
                  notesMatchData?.homeScore ?? officialHomeScore
                }
                awayScore={
                  notesMatchData?.awayScore ?? officialAwayScore
                }
              />
            </header>

            <div
              className="notes-tabs"
              role="tablist"
              aria-label="Tipus de notes"
            >
              <button
                type="button"
                role="tab"
                aria-selected={notesTab === "match"}
                className={
                  notesTab === "match" ? "notes-tab active" : "notes-tab"
                }
                onClick={() => setNotesTab("match")}
              >
                LES NOTES DEL PARTIT
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={notesTab === "season"}
                className={
                  notesTab === "season" ? "notes-tab active" : "notes-tab"
                }
                onClick={() => setNotesTab("season")}
              >
                LES NOTES DE LA TEMPORADA
              </button>
            </div>

            {openInfoSection === "notes" && (
              <section className="notes-information-panel" role="note">
                <div>
                  <span>COM FUNCIONEN LES NOTES</span>
                  <strong>Una valoració real per jugador i partit</strong>
                </div>

                <p>
                  Només apareixen els jugadors que Puntuacions ha marcat com a
                  titulars o suplents amb minuts. El servidor valida i desa cada
                  valoració.
                </p>

                <div className="notes-scale-grid">
                  {RATING_SCALE.map((rating) => (
                    <div key={rating.stars} className="notes-scale-item">
                      <span>{"★".repeat(rating.stars)}</span>
                      <strong>{rating.label}</strong>
                      <small>{rating.value} punts</small>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="notes-board">
              <header className="notes-board-heading">
                <div>
                  <span>
                    {notesTab === "match"
                      ? "VALORA EL PARTIT OFICIAL"
                      : "CLASSIFICACIÓ REAL DE LA TEMPORADA"}
                  </span>

                  <strong>
                    {notesLoading
                      ? "Carregant dades reals..."
                      : `${visibleNotesRows.length} jugadors`}
                  </strong>
                </div>

                <div className="notes-board-actions">
                  <small>MITJANA SOBRE 10</small>

                  {notesTab === "match" && visibleNotesRows.length > 0 && (
                    <button
                      type="button"
                      className={
                        notesRankingRefreshing
                          ? "notes-ranking-refresh-button refreshing"
                          : "notes-ranking-refresh-button"
                      }
                      disabled={
                        notesLoading ||
                        notesRankingRefreshing ||
                        Boolean(ratingSavingPlayerId)
                      }
                      onClick={handleRefreshNotesRanking}
                      aria-label="Actualitza l’ordre del rànquing de Les Notes"
                      title="Reordena els jugadors amb les valoracions més recents"
                    >
                      <span
                        className="notes-ranking-refresh-icon"
                        aria-hidden="true"
                      >
                        ↻
                      </span>

                      <span>
                        {notesRankingRefreshing
                          ? "ACTUALITZANT..."
                          : "ACTUALITZA RÀNQUING"}
                      </span>
                    </button>
                  )}
                </div>
              </header>

              {notesError && (
                <div className="real-data-state error" role="alert">
                  <strong>No s’han pogut carregar Les Notes</strong>
                  <span>{notesError}</span>
                </div>
              )}

              {!notesLoading &&
                !notesError &&
                notesTab === "match" &&
                notesAreClosed && (
                  <div className="real-data-state empty" role="status">
                    <strong>
                      Les Notes de la {notesJornadaLabel} estan tancades
                    </strong>
                    <span>
                      Ja no es poden enviar ni modificar valoracions.
                    </span>
                  </div>
                )}

              {!notesLoading &&
                !notesError &&
                notesTab === "match" &&
                notesAreScheduled && (
                  <div className="real-data-state empty" role="status">
                    <strong>
                      Les Notes de la {notesJornadaLabel} encara no estan obertes
                    </strong>
                  </div>
                )}

              {!notesLoading &&
                !notesError &&
                !notesAreClosed &&
                !notesAreScheduled &&
                visibleNotesRows.length === 0 && (
                <div className="real-data-state empty">
                  <strong>Sense valoracions encara</strong>
                  <span>
                    Quan tinguem les valoracions del primer partit apareixeran aquí.
                  </span>
                </div>
              )}

              <div className="notes-player-list">
                {visibleNotesRows.map((row, index) => (
                  <article
                    key={`${notesTab}-${row.player.id}`}
                    className={
                      notesTab === "season"
                        ? "notes-player-row season-row"
                        : "notes-player-row"
                    }
                  >
                    {notesTab === "season" && (
                      <span className="notes-season-position">
                        {index + 1}
                      </span>
                    )}

                    <div className="notes-player-identity">
                      <PlayerNotesAvatar player={row.player} />

                      <div>
                        <strong>{row.player.name}</strong>
                        <PlayerNotesStats stats={row.stats} mode={notesTab} />
                      </div>
                    </div>

                    <div className="notes-rating-block">
                      <RatingStars
                        value={row.displayStars}
                        readOnly={
                          notesTab === "season" ||
                          notesAreClosed ||
                          notesAreScheduled
                        }
                        onRate={(stars) =>
                          handleRatePlayer(row.player.id, stars)
                        }
                      />

                      <div className="notes-average">
                        <strong>
                          {row.voteCount > 0
                            ? formatRatingAverage(row.average)
                            : "—"}
                        </strong>
                        <span>
                          {row.voteCount > 0
                            ? `${row.voteCount} VOTS`
                            : "SENSE VOTS"}
                        </span>
                      </div>

                      {ratingSavingPlayerId === row.player.id && (
                        <small className="real-inline-saving">GUARDANT...</small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}

        {activePage === "scoring" && isAdmin && (
          <section className="admin-scoring-page">
                       <header className="admin-scoring-hero admin-scoring-hero-compact">
              {adminScoringTab === "match" ? (
                <OfficialMatchCard
                  match={matchData}
                  homeScore={officialHomeScore}
                  awayScore={officialAwayScore}
                  editable
                  onHomeScoreChange={(nextScore) =>
                    updateOfficialMatchScore("home", nextScore)
                  }
                  onAwayScoreChange={(nextScore) =>
                    updateOfficialMatchScore("away", nextScore)
                  }
                />
              ) : adminScoringTab === "players" ? (
                <div className="admin-player-hero-summary">
                  <span>CATÀLEG DINÀMIC</span>
                  <strong>{adminPlayerCatalog.length} jugadors</strong>
                </div>
              ) : (
                <div className="admin-player-hero-summary">
                  <span>CALENDARI REAL</span>
                  <strong>{adminUpcomingMatches.length} partits</strong>
                  <small>
                    Crear, editar i publicar el proper rival de la portada.
                  </small>
                </div>
              )}
            </header>

            <div
              className="admin-area-tabs"
              role="tablist"
            >
              <button
                type="button"
                className={
                  adminScoringTab === "match"
                    ? "admin-area-tab active"
                    : "admin-area-tab"
                }
                onClick={() => setAdminScoringTab("match")}
                role="tab"
                aria-selected={adminScoringTab === "match"}
              >
                PARTIT I PUNTS
              </button>

              <button
                type="button"
                className={
                  adminScoringTab === "players"
                    ? "admin-area-tab active"
                    : "admin-area-tab"
                }
                onClick={() => setAdminScoringTab("players")}
                role="tab"
                aria-selected={adminScoringTab === "players"}
              >
                JUGADORS I XAPES
                {adminBadgeReviewQueue.length > 0 && (
                  <span>{adminBadgeReviewQueue.length}</span>
                )}
              </button>

              <button
                type="button"
                className={
                  adminScoringTab === "upcoming"
                    ? "admin-area-tab active"
                    : "admin-area-tab"
                }
                onClick={() => setAdminScoringTab("upcoming")}
                role="tab"
                aria-selected={adminScoringTab === "upcoming"}
              >
                PROPERS PARTITS
              </button>
            </div>

            {adminScoringTab === "match" ? (
              <>
                <section className="admin-tools-card">
                  <header>
                    <div>
                      <span>EINES OFICIALS</span>
                      <strong>Clica directament a cada jugador</strong>
                    </div>

                    <small>
                      T i S alternen la participació. Gol i assistència sumen
                      amb cada clic; el botó − en resta una.
                    </small>
                  </header>

                  <div className="admin-tool-tray" aria-label="Llegenda d’eines">
                    {ADMIN_SCORING_TOOLS.map((tool) => (
                      <div
                        key={tool.id}
                        className={`admin-tool ${tool.id}`}
                      >
                        {tool.id === "goal" || tool.id === "assist" ? (
                          <ProtagonistEventIcon type={tool.id} />
                        ) : (
                          <ParticipationRoleIcon type={tool.id} />
                        )}
                        <strong>{tool.label}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="admin-live-summary">
                    <span>
                      TITULARS <strong>{adminStarterCount}</strong>
                    </span>
                    <span>
                      SUPLENTS <strong>{adminSubstituteCount}</strong>
                    </span>
                    <span>
                      GOLS <strong>{adminGoalCount}</strong>
                    </span>
                    <span>
                      ASSISTÈNCIES <strong>{adminAssistCount}</strong>
                    </span>
                  </div>
                </section>

                <section className="admin-player-board">
                  <header>
                    <div>
                      <span>PLANTILLA DEL BARÇA</span>
                      <strong>Font oficial del partit</strong>
                    </div>

                    <small>
                      Torna a clicar T o S per desmarcar. T i S són excloents.
                    </small>
                  </header>

                  {gamePlayers.length === 0 ? (
                    <div className="real-data-state empty">
                      <strong>Cap jugador visible en aquest partit</strong>
                      <span>Assigna jugadors des de JUGADORS I XAPES. No s’utilitza cap plantilla provisional.</span>
                    </div>
                  ) : (
                  <div className="admin-player-grid">
                    {gamePlayers.map((player) => {
                      const stats = officialMatchStatsByPlayerId[player.id] || {
                        role: null,
                        goals: 0,
                        assists: 0,
                      };

                      return (
                        <article key={player.id} className="admin-player-card">
                          <div
                            className="admin-player-identity"
                            style={{ gridColumn: "1 / -1" }}
                          >
                            <PlayerNotesAvatar
                              player={player}
                              className="admin"
                            />

                            <div>
                              <strong>{player.name}</strong>
                              <small>
                                {stats.role === "T"
                                  ? "TITULAR"
                                  : stats.role === "S"
                                    ? "SUPLENT AMB MINUTS"
                                    : "SENSE PARTICIPACIÓ MARCADA"}
                              </small>
                            </div>
                          </div>

                          <div className="admin-player-current-stats">
                            <div className="admin-role-controls">
                              <ParticipationRoleIcon
                                type="starter"
                                className={
                                  stats.role === "T"
                                    ? "admin-current-role active"
                                    : "admin-current-role"
                                }
                                pressed={stats.role === "T"}
                                onClick={() =>
                                  applyAdminToolToPlayer(player.id, "starter")
                                }
                                ariaLabel={
                                  stats.role === "T"
                                    ? `Desmarca ${player.name} com a titular`
                                    : `Marca ${player.name} com a titular`
                                }
                              />

                              <ParticipationRoleIcon
                                type="substitute"
                                className={
                                  stats.role === "S"
                                    ? "admin-current-role active"
                                    : "admin-current-role"
                                }
                                pressed={stats.role === "S"}
                                onClick={() =>
                                  applyAdminToolToPlayer(
                                    player.id,
                                    "substitute",
                                  )
                                }
                                ariaLabel={
                                  stats.role === "S"
                                    ? `Desmarca ${player.name} com a suplent`
                                    : `Marca ${player.name} com a suplent`
                                }
                              />
                            </div>

                            <div className="admin-count-control">
                              <ProtagonistEventIcon
                                type="goal"
                                count={stats.goals}
                                className="admin-event-stat"
                                onClick={() =>
                                  applyAdminToolToPlayer(player.id, "goal")
                                }
                                ariaLabel={`Suma un gol a ${player.name}`}
                              />
                              <button
                                type="button"
                                disabled={stats.goals === 0}
                                onClick={() =>
                                  decrementAdminPlayerStat(player.id, "goals")
                                }
                                aria-label={`Resta un gol a ${player.name}`}
                              >
                                −
                              </button>
                            </div>

                            <div className="admin-count-control">
                              <ProtagonistEventIcon
                                type="assist"
                                count={stats.assists}
                                className="admin-event-stat"
                                onClick={() =>
                                  applyAdminToolToPlayer(player.id, "assist")
                                }
                                ariaLabel={`Suma una assistència a ${player.name}`}
                              />
                              <button
                                type="button"
                                disabled={stats.assists === 0}
                                onClick={() =>
                                  decrementAdminPlayerStat(
                                    player.id,
                                    "assists",
                                  )
                                }
                                aria-label={`Resta una assistència a ${player.name}`}
                              >
                                −
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  )}
                </section>

                <section className="admin-publish-card">
                  <div className="admin-publish-copy">
                    <span>FONT OFICIAL ÚNICA</span>
                    <strong>
                      Guarda el partit i recalcula totes les puntuacions
                    </strong>
                    <small>
                      Les Notes, el Rànquing i el Perfil llegeixen aquest mateix
                      resultat, els mateixos titulars i els mateixos
                      esdeveniments.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="admin-publish-button"
                    disabled={officialMatchSaving}
                    onClick={handleSaveOfficialMatch}
                  >
                    {officialMatchSaving
                      ? "GUARDANT I CALCULANT..."
                      : "GUARDA I CALCULA TOTES LES PUNTUACIONS"}
                  </button>

                  {officialMatchFeedback?.message && (
                    <div
                      className={`admin-publish-feedback ${officialMatchFeedback.type}`}
                      role={
                        officialMatchFeedback.type === "error"
                          ? "alert"
                          : "status"
                      }
                    >
                      {officialMatchFeedback.message}
                    </div>
                  )}
                </section>
              </>
            ) : adminScoringTab === "players" ? (
              <section className="admin-player-workspace">
                <input
                  ref={adminPlayerFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="admin-hidden-file-input"
                  onChange={handleAdminPlayerSourceFile}
                />

                {adminPlayerFeedback?.message && (
                  <div
                    className={`admin-player-feedback ${adminPlayerFeedback.type}`}
                    role={
                      adminPlayerFeedback.type === "error" ? "alert" : "status"
                    }
                  >
                    {adminPlayerFeedback.message}
                  </div>
                )}

                <section className="admin-create-player-card">
                  <header>
                    <div>
                      <span>NOU FITXATGE</span>
                      <strong>Afegeix un jugador al catàleg</strong>
                    </div>
                  </header>

                  <form
                    className="admin-create-player-form"
                    onSubmit={handleCreateAdminPlayer}
                  >
                    <label>
                      <span>NOM COMPLET *</span>
                      <input
                        type="text"
                        value={adminPlayerForm.displayName}
                        onChange={(event) =>
                          setAdminPlayerForm({
                            displayName: event.target.value,
                          })
                        }
                        placeholder="Hèctor Fort"
                        maxLength={80}
                        required
                      />
                    </label>

                    <button type="submit" disabled={adminPlayerCreating}>
                      {adminPlayerCreating
                        ? "CREANT JUGADOR..."
                        : "+ AFEGEIX JUGADOR"}
                    </button>
                  </form>
                </section>

                {adminBadgeReviewQueue.length > 0 && (
                  <section className="admin-review-board">
                    <header>
                      <div>
                        <span>REVISIÓ OBLIGATÒRIA</span>
                        <strong>
                          {adminBadgeReviewQueue.length} xapa
                          {adminBadgeReviewQueue.length === 1 ? "" : "es"}
                          pendent
                          {adminBadgeReviewQueue.length === 1 ? "" : "s"}
                        </strong>
                      </div>
                      <small>
                        Res no es publica fins que tu prems APROVA I PUBLICA.
                      </small>
                    </header>

                    <div className="admin-review-grid">
                      {adminBadgeReviewQueue.map((job) => (
                        <article
                          key={job.job_id}
                          className="admin-review-card"
                        >
                          <div className="admin-review-preview">
                            {adminPreviewUrlsByJobId[job.job_id] ? (
                              <img
                                src={adminPreviewUrlsByJobId[job.job_id]}
                                alt={`Previsualització de ${job.display_name}`}
                              />
                            ) : (
                              <span>PREVIEW</span>
                            )}
                          </div>

                          <div className="admin-review-copy">
                            <span>{job.processing_mode}</span>
                            <strong>{job.display_name}</strong>
                            <small>
                              Estat · {job.review_status || "pending"}
                            </small>
                          </div>

                          <div className="admin-review-actions">
                            <button
                              type="button"
                              className="approve"
                              disabled={adminPlayerBusyId === job.player_id}
                              onClick={() =>
                                handleAdminBadgeDecision(job, "approve")
                              }
                            >
                              APROVA I PUBLICA
                            </button>

                            <button
                              type="button"
                              className="reject"
                              disabled={adminPlayerBusyId === job.player_id}
                              onClick={() =>
                                handleAdminBadgeDecision(job, "reject")
                              }
                            >
                              REBUTJA
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                <section className="admin-catalog-board">
                  <header>
                    <div>
                      <span>CATÀLEG GENERAL</span>
                      <strong>Jugadors, xapes i visibilitat del partit</strong>
                    </div>

                    <button
                      type="button"
                      className="admin-refresh-catalog"
                      disabled={adminPlayerCatalogLoading}
                      onClick={() => loadAdminPlayerWorkspace()}
                    >
                      {adminPlayerCatalogLoading
                        ? "CARREGANT..."
                        : "↻ ACTUALITZA"}
                    </button>
                  </header>

                  {adminPlayerCatalogLoading ? (
                    <div className="admin-catalog-empty">
                      Carregant el catàleg segur…
                    </div>
                  ) : adminPlayerCatalog.length === 0 ? (
                    <div className="admin-catalog-empty">
                      Encara no hi ha jugadors al catàleg. Crea el primer a
                      sobre.
                    </div>
                  ) : (
                    <div className="admin-catalog-grid">
                      {adminPlayerCatalog.map((player) => {
                        const isBusy = adminPlayerBusyId === player.playerId;
                        const hasPortrait = Boolean(player.portraitPath);

                        return (
                          <article
                            key={player.playerId}
                            className={
                              player.catalogStatus === "archived"
                                ? "admin-catalog-player archived"
                                : "admin-catalog-player"
                            }
                          >
                            <div className="admin-catalog-player-top">
                              <div className="admin-catalog-portrait">
                                {player.portraitUrl ? (
                                  <img
                                    src={player.portraitUrl}
                                    alt=""
                                    loading="lazy"
                                  />
                                ) : (
                                  <span>
                                    {getRankingInitials(player.displayName)}
                                  </span>
                                )}
                              </div>

                              <div className="admin-catalog-player-copy">
                                <span>
                                  {player.shirtNumber
                                    ? `DORSAL ${player.shirtNumber}`
                                    : "SENSE DORSAL"}
                                </span>
                                <strong>{player.displayName}</strong>
                                <small>{player.playerKey}</small>
                              </div>

                              <span
                                className={`admin-catalog-status ${
                                  player.catalogStatus || "active"
                                }`}
                              >
                                {player.catalogStatus || "active"}
                              </span>
                            </div>

                            <div className="admin-catalog-flags">
                              <span className={hasPortrait ? "ok" : "pending"}>
                                {hasPortrait ? "XAPA PUBLICADA" : "SENSE XAPA"}
                              </span>
                              <span
                                className={
                                  player.assignedToMatch ? "ok" : "pending"
                                }
                              >
                                {player.assignedToMatch
                                  ? "AL PARTIT"
                                  : "FORA DEL PARTIT"}
                              </span>
                              <span
                                className={
                                  player.isPublicVisible ? "ok" : "pending"
                                }
                              >
                                {player.isPublicVisible
                                  ? "VISIBLE"
                                  : "OCULT"}
                              </span>
                            </div>

                            {player.badgeProcessingError && (
                              <div className="admin-catalog-error">
                                {player.badgeProcessingError}
                              </div>
                            )}

                            <div className="admin-catalog-actions primary">
                              <button
                                type="button"
                                className="upload"
                                disabled={isBusy}
                                onClick={() =>
                                  openAdminPlayerUpload(player.playerId)
                                }
                              >
                                {isBusy
                                  ? "PROCESSANT..."
                                  : hasPortrait
                                    ? "CANVIA LA XAPA"
                                    : "PUJA LA XAPA"}
                              </button>

                              {player.assignedToMatch ? (
                                <button
                                  type="button"
                                  className="remove"
                                  disabled={isBusy}
                                  onClick={() =>
                                    removeAdminMatchPlayer(player)
                                  }
                                >
                                  TREU DEL PARTIT
                                </button>
                              ) : (
                                                             <button
                                  type="button"
                                  className="assign"
                                  disabled={isBusy}
                                  onClick={() =>
                                    saveAdminMatchPlayer(player, {
                                      isPublicVisible: true,
                                      eligibleForLineup: true,
                                      eligibleForRatings: true,
                                      protagonistGroupKey:
                                        player.protagonistGroupKey || "e",
                                    })
                                  }
                                >
                                  AFEGEIX AL PARTIT
                                </button>
                              )}
                            </div>

                            {player.assignedToMatch && (
                              <div className="admin-jornada-controls">
                                <label className="admin-jornada-visibility">
                                  <input
                                    type="checkbox"
                                    checked={player.isPublicVisible}
                                    disabled={isBusy || !hasPortrait}
                                    onChange={(event) =>
                                      saveAdminMatchPlayer(player, {
                                        isPublicVisible: event.target.checked,
                                      })
                                    }
                                  />

                                  <span>
                                    <strong>VISIBLE A LA JORNADA</strong>
                                    <small>
                                      Activa XI, protagonista i Les Notes del
                                      partit. En desactivar-lo desapareix de
                                      totes tres opcions d’aquesta jornada.
                                    </small>
                                  </span>
                                </label>

                                <div className="admin-protagonist-group-control">
                                  <label
                                    htmlFor={`protagonist-group-${player.playerId}`}
                                  >
                                    GRUP DE PROTAGONISTA
                                  </label>

                                  <div>
                                    <select
                                      id={`protagonist-group-${player.playerId}`}
                                      value={normalizeProtagonistGroupKey(
                                        player.protagonistGroupKey,
                                      )}
                                      disabled={isBusy}
                                      onChange={(event) =>
                                        saveAdminMatchPlayer(player, {
                                          protagonistGroupKey:
                                            event.target.value,
                                        })
                                      }
                                    >
                                      {PROTAGONIST_GROUP_OPTIONS.map((group) => (
                                        <option key={group.key} value={group.key}>
                                          {group.label}
                                        </option>
                                      ))}
                                    </select>

                                    {(() => {
                                      const group =
                                        PROTAGONIST_GROUP_BY_KEY[
                                          normalizeProtagonistGroupKey(
                                            player.protagonistGroupKey,
                                          )
                                        ];

                                      return (
                                        <span className="admin-protagonist-group-points">
                                          <strong>+{group.hitPoints}</strong>
                                          <small>si encerta</small>
                                          <strong>{group.missPoints}</strong>
                                          <small>si falla</small>
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}

                                                        <button
                              type="button"
                              className="admin-archive-player"
                              disabled={isBusy}
                              onClick={() =>
                                toggleAdminPlayerArchive(player)
                              }
                            >
                              {player.catalogStatus === "archived"
                                ? "REACTIVA JUGADOR"
                                : "ARXIVA JUGADOR"}
                            </button>

                            {player.catalogStatus === "archived" && (
                              <button
                                type="button"
                                className="admin-archive-player"
                                disabled={isBusy}
                                onClick={() =>
                                  handleDeleteUnusedPlayer(player)
                                }
                                style={{
                                  marginTop: "8px",
                                  background: "#7f1d1d",
                                  borderColor: "#7f1d1d",
                                  color: "#ffffff",
                                }}
                              >
                                ELIMINA DEFINITIVAMENT
                              </button>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </section>
            ) : (
              <section className="admin-player-workspace" role="tabpanel">
                {adminMatchFeedback?.message && (
                  <div
                    className={`admin-player-feedback ${adminMatchFeedback.type}`}
                    role={
                      adminMatchFeedback.type === "error" ? "alert" : "status"
                    }
                  >
                    {adminMatchFeedback.message}
                  </div>
                )}

                <section className="admin-create-player-card admin-upcoming-match-card">
                  <header>
                    <div>
                      <span>
                        {adminMatchForm.matchId
                          ? "EDITA PARTIT"
                          : "NOU PROPER PARTIT"}
                      </span>
                      <strong>Temporada, nom, colors, local o visitant i data</strong>
                    </div>

                    <small>
                      La jornada es calcula automàticament dins de la temporada.
                      L’hora escrita s’interpreta sempre
                      com a Europe/Madrid.
                    </small>
                  </header>

                  <form
                    className="admin-upcoming-match-form"
                    onSubmit={handleSaveAdminMatch}
                  >
                    <label className="admin-upcoming-field admin-upcoming-rival-name">
                      <span>NOM DEL RIVAL</span>
                      <input
                        type="text"
                        value={adminMatchForm.rivalName}
                        onChange={(event) =>
                          updateAdminMatchForm("rivalName", event.target.value)
                        }
                        placeholder="Nom del rival"
                        maxLength={100}
                        required
                      />
                    </label>

                    <div
                      className="admin-upcoming-field"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="admin-upcoming-field-label">
                        TEMPORADA DE VESALAPORRA
                      </span>

                      <div
                        className="admin-home-away-toggle"
                        role="group"
                        aria-label="Temporada del partit"
                      >
                        {ADMIN_MATCH_SEASON_OPTIONS.map((seasonOption) => (
                          <button
                            key={seasonOption.value}
                            type="button"
                            className={
                              adminMatchForm.seasonKey === seasonOption.value
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              updateAdminMatchForm(
                                "seasonKey",
                                seasonOption.value,
                              )
                            }
                          >
                            {seasonOption.label}
                          </button>
                        ))}
                      </div>

                      <small style={{ display: "block", marginTop: "8px" }}>
                        La jornada serà correlativa dins de la temporada triada,
                        sigui Lliga, Copa, Supercopa o Champions.
                      </small>
                    </div>

                    <div className="admin-upcoming-field">
  <span className="admin-upcoming-field-label">COLORS</span>

  <details className="admin-color-picker">
    <summary>
      <span className="admin-color-picker-preview">
        {adminMatchForm.rivalColors.length > 0 ? (
          <i
            style={{
              background: getTeamBadgeBackground(
                "rival",
                adminMatchForm.rivalColors,
                adminMatchForm.rivalPattern,
              ),
            }}
            aria-hidden="true"
          ></i>
        ) : (
          <i className="empty" aria-hidden="true"></i>
        )}
      </span>

      <strong>
        {adminMatchForm.rivalColors.length === 0
          ? "TRIA LLIS O FRANGES"
          : adminMatchForm.rivalPattern === "striped"
            ? `4 FRANGES · ${adminMatchForm.rivalColors.length}/2 COLORS`
            : adminMatchForm.rivalColors.length === 1
              ? "LLIS · 1 COLOR TRIAT"
              : "LLIS · 2 COLORS TRIATS"}
      </strong>

      <span aria-hidden="true">⌄</span>
    </summary>

    <div
      className="admin-color-palette"
      style={{
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gap: "6px",
        padding: "10px",
      }}
    >
      <div
        className="admin-home-away-toggle"
        role="group"
        aria-label="Tipus visual de l'equip rival"
        style={{
          gridColumn: "1 / -1",
          marginBottom: "3px",
        }}
      >
        <button
          type="button"
          className={
            adminMatchForm.rivalPattern === "solid"
              ? "active"
              : ""
          }
          onClick={() => updateAdminMatchPattern("solid")}
        >
          LLIS
        </button>

        <button
          type="button"
          className={
            adminMatchForm.rivalPattern === "striped"
              ? "active"
              : ""
          }
          onClick={() => updateAdminMatchPattern("striped")}
        >
          4 FRANGES
        </button>
      </div>

      {ADMIN_MATCH_COLOR_OPTIONS.map((colorOption) => {
        const selectedIndex =
          adminMatchForm.rivalColors.indexOf(
            colorOption.value,
          );

        return (
          <button
            key={colorOption.value}
            type="button"
            className={
              selectedIndex >= 0
                ? "admin-color-swatch selected"
                : "admin-color-swatch"
            }
            onClick={() =>
              toggleAdminMatchColor(colorOption.value)
            }
            title={colorOption.label}
            aria-label={`Tria ${colorOption.label}`}
            aria-pressed={selectedIndex >= 0}
            style={{
              "--swatch-color": colorOption.value,
              minWidth: 0,
              minHeight: "30px",
              borderRadius: "8px",
            }}
          >
            {selectedIndex >= 0 && (
              <span>{selectedIndex + 1}</span>
            )}
          </button>
        );
      })}
    </div>

    <small>
      {adminMatchForm.rivalPattern === "striped"
        ? "FRANGES: tria exactament 2 colors i es dibuixaran 4 franges alternades."
        : "LLIS: amb 1 color surt tot del mateix color; amb 2 colors surt 3/4 del primer i 1/4 del segon."}
    </small>
  </details>
</div>

                    <div className="admin-upcoming-field">
                      <span className="admin-upcoming-field-label">
                        LOCAL O VISITANT
                      </span>

                      <div
                        className="admin-home-away-toggle"
                        role="group"
                        aria-label="Posició del Barça al partit"
                      >
                        <button
                          type="button"
                          className={
                            adminMatchForm.barcaSide === "home" ? "active" : ""
                          }
                          onClick={() =>
                            updateAdminMatchForm("barcaSide", "home")
                          }
                        >
                          BARÇA LOCAL
                        </button>

                        <button
                          type="button"
                          className={
                            adminMatchForm.barcaSide === "away" ? "active" : ""
                          }
                          onClick={() =>
                            updateAdminMatchForm("barcaSide", "away")
                          }
                        >
                          BARÇA VISITANT
                        </button>
                      </div>
                    </div>

                    <div className="admin-upcoming-field">
                      <span className="admin-upcoming-field-label">
                        PUNTS DEL PARTIT
                      </span>

                      <div
                        className="admin-home-away-toggle"
                        role="group"
                        aria-label="Multiplicador de punts del partit"
                      >
                        <button
                          type="button"
                          className={
                            adminMatchForm.pointsMultiplier === 1
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            updateAdminMatchForm("pointsMultiplier", 1)
                          }
                        >
                          NORMAL
                        </button>

                        <button
                          type="button"
                          className={
                            adminMatchForm.pointsMultiplier === 2
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            updateAdminMatchForm("pointsMultiplier", 2)
                          }
                        >
                          🔥 PUNTS x2
                        </button>
                      </div>

                      <small
                        style={{
                          display: "block",
                          marginTop: "8px",
                          color:
                            adminMatchForm.pointsMultiplier === 2
                              ? "#f4cf36"
                              : undefined,
                          fontWeight:
                            adminMatchForm.pointsMultiplier === 2
                              ? 800
                              : undefined,
                        }}
                      >
                        {adminMatchForm.pointsMultiplier === 2
                          ? "Es doblaran tots els punts positius i negatius."
                          : "S’aplicarà la puntuació habitual."}
                      </small>
                    </div>

                    <label className="admin-upcoming-field">
                      <span>DATA</span>
                      <input
                        type="text"
                        inputMode="text"
                        value={adminMatchForm.kickoffText}
                        onChange={(event) =>
                          updateAdminMatchForm(
                            "kickoffText",
                            event.target.value,
                          )
                        }
                        placeholder="31/7/26 i 20:45"
                        maxLength={24}
                        required
                      />
                    </label>

                    <div className="admin-upcoming-preview-card">
  <span>PREVISUALITZACIÓ</span>

  <strong
    style={{
      alignSelf: "center",
      color: "#f4cf36",
      fontSize: "0.8rem",
      letterSpacing: "0.08em",
      textAlign: "center",
    }}
  >
    {getAdminMatchSeasonLabel(adminMatchForm.seasonKey)} ·{" "}
    {adminMatchForm.matchId
      ? `JORNADA ${
          adminUpcomingMatches.find(
            (match) => match.matchId === adminMatchForm.matchId,
          )?.seasonMatchNo || "—"
        }`
      : "JORNADA AUTOMÀTICA"}
  </strong>

  <div className="admin-upcoming-preview-match">
    {adminMatchForm.barcaSide === "home" ? (
      <>
        <div>
          <TeamColorBadge
            teamId="barcelona"
            colors={teamBadgeVisualsById.barcelona.colors}
          />
          <strong>Barça</strong>
        </div>

        <b>VS</b>

        <div>
          <TeamColorBadge
            teamId={
              slugifyTeamKey(adminMatchForm.rivalName) ||
              "rival"
            }
            colors={adminMatchForm.rivalColors}
            pattern={adminMatchForm.rivalPattern}
          />
          <strong>
            {adminMatchForm.rivalName.trim() || "Rival"}
          </strong>
        </div>
      </>
    ) : (
      <>
        <div>
          <TeamColorBadge
            teamId={
              slugifyTeamKey(adminMatchForm.rivalName) ||
              "rival"
            }
            colors={adminMatchForm.rivalColors}
            pattern={adminMatchForm.rivalPattern}
          />
          <strong>
            {adminMatchForm.rivalName.trim() || "Rival"}
          </strong>
        </div>

        <b>VS</b>

        <div>
          <TeamColorBadge
            teamId="barcelona"
            colors={teamBadgeVisualsById.barcelona.colors}
          />
          <strong>Barça</strong>
        </div>
      </>
    )}
  </div>

  <small>
    {adminMatchForm.kickoffText.trim() ||
      "31/7/26 i 20:45"}
  </small>

  {adminMatchForm.pointsMultiplier === 2 && (
    <strong
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: "10px",
        padding: "7px 12px",
        border: "1px solid rgba(244, 207, 54, 0.62)",
        borderRadius: "999px",
        background: "rgba(244, 207, 54, 0.12)",
        color: "#f4cf36",
        fontSize: "0.78rem",
        letterSpacing: "0.08em",
      }}
    >
      🔥 PARTIT DOBLE · PUNTS x2
    </strong>
  )}
</div>

                    <div className="admin-upcoming-form-actions">
                      <button type="submit" disabled={adminMatchSaving}>
                        {adminMatchSaving
                          ? "GUARDANT PARTIT..."
                          : adminMatchForm.matchId
                            ? "GUARDA ELS CANVIS"
                            : "+ CREA EL PARTIT"}
                      </button>

                      {adminMatchForm.matchId && (
                        <button
                          type="button"
                          className="secondary"
                          disabled={adminMatchSaving}
                          onClick={resetAdminMatchForm}
                        >
                          CANCEL·LA EDICIÓ
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="admin-catalog-board">
                  <header>
                    <div>
                      <span>CALENDARI</span>
                      <strong>Propers partits reals</strong>
                    </div>

                    <button
                      type="button"
                      className="admin-refresh-catalog"
                      disabled={adminMatchesLoading}
                      onClick={() => loadAdminUpcomingMatches()}
                    >
                      {adminMatchesLoading ? "CARREGANT..." : "↻ ACTUALITZA"}
                    </button>
                  </header>

                  {adminMatchesLoading ? (
                    <div className="admin-catalog-empty">
                      Carregant el calendari segur…
                    </div>
                  ) : adminUpcomingMatches.length === 0 ? (
                    <div className="admin-catalog-empty">
                      Encara no hi ha propers partits.
                    </div>
                  ) : (
                    <div className="admin-catalog-grid">
                      {adminUpcomingMatches.map((match) => {
                        const isPublicCurrent =
                          match.isCurrent || match.matchId === matchData.id;

                        return (
                          <article
                            key={match.matchId}
                            className="admin-catalog-player"
                          >
                            <div className="admin-catalog-player-top">
                                                         <div
                                className="admin-catalog-portrait"
                                style={{
                                  background: getTeamBadgeBackground(
                                    match.rivalTeamKey,
                                    match.rivalColors,
                                    match.rivalPattern,
                                  ),
                                }}
                                aria-hidden="true"
                              ></div>

                              <div className="admin-catalog-player-copy">
                                <span>
                                  {match.barcaSide === "home"
                                    ? "BARÇA LOCAL"
                                    : "BARÇA VISITANT"}
                                </span>
                                <strong>{match.rivalDisplayName}</strong>
                                <small>
                                  {formatCurrentMatchKickoffLabel(
                                    match.kickoffAt,
                                  )}
                                </small>
                              </div>

                              <span
                                className={`admin-catalog-status ${
                                  isPublicCurrent ? "active" : "scheduled"
                                }`}
                              >
                                {isPublicCurrent
                                  ? "PORTADA ACTUAL"
                                  : match.status}
                              </span>
                            </div>

                            <div className="admin-catalog-flags">
                              <span className="ok">
                                {match.seasonName ||
                                  getAdminMatchSeasonLabel(match.seasonKey)}
                                {" · JORNADA "}
                                {match.seasonMatchNo || "—"}
                              </span>
                              <span className="ok">
                                {match.competitionName || "SENSE COMPETICIÓ"}
                              </span>
                              <span className="ok">
                                {match.venueName || "SEU PENDENT"}
                              </span>
                              <span
                                className={
                                  match.predictionsAreOpen ? "ok" : "pending"
                                }
                              >
                                {match.predictionsAreOpen
                                  ? "PORRA OBERTA"
                                  : "PORRA NO OBERTA"}
                              </span>

                              {match.pointsMultiplier === 2 && (
                                <span
                                  className="ok"
                                  style={{
                                    borderColor: "rgba(244, 207, 54, 0.62)",
                                    background: "rgba(244, 207, 54, 0.12)",
                                    color: "#f4cf36",
                                  }}
                                >
                                  🔥 PARTIT DOBLE · x2
                                </span>
                              )}
                            </div>

                                                        <div className="admin-catalog-actions primary">
                              <button
                                type="button"
                                className="upload"
                                disabled={
                                  adminMatchSaving ||
                                  Boolean(adminDeletingMatchId)
                                }
                                onClick={() =>
                                  editAdminMatch(match)
                                }
                              >
                                EDITA PARTIT
                              </button>

                              <button
                                type="button"
                                className="remove"
                                disabled={
                                  adminMatchSaving ||
                                  Boolean(adminDeletingMatchId)
                                }
                                onClick={() =>
                                  handleDeleteUnusedMatch(match)
                                }
                              >
                                {adminDeletingMatchId === match.matchId
                                  ? "ELIMINANT..."
                                  : "ELIMINA PARTIT"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </section>
            )}
          </section>
        )}

        {activePage === "ranking" && (
          <section className="ranking-page">
            <header className="ranking-hero">
              <div className="ranking-hero-top">
                               <div>
                  <span className="ranking-kicker">
                    LA CLASSIFICACIÓ DE LA CULERADA
                  </span>

                  <div className="notes-title-row">
                    <h1>RÀNQUING</h1>

                    <button
                      type="button"
                      className="section-info-button"
                      onClick={() =>
                        toggleInfoSection("ranking")
                      }
                      aria-label="Informació sobre el rànquing i els desempats"
                      aria-expanded={
                        openInfoSection === "ranking"
                      }
                      title="Com s’ordena la classificació?"
                    >
                      i
                    </button>
                  </div>

                                   <p>
                    El futbol et torna el que li dones. I qui es lleva molt molt aviat, tal.
                  </p>
                </div>
              </div>

              {currentRankingUser && (
                <button
                  type="button"
                  className="ranking-current-user"
                  onClick={() => openRankingProfile(currentRankingUser.id)}
                >
                  <RankingAvatar user={currentRankingUser} size="large" />

                  <span className="ranking-current-copy">
                    <small>LA TEVA POSICIÓ</small>
                    <strong>
                      <span>{currentRankingUser.displayName}</span>
                      <RankingAchievementIcons
                        achievements={getRankingAchievements(currentRankingUser)}
                        className="current-user-icons"
                      />
                    </strong>
                  </span>

                  <span className="ranking-current-stat">
                    <small>POSICIÓ</small>
                    <strong>
                      {currentRankingPosition > 0
                        ? `#${currentRankingPosition}`
                        : "—"}
                    </strong>
                  </span>

                  <span className="ranking-current-stat points">
                    <small>PUNTS</small>
                    <strong>
                      {currentRankingUser[rankingTab].totalPoints}
                    </strong>
                  </span>
                </button>
                           )}
            </header>

            {openInfoSection === "ranking" && (
  <div
    className="section-info-panel"
    role="note"
    style={{
      width: "calc(100% - 56px)",
      maxWidth: "none",
      margin: "0 auto 18px",
      boxSizing: "border-box",
    }}
  >
                <strong className="section-info-title">
                  {rankingTab === "general"
                    ? "CRITERIS DE CLASSIFICACIÓ GENERAL I DESEMPAT"
                    : "CRITERIS DE LA JORNADA I DESEMPAT"}
                </strong>

                {rankingTab === "general" ? (
                  <>
                    <div className="section-info-points-list">
                      <div className="section-info-points-row featured">
                        <span>1. Més punts totals</span>
                        <strong>1r</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>2. Més jornades guanyades</span>
                        <strong>2n</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>
                          3. Més medalles desbloquejades
                        </span>
                        <strong>3r</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>4. Més punts de Resultat</span>
                        <strong>4t</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>5. Més punts d’XI</span>
                        <strong>5è</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>
                          6. Més punts de Protagonista
                        </span>
                        <strong>6è</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>
                          7. Major participació a la porra
                        </span>
                        <strong>7è</strong>
                      </div>
                    </div>

                    <small className="section-info-note">
                      Els criteris s’apliquen exactament en aquest
                      ordre i només dins de la temporada activa.
                      Participació significa porres confirmades
                      vàlides. Després de sis partits consecutius
                      sense participar, el compte deixa d’aparèixer
                      fins que torna a confirmar una porra.
                    </small>
                  </>
                ) : (
                  <>
                    <div className="section-info-points-list">
                      <div className="section-info-points-row featured">
                        <span>1. Més punts totals de la jornada</span>
                        <strong>1r</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>2. Més punts de Resultat</span>
                        <strong>2n</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>3. Més punts d’XI</span>
                        <strong>3r</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>
                          4. Més punts de Protagonista
                        </span>
                        <strong>4t</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>5. Aposta enviada abans</span>
                        <strong>5è</strong>
                      </div>

                      <div className="section-info-points-row">
                        <span>
                          6. UUID com a últim desempat tècnic
                        </span>
                        <strong>6è</strong>
                      </div>
                    </div>

                    <small className="section-info-note">
                      A la jornada només hi ha un guanyador.
                      Si dos o més culers acaben amb els mateixos
                      punts, el desempat segueix exactament aquest
                      ordre: Resultat, XI, Protagonista, hora
                      d’enviament i, només si encara persistís
                      l’empat, UUID.
                    </small>
                  </>
                )}
              </div>
            )}

            <div
              className="ranking-tabs"
              role="tablist"
              aria-label="Tipus de rànquing"
            >
              <button
                type="button"
                role="tab"
                aria-selected={rankingTab === "general"}
                className={
                  rankingTab === "general"
                    ? "ranking-tab active"
                    : "ranking-tab"
                }
                onClick={() => changeRankingTab("general")}
              >
                GENERAL
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={rankingTab === "jornada"}
                className={
                  rankingTab === "jornada"
                    ? "ranking-tab active"
                    : "ranking-tab"
                }
                onClick={() => changeRankingTab("jornada")}
              >
                JORNADA
              </button>
            </div>

            <section className="ranking-board">
              <header className="ranking-board-heading">
  <div>
    <span>
     {rankingTab === "general"
  ? "CLASSIFICACIÓ GENERAL"
  : rankingJornadaNumber
    ? `JORNADA ${rankingJornadaNumber}`
    : "JORNADA"}
    </span>
    {rankingLoading && (
  <strong>Carregant rànquing real...</strong>
)}
  </div>
  <small>ES CARREGA DE 20 EN 20</small>
</header>
              {rankingError && (
                <div className="real-data-state error" role="alert">
                  <strong>No s’ha pogut carregar el rànquing</strong>
                  <span>{rankingError}</span>
                </div>
              )}

              {!rankingLoading && !rankingError && rankingRows.length === 0 && (
                <div className="real-data-state empty">
                  <strong>Encara no hi ha cap jornada puntuada</strong>
                  <span>
                    El rànquing començarà quan Puntuacions publiqui el primer
                    resultat oficial.
                  </span>
                </div>
              )}

              {rankingRows.length > 0 && (
                <>
                  <div className="ranking-table-head" aria-hidden="true">
                    <span>POS</span>
                    <span>CULER</span>
                    <span>RESULTAT</span>
                    <span>XI</span>
                    <span>PROTAGONISTA</span>
                    <span>PTS</span>
                  </div>

                  <div className="ranking-list">
                    {visibleRankingRows.map((user, index) => {
                                            const position = index + 1;
                      const points = user[rankingTab];
                      const movement =
                        rankingTab === "general"
                          ? user.generalMovement
                          : null;
                      const showMovement =
                        Number.isFinite(movement) && movement !== 0;
                      const medal =
                        position === 1
                          ? "🥇"
                          : position === 2
                            ? "🥈"
                            : position === 3
                              ? "🥉"
                              : null;

                      return (
                        <article
                          key={`${rankingTab}-${user.id}`}
                          className={[
                            "ranking-row",
                            user.isCurrentUser ? "current-user" : "",
                            position <= 3 ? "podium" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                                                    <span
                            className="ranking-position"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {medal ? (
                                <span className="ranking-medal">{medal}</span>
                              ) : (
                                position
                              )}
                            </span>

                            {showMovement && (
                              <span
                                className={`ranking-movement ${
                                  movement > 0 ? "up" : "down"
                                }`}
                                aria-label={
                                  movement > 0
                                    ? `Ha pujat ${movement} posicions`
                                    : `Ha baixat ${Math.abs(movement)} posicions`
                                }
                                title={
                                  movement > 0
                                    ? `Ha pujat ${movement} posicions`
                                    : `Ha baixat ${Math.abs(movement)} posicions`
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "2px",
                                  minWidth: "30px",
                                  padding: "3px 5px",
                                  borderRadius: "999px",
                                  border:
                                    movement > 0
                                      ? "1px solid rgba(74, 222, 128, 0.5)"
                                      : "1px solid rgba(251, 113, 133, 0.52)",
                                  background:
                                    movement > 0
                                      ? "linear-gradient(135deg, rgba(20, 138, 83, 0.34), rgba(34, 197, 94, 0.14))"
                                      : "linear-gradient(135deg, rgba(190, 24, 93, 0.34), rgba(239, 68, 68, 0.14))",
                                  color:
                                    movement > 0 ? "#86efac" : "#fda4af",
                                  boxShadow:
                                    movement > 0
                                      ? "0 0 12px rgba(34, 197, 94, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                                      : "0 0 12px rgba(244, 63, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                                  fontSize: "10px",
                                  fontWeight: 900,
                                  lineHeight: 1,
                                  letterSpacing: "-0.02em",
                                }}
                              >
                                <span
                                  aria-hidden="true"
                                  style={{ fontSize: "12px", lineHeight: 1 }}
                                >
                                  {movement > 0 ? "↑" : "↓"}
                                </span>

                                <span>{Math.abs(movement)}</span>
                              </span>
                            )}
                          </span>

                          <button
                            type="button"
                            className="ranking-identity"
                            onClick={() => openRankingProfile(user.id)}
                          >
                            <RankingAvatar user={user} />

                                                    <span className="ranking-identity-copy">
                              <strong>
                                <span className="ranking-name-text">
                                  {user.displayName}
                                </span>

                                <RankingAchievementIcons
                                  achievements={getRankingAchievements(user)}
                                  className="ranking-row-medals"
                                />

                                {user.isCurrentUser && (
                                  <span className="ranking-you-badge">TU</span>
                                )}
                              </strong>

                              {user.hasXIdentity && user.handle && (
                                <small>
                                  <span aria-hidden="true">𝕏</span>
                                  {user.handle}
                                </small>
                              )}

                            </span>
                          </button>

                          <span
                            className="ranking-breakdown result"
                            data-label="RESULTAT"
                          >
                            {points.resultPoints}
                          </span>
                          <span
                            className="ranking-breakdown xi"
                            data-label="XI"
                          >
                            {points.xiPoints}
                          </span>
                          <span
                            className="ranking-breakdown protagonist"
                            data-label="PROTAGONISTA"
                          >
                            {points.protagonistPoints}
                          </span>
                          <strong className="ranking-total" data-label="PTS">
                            {points.totalPoints}
                          </strong>
                        </article>
                      );
                    })}
                  </div>

                  <div className="ranking-load-more">
                    {rankingHasMore ? (
                      <>
                        <button type="button" onClick={loadMoreRanking}>
                          CARREGAR 20 MÉS
                        </button>
                        <small>
                          També es carreguen automàticament quan baixes.
                        </small>
                      </>
                    ) : (
                      <span>HAS ARRIBAT AL FINAL DEL RÀNQUING</span>
                    )}
                  </div>
                </>
              )}
            </section>
          </section>
        )}

        {activePage === "profile" && (
          <section className="profile-page">
            {!selectedProfileUser ? (
              <div className="real-data-state empty profile-real-empty">
                <strong>Encara no hi ha cap perfil puntuat</strong>
                <span>
                  Quan hi hagi dades oficials al rànquing, el perfil apareixerà
                  aquí.
                </span>
              </div>
            ) : (
              <>
                <header
                  className={
                    selectedProfileUser.isCurrentUser
                      ? "profile-hero own-profile"
                      : "profile-hero public-profile"
                  }
                >
                  <div className="profile-identity-block">
                    <RankingAvatar user={selectedProfileUser} size="profile" />

                    <div className="profile-identity-copy">
                      <span className="profile-kicker">
                        {isOwnAuthenticatedProfile
                          ? "EL TEU PERFIL"
                          : "PERFIL PÚBLIC"}
                      </span>
                      <h1>{selectedProfileUser.displayName}</h1>

                      {!isOwnAuthenticatedProfile &&
                      selectedProfileUser.twitterUrl ? (
                        <a
                          href={selectedProfileUser.twitterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="profile-x-handle"
                        >
                          <span aria-hidden="true">𝕏</span>
                          {selectedProfileUser.handle}
                        </a>
                      ) : null}

                      {isOwnAuthenticatedProfile ? (
                                                <div className="profile-inline-actions">
                          <button
                            type="button"
                            className="profile-inline-action"
                            disabled={profileLoading || profileActionLoading}
                            onClick={() => {
                              setProfileDraftName(profileDisplayName);
                              setProfileNameEditorOpen(
                                (currentValue) => !currentValue,
                              );
                              setProfileFeedback(null);
                            }}
                          >
                            <span aria-hidden="true">✎</span>
                            CANVIA NOM
                          </button>

                                                    <label
                            className="profile-inline-action"
                            aria-disabled={
                              profileLoading || profileActionLoading
                            }
                          >
                            <span aria-hidden="true">◉</span>
                            CANVIA AVATAR

                            <input
                              type="file"
                              accept="image/*"
                              className="profile-avatar-input"
                              disabled={
                                profileLoading || profileActionLoading
                              }
                              onChange={handleProfileAvatarChange}
                            />
                          </label>

                          <NotificationPreferencesCard variant="desktop-inline" />
                        </div>
                      ) : null}
                    </div>
                  </div>

                               <div className="profile-hero-stats">
                    <div>
                      <span>POSICIÓ GENERAL</span>
                      <strong>
                        {selectedProfilePosition > 0
                          ? `#${selectedProfilePosition}`
                          : "—"}
                      </strong>
                    </div>

                    <div className="gold">
                      <span>PUNTS</span>
                      <strong>
                        {selectedProfileUser.general.totalPoints}
                      </strong>
                    </div>

                    <div className="profile-hero-medals">
                      <span>MEDALLES</span>

                      <strong>
  {selectedProfileData.unlockedAchievements}/
  {selectedProfileData.achievements.length}
</strong>
                    </div>
                  </div>

                  {!selectedProfileUser.isCurrentUser && (
                    <div className="profile-hero-actions">
                      <button
                        type="button"
                        className="profile-action-button back"
                        onClick={() => setActivePage("ranking")}
                      >
                        ← RÀNQUING
                      </button>
                    </div>
                  )}
                </header>

                {isOwnAuthenticatedProfile && profileNameEditorOpen && (
                  <form
                    className="profile-name-editor"
                    onSubmit={handleSaveProfileName}
                  >
                    <div>
                      <span>EDITA EL TEU NOM PÚBLIC</span>
                      <strong>Com vols aparèixer a Vesalaporra?</strong>
                    </div>
                    <input
                      type="text"
                      value={profileDraftName}
                      minLength={PROFILE_NAME_MIN_LENGTH}
                      maxLength={PROFILE_NAME_MAX_LENGTH}
                      onChange={(event) =>
                        setProfileDraftName(event.target.value)
                      }
                      autoFocus
                      aria-label="Nom públic de Vesalaporra"
                    />
                    <div className="profile-name-editor-actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={profileActionLoading}
                        onClick={() => {
                          setProfileNameEditorOpen(false);
                          setProfileDraftName(profileDisplayName);
                        }}
                      >
                        CANCEL·LA
                      </button>
                      <button
                        type="submit"
                        className="primary"
                        disabled={profileActionLoading}
                      >
                        {profileActionLoading ? "GUARDANT..." : "GUARDA NOM"}
                      </button>
                    </div>
                  </form>
                )}

                               {isOwnAuthenticatedProfile && profileFeedback?.message && (
                  <div
                    className={`profile-feedback ${profileFeedback.type}`}
                    role={profileFeedback.type === "error" ? "alert" : "status"}
                  >
                    <span>{profileFeedback.message}</span>
                    <button
                      type="button"
                      onClick={() => setProfileFeedback(null)}
                      aria-label="Tanca el missatge del perfil"
                    >
                      ×
                    </button>
                  </div>
                )}

                {isOwnAuthenticatedProfile && (
                  <NotificationPreferencesCard />
                )}

                <nav
                  className={
                    isOwnAuthenticatedProfile
                      ? "profile-tabs has-leagues"
                      : "profile-tabs"
                  }
                  aria-label="Seccions del perfil"
                >
                  <button
                    type="button"
                    className={
                      profileTab === "overview"
                        ? "profile-tab active"
                        : "profile-tab"
                    }
                    onClick={() => setProfileTab("overview")}
                  >
                    RESUM
                  </button>
                  <button
                    type="button"
                    className={
                      profileTab === "achievements"
                        ? "profile-tab active"
                        : "profile-tab"
                    }
                    onClick={() => setProfileTab("achievements")}
                  >
                    MEDALLES
                  </button>
                  <button
                    type="button"
                    className={
                      profileTab === "history"
                        ? "profile-tab active"
                        : "profile-tab"
                    }
                    onClick={() => setProfileTab("history")}
                  >
                    HISTORIAL
                  </button>

                  {isOwnAuthenticatedProfile && (
                    <button
                      type="button"
                      className={
                        profileTab === "leagues"
                          ? "profile-tab active"
                          : "profile-tab"
                      }
                      onClick={() => {
                        setProfileTab("leagues");
                        setPrivateLeagueFeedback(null);
                      }}
                    >
                      LLIGUES
                    </button>
                  )}
                </nav>

                {profileDataError && (
                  <div className="real-data-state error" role="alert">
                    <strong>No s’ha pogut carregar el perfil complet</strong>
                    <span>{profileDataError}</span>
                  </div>
                )}

                {profileTab === "overview" && (
                  <div className="profile-overview">
                                        <section className="profile-main-stats">
                      <article>
                        <span>POSICIÓ</span>

                        <strong>
                          {selectedProfilePosition > 0
                            ? `#${selectedProfilePosition}`
                            : "—"}
                        </strong>

                        <small>classificació general</small>
                      </article>

                      <article className="featured">
                        <span>PUNTS TOTALS</span>

                        <strong>
                          {selectedProfileUser.general.totalPoints}
                        </strong>

                        <small>temporada actual</small>
                      </article>

                      <article>
                        <span>JORNADES GUANYADES</span>

                        <strong>{profileJornadaWins}</strong>

                        <small>els empatats al màxim també compten</small>
                      </article>

                      <article>
                        <span>PORRES PUNTUADES</span>

                        <strong>{selectedProfileData.played}</strong>

                        <small>historial oficial</small>
                      </article>

                      <article>
                        <span>RESULTATS EXACTES</span>

                        <strong>{selectedProfileData.exactScores}</strong>

                        <small>dades reals</small>
                      </article>

                      <article>
                        <span>XI EXACTES</span>

                        <strong>{selectedProfileData.exactXiCount}</strong>

                        <small>11/11 oficials</small>
                      </article>

                      <article>
                        <span>PROTAGONISTES</span>

                        <strong>
                          {selectedProfileData.protagonistHits}
                        </strong>

                        <small>encerts oficials</small>
                      </article>
                    </section>

                    {selectedProfileData.bestMatch ? (
                      <section className="profile-records-section">
                        <header>
                          <div>
  <span style={{ fontSize: "18px", fontWeight: 900 }}>
    MILLORS ACTUACIONS
  </span>
</div>
                        </header>
                        <div className="profile-records-grid">
                          <article className="profile-record-card gold">
                            <span className="profile-record-ordinal">01</span>
                            <span className="profile-record-icon">🏆</span>
                            <strong>
                              {selectedProfileData.bestMatch.totalPoints} PTS
                            </strong>
                            <small>Millor jornada</small>
                            <p>
                              {selectedProfileData.bestMatch.label} · {selectedProfileData.bestMatch.opponent}
                            </p>
                          </article>
                          <article className="profile-record-card silver">
                            <span className="profile-record-ordinal">02</span>
                            <span className="profile-record-icon">🧠</span>
                            <strong>{selectedProfileData.bestXi}/11</strong>
                            <small>Millor Lotto Flick</small>
                            <p>Titulars encertats en una jornada real.</p>
                          </article>
                          <article className="profile-record-card bronze">
                            <span className="profile-record-ordinal">03</span>
                            <span className="profile-record-icon">⭐</span>
                            <strong>
                              {selectedProfileData.bestProtagonistPoints > 0
                                ? "+"
                                : ""}
                              {selectedProfileData.bestProtagonistPoints}
                            </strong>
                            <small>Millor protagonista</small>
                            <p>Punts oficials de protagonista.</p>
                          </article>
                        </div>
                      </section>
                    ) : (
                      <div className="real-data-state empty">
                        <strong>Encara no hi ha jornades puntuades.</strong>
                        <span>
                          El resum i els records apareixeran després de la
                          primera publicació oficial.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {profileTab === "achievements" && (
                  <section className="profile-achievements-card">
                   <header>
  <div>
    <span>MEDALLES</span>
    <strong>
      {" · "}
      {selectedProfileData.unlockedAchievements}/
      {selectedProfileData.achievements.length} desbloquejades
    </strong>
  </div>
</header>
                    <div className="profile-achievements-grid">
                      {selectedProfileData.achievements.map((achievement) => (
                        <article
                          key={achievement.id}
                          className={
                            achievement.unlocked
                              ? "profile-achievement unlocked"
                              : "profile-achievement locked"
                          }
                        >
                          <span className="profile-achievement-icon">
                            <AchievementIconGraphic achievement={achievement} />
                          </span>
                          <div>
                            <strong
                              style={{
                                fontSize: "1rem",
                                lineHeight: 1.5,
                                textTransform: "uppercase",
                              }}
                            >
                              {achievement.title}
                            </strong>
                            <p
                              style={{
                                fontSize: "1rem",
                                lineHeight: 1.5,
                                fontWeight: 600,
                                color: "#e2e8f0",
                                opacity: 1,
                              }}
                            >
                              {achievement.description}
                            </p>
                            {achievement.progress && (
                              <small>{achievement.progress}</small>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {profileTab === "history" && (
                  <section className="profile-history-card">
                    <header>
                      <div>
                        <span>HISTORIAL DE PORRES</span>
                        <strong>Partits puntuats</strong>
                      </div>
                      <small>
                        {profileDataLoading
                          ? "CARREGANT..."
                                                   : `${selectedProfileData.history.length} ${
                              selectedProfileData.history.length === 1
                                ? "JORNADA"
                                : "JORNADES"
                            }`}
                      </small>
                    </header>

                    {!profileDataLoading &&
                    selectedProfileData.history.length === 0 ? (
                      <div className="real-data-state empty">
                        <strong>Encara no hi ha jornades puntuades.</strong>
                        <span>No es mostra cap historial inventat.</span>
                      </div>
                    ) : (
                      <div className="profile-history-list-v2">
                        {selectedProfileData.history.map((match) => {
                          const detailKey = `${selectedProfileUser?.id || ""}:${match.matchId}`;
                          const isPredictionOpen =
                            expandedProfilePrediction?.key === detailKey;

                          return (
                            <article
                              key={match.id}
                              className="profile-history-row-v2"
                            >
                              <div className="profile-history-match-v2">
                                <span>
                                  {String(
                                    match.label || "PARTIT",
                                  ).toUpperCase()}
                                </span>
                                <strong>{match.opponent}</strong>
                                <small>{match.dateLabel || ""}</small>

                                <button
                                  type="button"
                                  className={
                                    isPredictionOpen
                                      ? "profile-history-bet-toggle open"
                                      : "profile-history-bet-toggle"
                                  }
                                  onClick={() =>
                                    handleToggleProfilePrediction(match)
                                  }
                                  aria-expanded={isPredictionOpen}
                                  aria-controls={`profile-history-bet-${match.matchId}`}
                                  disabled={!match.matchId}
                                >
                                  {isPredictionOpen
                                    ? expandedProfilePrediction.loading
                                      ? "CARREGANT..."
                                      : "AMAGAR APOSTA"
                                    : "VEURE APOSTA"}

                                  <span aria-hidden="true">⌄</span>
                                </button>
                              </div>

                              <div className="profile-history-score-v2">
                                <div>
                                  <span>PRONÒSTIC</span>
                                  <strong>
                                    {match.predictedHome}–
                                    {match.predictedAway}
                                  </strong>
                                </div>

                                <span className="profile-history-score-arrow">
                                  →
                                </span>

                                <div>
                                  <span>OFICIAL</span>
                                  <strong>
                                    {match.actualHome}–{match.actualAway}
                                  </strong>
                                </div>
                              </div>

                              <div className="profile-history-points-v2">
                                {[
                                  ["RESULTAT", match.resultPoints],
                                  ["XI", match.xiPoints],
                                  ["PRO", match.protagonistPoints],
                                ].map(([label, points]) => (
                                  <div
                                    key={label}
                                    className={
                                      points > 0
                                        ? "positive"
                                        : points < 0
                                          ? "negative"
                                          : "neutral"
                                    }
                                  >
                                    <span>{label}</span>
                                    <strong>
                                      {points > 0 ? "+" : ""}
                                      {points}
                                    </strong>
                                  </div>
                                ))}
                              </div>

                              <div
                                className={
                                  match.totalPoints > 0
                                    ? "profile-history-total-v2 positive"
                                    : match.totalPoints < 0
                                      ? "profile-history-total-v2 negative"
                                      : "profile-history-total-v2 neutral"
                                }
                              >
                                <span>TOTAL</span>
                                <strong>
                                  {match.totalPoints > 0 ? "+" : ""}
                                  {match.totalPoints}
                                </strong>
                              </div>

                              {isPredictionOpen && (
                                <div
                                  id={`profile-history-bet-${match.matchId}`}
                                  className="profile-history-bet-detail"
                                >
                                  {expandedProfilePrediction.loading ? (
                                    <div
                                      className="profile-history-bet-state"
                                      role="status"
                                    >
                                      Carregant l’aposta...
                                    </div>
                                  ) : expandedProfilePrediction.error ? (
                                    <div
                                      className="profile-history-bet-state error"
                                      role="alert"
                                    >
                                      {expandedProfilePrediction.error}
                                    </div>
                                  ) : (
                                    <>
                                      <section
                                        className={
                                          expandedProfilePrediction.protagonistImageUrl
                                            ? "profile-history-protagonist-detail"
                                            : "profile-history-protagonist-detail no-player"
                                        }
                                      >
                                        {expandedProfilePrediction.protagonistImageUrl && (
                                          <img
                                            className="profile-history-protagonist-image"
                                            src={
                                              expandedProfilePrediction.protagonistImageUrl
                                            }
                                            alt={`Cromo de ${
                                              expandedProfilePrediction.protagonistDisplayName ||
                                              "protagonista"
                                            }`}
                                          />
                                        )}

                                        <div className="profile-history-protagonist-copy">
                                          <span>
                                            <span
                                              className="profile-history-protagonist-star"
                                              aria-hidden="true"
                                            >
                                              ⭐
                                            </span>{" "}
                                            PROTAGONISTA
                                          </span>

                                          <div className="profile-history-protagonist-result">
                                            <strong>
                                              {expandedProfilePrediction.protagonistDisplayName ||
                                                "Sense protagonista"}
                                            </strong>

                                            {expandedProfilePrediction.protagonistDisplayName && (
                                              <span
                                                className={
                                                  match.protagonistHit
                                                    ? "profile-history-protagonist-verdict hit"
                                                    : "profile-history-protagonist-verdict miss"
                                                }
                                                aria-label={
                                                  match.protagonistHit
                                                    ? "Protagonista encertat"
                                                    : "Protagonista fallat"
                                                }
                                              >
                                                {match.protagonistHit
                                                  ? "✓"
                                                  : "X"}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </section>

                                      <section className="profile-history-lineup-detail">
                                        <header>
                                          <span>🧠 LOTTO FLICK</span>
                                          <strong>
                                            {Math.max(
                                              0,
                                              Math.min(
                                                11,
                                                toFiniteNumber(match.xiHits),
                                              ),
                                            )}
                                            /11
                                          </strong>
                                        </header>

                                        {expandedProfilePrediction
                                          .lineupPlayers.length > 0 ? (
                                          <div className="profile-history-lineup-list">
                                            {expandedProfilePrediction.lineupPlayers.map(
                                              (player) => (
                                                <div
                                                  key={player.id}
                                                  className={
                                                    player.isStarter
                                                      ? "profile-history-lineup-player hit"
                                                      : "profile-history-lineup-player miss"
                                                  }
                                                >
                                                  <span>
                                                    {player.position}
                                                  </span>
                                                  <strong>
                                                    {player.displayName}
                                                  </strong>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <small>
                                            No es va enviar cap Lotto Flick.
                                          </small>
                                        )}
                                      </section>
                                    </>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {profileTab === "leagues" &&
                  isOwnAuthenticatedProfile && (
                    <section className="private-leagues-page">
                      <header className="private-leagues-hero">
                        <div className="private-leagues-hero-copy">
                          <span className="private-leagues-kicker">
                            🏆 LLIGUES PRIVADES
                          </span>

                          <div className="private-leagues-title-line">
                            <h2>LA MATEIXA PORRA. LA VOSTRA BATALLA.</h2>

                            <button
                              type="button"
                              className="section-info-button private-leagues-info-button"
                              onClick={() =>
                                setPrivateLeagueInfoOpen(
                                  (currentValue) => !currentValue,
                                )
                              }
                              aria-label="Què són les lligues privades?"
                              aria-expanded={privateLeagueInfoOpen}
                              title="Què són les lligues privades?"
                            >
                              i
                            </button>
                          </div>

                          <p>
                            Crea una classificació només per als teus amics,
                            família, penya o comunitat. Fas la porra una sola
                            vegada: els mateixos punts compten al rànquing
                            general i a totes les teves lligues.
                          </p>
                        </div>

                        <div className="private-leagues-hero-mark" aria-hidden="true">
                          <span>V</span>
                          <strong>VS</strong>
                          <span>V</span>
                        </div>
                      </header>

                      {privateLeagueInfoOpen && (
                        <div
                          className="section-info-panel private-leagues-info-panel"
                          role="note"
                        >
                          <strong className="section-info-title">
                            COM FUNCIONEN LES LLIGUES PRIVADES?
                          </strong>

                          <div className="section-info-points-list">
                            <div className="section-info-points-row featured">
                              <span>1. Fas una única porra a Vesalaporra</span>
                              <strong>1×</strong>
                            </div>

                            <div className="section-info-points-row">
                              <span>
                                2. Els teus punts compten al rànquing general
                              </span>
                              <strong>🌍</strong>
                            </div>

                            <div className="section-info-points-row">
                              <span>
                                3. També compten a cada lliga on participes
                              </span>
                              <strong>🏆</strong>
                            </div>

                            <div className="section-info-points-row">
                              <span>
                                4. Convida qui vulguis amb un codi o enllaç
                              </span>
                              <strong>🔑</strong>
                            </div>

                            <div className="section-info-points-row">
                              <span>
                                5. La lliga no modifica punts, medalles ni la
                                classificació general
                              </span>
                              <strong>✓</strong>
                            </div>
                          </div>

                          <small className="section-info-note">
                            No hi ha una porra diferent per cada lliga. És la
                            mateixa competició de Vesalaporra vista entre el
                            teu grup: zero feina extra, molta més rivalitat.
                          </small>
                        </div>
                      )}

                      {privateLeagueFeedback?.message && (
                        <div
                          className={`private-league-feedback ${privateLeagueFeedback.type}`}
                          role={
                            privateLeagueFeedback.type === "error"
                              ? "alert"
                              : "status"
                          }
                        >
                          <span>{privateLeagueFeedback.message}</span>

                          <button
                            type="button"
                            onClick={() =>
                              setPrivateLeagueFeedback(null)
                            }
                            aria-label="Tanca el missatge"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      <div className="private-league-primary-actions">
                        <button
                          type="button"
                          className={
                            privateLeagueCreateOpen
                              ? "private-league-primary-action create active"
                              : "private-league-primary-action create"
                          }
                          onClick={() => {
                            setPrivateLeagueCreateOpen(
                              (currentValue) => !currentValue,
                            );
                            setPrivateLeagueJoinOpen(false);
                            setPrivateLeagueFeedback(null);
                          }}
                        >
                          <span aria-hidden="true">＋</span>
                          <div>
                            <small>NOVA COMPETICIÓ</small>
                            <strong>CREA UNA LLIGA</strong>
                          </div>
                          <b aria-hidden="true">→</b>
                        </button>

                        <button
                          type="button"
                          className={
                            privateLeagueJoinOpen
                              ? "private-league-primary-action join active"
                              : "private-league-primary-action join"
                          }
                          onClick={() => {
                            setPrivateLeagueJoinOpen(
                              (currentValue) => !currentValue,
                            );
                            setPrivateLeagueCreateOpen(false);
                            setPrivateLeagueFeedback(null);
                          }}
                        >
                          <span aria-hidden="true">⌁</span>
                          <div>
                            <small>T'HAN CONVIDAT?</small>
                            <strong>ENTRA AMB CODI</strong>
                          </div>
                          <b aria-hidden="true">→</b>
                        </button>
                      </div>

                      {privateLeagueCreateOpen && (
                        <form
                          className="private-league-form create"
                          onSubmit={handleCreatePrivateLeague}
                        >
                          <div>
                            <span>CREA LA TEVA LLIGA</span>
                            <strong>
                              Posa-li un nom que faci venir ganes de guanyar-la.
                            </strong>
                          </div>

                          <label>
                            <span>NOM DE LA LLIGA</span>
                            <input
                              type="text"
                              value={privateLeagueDraftName}
                              minLength={PRIVATE_LEAGUE_NAME_MIN_LENGTH}
                              maxLength={PRIVATE_LEAGUE_NAME_MAX_LENGTH}
                              placeholder="Ex. Penya dels Diumenges"
                              disabled={privateLeagueActionLoading}
                              onChange={(event) =>
                                setPrivateLeagueDraftName(
                                  event.target.value,
                                )
                              }
                              autoFocus
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={
                              privateLeagueActionLoading ||
                              privateLeagueDraftName.trim().length <
                                PRIVATE_LEAGUE_NAME_MIN_LENGTH
                            }
                          >
                            {privateLeagueActionLoading
                              ? "CREANT..."
                              : "CREA LA LLIGA"}
                          </button>
                        </form>
                      )}

                      {privateLeagueJoinOpen && (
                        <form
                          className="private-league-form join"
                          onSubmit={handleJoinPrivateLeague}
                        >
                          <div>
                            <span>ENTRA A UNA LLIGA</span>
                            <strong>
                              Escriu el codi que t'ha passat el creador.
                            </strong>
                          </div>

                          <label>
                            <span>CODI D'INVITACIÓ</span>
                            <input
                              type="text"
                              value={privateLeagueJoinCode}
                              maxLength={16}
                              placeholder="Ex. 4F8A91C2"
                              disabled={privateLeagueActionLoading}
                              onChange={(event) =>
                                setPrivateLeagueJoinCode(
                                  normalizePrivateLeagueCode(
                                    event.target.value,
                                  ),
                                )
                              }
                              autoCapitalize="characters"
                              autoComplete="off"
                              spellCheck={false}
                              autoFocus
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={
                              privateLeagueActionLoading ||
                              normalizePrivateLeagueCode(
                                privateLeagueJoinCode,
                              ).length < 4
                            }
                          >
                            {privateLeagueActionLoading
                              ? "ENTRANT..."
                              : "ENTRA A LA LLIGA"}
                          </button>
                        </form>
                      )}

                      <section className="private-leagues-list-section">
                        <header className="private-leagues-section-heading">
                          <div>
                            <span>LES MEVES LLIGUES</span>
                            <strong>
                              {privateLeaguesLoading
                                ? "Carregant..."
                                : privateLeagues.length === 1
                                  ? "1 lliga"
                                  : `${privateLeagues.length} lligues`}
                            </strong>
                          </div>
                        </header>

                        {privateLeaguesError && (
                          <div
                            className="real-data-state error"
                            role="alert"
                          >
                            <strong>
                              No s'han pogut carregar les lligues
                            </strong>
                            <span>{privateLeaguesError}</span>
                          </div>
                        )}

                        {!privateLeaguesLoading &&
                          !privateLeaguesError &&
                          privateLeagues.length === 0 && (
                            <div className="private-leagues-empty">
                              <span aria-hidden="true">🏁</span>
                              <strong>
                                ENCARA NO TENS CAP LLIGA PRIVADA
                              </strong>
                              <p>
                                Crea'n una i passa l'enllaç al grup. O entra
                                amb el codi d'algú que ja hagi començat la
                                guerra.
                              </p>
                            </div>
                          )}

                        {privateLeagues.length > 0 && (
                          <div className="private-leagues-grid">
                            {privateLeagues.map((league) => {
                              const isSelected =
                                selectedPrivateLeagueId === league.id;
                              const leaguePosition =
                                getPrivateLeaguePosition(league.id);

                              return (
                                <article
                                  key={league.id}
                                  className={
                                    isSelected
                                      ? "private-league-card selected"
                                      : "private-league-card"
                                  }
                                >
                                  <div className="private-league-card-top">
                                    <span className="private-league-card-icon">
                                      🏆
                                    </span>

                                    <div className="private-league-card-copy">
                                      <div className="private-league-card-badges">
                                        <span>
                                          {league.memberCount}{" "}
                                          {league.memberCount === 1
                                            ? "CULER"
                                            : "CULERS"}
                                        </span>

                                        {league.memberRole === "owner" && (
                                          <span className="owner">
                                            CAPITÀ
                                          </span>
                                        )}
                                      </div>

                                      <h3>{league.name}</h3>
                                    </div>
                                  </div>

                                  <div className="private-league-card-stats">
                                    <div>
                                      <span>LA TEVA POSICIÓ</span>
                                      <strong>
                                        {leaguePosition
                                          ? `#${leaguePosition}`
                                          : "—"}
                                      </strong>
                                    </div>

                                    <div>
                                      <span>PUNTS</span>
                                      <strong>
                                        {currentRankingUser?.general
                                          ?.totalPoints ??
                                          authenticatedProfileUser?.general
                                            ?.totalPoints ??
                                          0}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="private-league-invite">
                                    <span>CODI</span>
                                    <strong>{league.inviteCode}</strong>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyPrivateLeagueInvite(league)
                                      }
                                    >
                                      COPIA ENLLAÇ
                                    </button>
                                  </div>

                                  <div className="private-league-share-row">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        sharePrivateLeague(
                                          league,
                                          "whatsapp",
                                        )
                                      }
                                    >
                                      WhatsApp
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        sharePrivateLeague(league, "x")
                                      }
                                    >
                                      𝕏
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    className="private-league-open-button"
                                    onClick={() =>
                                      handleOpenPrivateLeague(league.id)
                                    }
                                    disabled={
                                      privateLeagueMembersLoading &&
                                      isSelected
                                    }
                                  >
                                    {privateLeagueMembersLoading &&
                                    isSelected
                                      ? "CARREGANT..."
                                      : "VEURE CLASSIFICACIÓ"}
                                    <span aria-hidden="true">→</span>
                                  </button>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </section>

                      {selectedPrivateLeague && (
                        <section
                          id="private-league-ranking"
                          className="private-league-ranking-section"
                        >
                          <div
                            className="ranking-tabs private-league-ranking-tabs"
                            role="tablist"
                            aria-label={`Classificació de ${selectedPrivateLeague.name}`}
                          >
                            <button
                              type="button"
                              role="tab"
                              aria-selected={
                                privateLeagueRankingTab === "general"
                              }
                              className={
                                privateLeagueRankingTab === "general"
                                  ? "ranking-tab active"
                                  : "ranking-tab"
                              }
                              onClick={() =>
                                setPrivateLeagueRankingTab("general")
                              }
                            >
                              GENERAL
                            </button>

                            <button
                              type="button"
                              role="tab"
                              aria-selected={
                                privateLeagueRankingTab === "jornada"
                              }
                              className={
                                privateLeagueRankingTab === "jornada"
                                  ? "ranking-tab active"
                                  : "ranking-tab"
                              }
                              onClick={() =>
                                setPrivateLeagueRankingTab("jornada")
                              }
                            >
                              JORNADA
                            </button>
                          </div>

                          <section className="ranking-board private-league-ranking-board">
                            <header className="ranking-board-heading">
                              <div>
                                <span>
                                  {privateLeagueRankingTab === "general"
                                    ? "CLASSIFICACIÓ GENERAL"
                                    : rankingJornadaNumber
                                      ? `JORNADA ${rankingJornadaNumber}`
                                      : "JORNADA"}
                                </span>
                                <strong>{selectedPrivateLeague.name}</strong>
                              </div>

                              <small className="private-league-board-meta">
                                {selectedPrivateLeague.memberCount} CULERS
                                <span aria-hidden="true"> · </span>
                                CODI {selectedPrivateLeague.inviteCode}
                              </small>
                            </header>

                            {privateLeagueMembersLoading ? (
                              <div
                                className="real-data-state empty"
                                role="status"
                              >
                                <strong>
                                  Carregant la classificació...
                                </strong>
                                <span>
                                  Només es consulta quan obres aquesta lliga.
                                </span>
                              </div>
                            ) : selectedPrivateLeagueRankingRows.length === 0 ? (
                              <div className="real-data-state empty">
                                <strong>
                                  Encara no hi ha culers en aquesta lliga
                                </strong>
                                <span>
                                  Comparteix el codi d’invitació perquè s’hi
                                  afegeixin.
                                </span>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="ranking-table-head"
                                  aria-hidden="true"
                                >
                                  <span>POS</span>
                                  <span>CULER</span>
                                  <span>RESULTAT</span>
                                  <span>XI</span>
                                  <span>PROTAGONISTA</span>
                                  <span>PTS</span>
                                </div>

                                <div className="ranking-list">
                                  {selectedPrivateLeagueRankingRows.map(
                                    (user, index) => {
                                      const position = index + 1;
                                      const points =
                                        user[privateLeagueRankingTab];
                                      const medal =
                                        position === 1
                                          ? "🥇"
                                          : position === 2
                                            ? "🥈"
                                            : position === 3
                                              ? "🥉"
                                              : null;

                                      const member =
                                        privateLeagueMembers.find(
                                          (candidate) =>
                                            candidate.userId === user.id,
                                        );

                                      return (
                                        <article
                                          key={`${selectedPrivateLeague.id}-${privateLeagueRankingTab}-${user.id}`}
                                          className={[
                                            "ranking-row",
                                            "private-league-ranking-row",
                                            user.isCurrentUser
                                              ? "current-user"
                                              : "",
                                            position <= 3
                                              ? "podium"
                                              : "",
                                          ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        >
                                          <span className="ranking-position">
                                            {medal ? (
                                              <span className="ranking-medal">
                                                {medal}
                                              </span>
                                            ) : (
                                              position
                                            )}
                                          </span>

                                          <button
                                            type="button"
                                            className="ranking-identity"
                                            onClick={() =>
                                              openRankingProfile(user.id)
                                            }
                                          >
                                            <RankingAvatar user={user} />

                                            <span className="ranking-identity-copy">
                                              <strong>
                                                <span className="ranking-name-text">
                                                  {user.displayName}
                                                </span>

                                                {user.privateLeagueRole ===
                                                  "owner" && (
                                                  <span
                                                    className="private-league-captain-armband"
                                                    aria-label="Capità de la lliga"
                                                    title="Capità de la lliga"
                                                  >
                                                    <span>C</span>
                                                  </span>
                                                )}

                                                <RankingAchievementIcons
                                                  achievements={getRankingAchievements(
                                                    user,
                                                  )}
                                                  className="ranking-row-medals"
                                                />

                                                {user.isCurrentUser && (
                                                  <span className="ranking-you-badge">
                                                    TU
                                                  </span>
                                                )}
                                              </strong>

                                              {user.hasXIdentity &&
                                                user.handle && (
                                                  <small>
                                                    <span aria-hidden="true">
                                                      𝕏
                                                    </span>
                                                    {user.handle}
                                                  </small>
                                                )}
                                            </span>
                                          </button>

                                          <span
                                            className="ranking-breakdown result"
                                            data-label="RESULTAT"
                                          >
                                            {points.resultPoints}
                                          </span>

                                          <span
                                            className="ranking-breakdown xi"
                                            data-label="XI"
                                          >
                                            {points.xiPoints}
                                          </span>

                                          <span
                                            className="ranking-breakdown protagonist"
                                            data-label="PROTAGONISTA"
                                          >
                                            {points.protagonistPoints}
                                          </span>

                                          <strong
                                            className="ranking-total"
                                            data-label="PTS"
                                          >
                                            {points.totalPoints}
                                          </strong>

                                          {selectedPrivateLeague.memberRole ===
                                            "owner" &&
                                            !user.isCurrentUser && (
                                              <button
                                                type="button"
                                                className="private-league-kick-button"
                                                onClick={() =>
                                                  handleRemovePrivateLeagueMember(
                                                    selectedPrivateLeague,
                                                    member,
                                                  )
                                                }
                                                disabled={
                                                  privateLeagueActionLoading
                                                }
                                                aria-label={`Expulsa ${user.displayName} de la lliga`}
                                                title={`Expulsa ${user.displayName}`}
                                              >
                                                ×
                                              </button>
                                            )}
                                        </article>
                                      );
                                    },
                                  )}
                                </div>
                              </>
                            )}
                          </section>

                          <footer className="private-league-ranking-footer">
                            <span>
                              La porra es fa sempre des de LA PORRA. Aquí només
                              canvia contra qui competeixes.
                            </span>

                            {selectedPrivateLeague.memberRole === "owner" ? (
                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handleDeletePrivateLeague(
                                    selectedPrivateLeague,
                                  )
                                }
                                disabled={privateLeagueActionLoading}
                              >
                                ELIMINA LLIGA
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handleLeavePrivateLeague(
                                    selectedPrivateLeague,
                                  )
                                }
                                disabled={privateLeagueActionLoading}
                              >
                                SURT DE LA LLIGA
                              </button>
                            )}
                          </footer>
                        </section>
                      )}
                    </section>
                  )}

                {isOwnAuthenticatedProfile && (
                  <div className="profile-inline-actions">
                    <button
                      type="button"
                      className="profile-inline-action"
                      onClick={handleSignOut}
                      disabled={authActionLoading}
                    >
                      {authActionLoading ? "TANCANT..." : "TANCA SESSIÓ"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      {confirmationDialogOpen && (
        <div className="prediction-confirm-dialog-backdrop">
          <section
            className="prediction-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="prediction-confirm-dialog-title"
            aria-describedby="prediction-confirm-dialog-description"
          >
            <span className="prediction-confirm-dialog-kicker">
              CONFIRMACIÓ DEFINITIVA
            </span>

            <h2 id="prediction-confirm-dialog-title">N’ESTÀS SEGUR?</h2>

            <p id="prediction-confirm-dialog-description">
              {confirmationMode === "result-only"
                ? "El resultat quedarà bloquejat. Podràs tornar abans del tancament per afegir la Lotto Flick i el protagonista."
                : resultIsConfirmed
                  ? "Només s’afegiran els apartats nous. Tot el que ja havies enviat continuarà bloquejat."
                  : "Cada apartat que enviïs quedarà bloquejat. Els que deixis buits els podràs afegir abans del tancament."}
            </p>

            <div className="prediction-confirm-dialog-summary">
              <span>
                RESULTAT {formatPredictionScore(barcaScore, rivalScore)}
              </span>

              {confirmationMode === "result-only" ? (
                <span>LA RESTA QUEDARÀ OBERTA</span>
              ) : (
                <>
                  <span>
                    {lineupIsConfirmed
                      ? "XI JA ENVIADA"
                      : lineupIsComplete
                        ? "XI 11/11"
                        : "SENSE XI"}
                  </span>

                  <span>
                    {protagonistIsConfirmed
                      ? `PROTAGONISTA JA ENVIAT`
                      : protagonistIsComplete
                        ? `PROTAGONISTA ${protagonist.shortName.toUpperCase()}`
                        : "SENSE PROTAGONISTA"}
                  </span>
                </>
              )}
            </div>

            <div className="prediction-confirm-dialog-actions">
              <button
                type="button"
                className="prediction-confirm-yes"
                onClick={handleFinalizePrediction}
                disabled={predictionSubmitting}
              >
                {predictionSubmitting
                  ? "CONFIRMANT..."
                  : confirmationMode === "result-only"
                    ? "SÍ, ENVIA EL RESULTAT"
                    : "SÍ, CONFIRMA’L"}
              </button>

              <button
                type="button"
                className="prediction-confirm-no"
                onClick={handleCancelPredictionConfirmation}
                disabled={predictionSubmitting}
              >
                NO, TORNA ENRERE
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmationAnimationActive && confirmedPrediction && (
        <div className="prediction-celebration-overlay" aria-hidden="true">
          <style>{`
            .prediction-celebration-overlay {
              isolation: isolate;
              overflow: hidden;
            }

            .prediction-celebration-card {
              position: relative;
              z-index: 3;
            }

            .prediction-confetti-fountain {
              position: fixed;
              width: 1px;
              height: 1px;
              z-index: 2;
              pointer-events: none;
            }

            .prediction-confetti-piece {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              opacity: 0;
              box-shadow: 0 0 7px currentColor;
              animation-name: prediction-confetti-fountain;
              animation-timing-function: cubic-bezier(0.18, 0.76, 0.26, 1);
              animation-fill-mode: both;
              will-change: transform, opacity;
            }

            @keyframes prediction-confetti-fountain {
              0% {
                opacity: 0;
                transform: translate3d(0, 5px, 0) rotate(0deg);
              }

              8% {
                opacity: 1;
              }

              44% {
                opacity: 1;
                transform:
                  translate3d(
                    var(--confetti-middle-x),
                    var(--confetti-peak-y),
                    0
                  )
                  rotate(var(--confetti-middle-rotation));
              }

              70% {
                opacity: 1;
                transform:
                  translate3d(
                    var(--confetti-second-x),
                    var(--confetti-second-y),
                    0
                  )
                  rotate(var(--confetti-second-rotation));
              }

              100% {
                opacity: 0;
                transform:
                  translate3d(
                    var(--confetti-end-x),
                    var(--confetti-fall-y),
                    0
                  )
                  rotate(var(--confetti-end-rotation));
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .prediction-confetti-fountain {
                display: none;
              }
            }
          `}</style>

          <div
            className="prediction-confetti-fountain"
            style={predictionCelebrationOrigin}
          >
            {PREDICTION_CONFETTI_PIECES.map((piece) => (
              <i
                key={piece.id}
                className="prediction-confetti-piece"
                style={{
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  color: piece.color,
                  backgroundColor: piece.color,
                  borderRadius: piece.borderRadius,
                  animationDelay: `${piece.delay}ms`,
                  animationDuration: `${piece.duration}ms`,
                  "--confetti-end-x": piece.endX,
                  "--confetti-middle-x": piece.middleX,
                  "--confetti-second-x": piece.secondX,
                  "--confetti-peak-y": piece.peakY,
                  "--confetti-second-y": piece.secondY,
                  "--confetti-fall-y": piece.fallY,
                  "--confetti-middle-rotation": piece.middleRotation,
                  "--confetti-second-rotation": piece.secondRotation,
                  "--confetti-end-rotation": piece.endRotation,
                }}
              ></i>
            ))}
          </div>

          <section className="prediction-celebration-card">
            <span className="prediction-celebration-kicker">
              {confirmedPrediction.submissionMode === "result-only"
                ? "RESULTAT ENREGISTRAT"
                : "PRONÒSTIC ENREGISTRAT"}
            </span>

            <strong>VISCA EL BARÇA!</strong>

            <div className="prediction-celebration-summary">
              <span>
                RESULTAT {formatPredictionScore(
                  confirmedPrediction.barcaScore,
                  confirmedPrediction.rivalScore,
                )}
              </span>

              {confirmedPrediction.submissionMode === "result-only" ? (
                <span>POTS COMPLETAR LA RESTA FINS AL TANCAMENT</span>
              ) : (
                <>
                  <span>
                    XI {confirmedPrediction.lineup.filter(Boolean).length}/11
                  </span>

                  <span>
                    {confirmedPrediction.protagonistId &&
                    gamePlayersById[confirmedPrediction.protagonistId]
                      ? `PROTAGONISTA ${gamePlayersById[
                          confirmedPrediction.protagonistId
                        ].shortName.toUpperCase()}`
                      : "SENSE PROTAGONISTA"}
                  </span>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}  

export default App;
 