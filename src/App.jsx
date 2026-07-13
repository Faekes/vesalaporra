import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

const players = [
  {
    id: "karim-adeyemi",
    name: "Karim Adeyemi",
    shortName: "Adeyemi",
    image: "/fcb/KARIM_ADEYEMI.png",
  },
  {
    id: "alejandro-balde",
    name: "Alejandro Balde",
    shortName: "Balde",
    image: "/fcb/ALEJANDRO_BALDE.png",
  },
  {
    id: "andreas-christensen",
    name: "Andreas Christensen",
    shortName: "Christensen",
    image: "/fcb/ANDREAS_CHRISTENSEN.png",
  },
  {
    id: "anthony-gordon",
    name: "Anthony Gordon",
    shortName: "Gordon",
    image: "/fcb/ANTHONY_GORDON.png",
  },
  {
    id: "dani-olmo",
    name: "Dani Olmo",
    shortName: "Dani Olmo",
    image: "/fcb/DANI_OLMO.png",
  },
  {
    id: "eric-garcia",
    name: "Eric Garcia",
    shortName: "Eric",
    image: "/fcb/ERIC_GARCIA.png",
  },
  {
    id: "fermin-lopez",
    name: "Fermín López",
    shortName: "Fermín",
    image: "/fcb/FERMIN_LOPEZ.png",
  },
  {
    id: "ferran-torres",
    name: "Ferran Torres",
    shortName: "Ferran",
    image: "/fcb/FERRAN_TORRES.png",
  },
  {
    id: "frenkie-de-jong",
    name: "Frenkie de Jong",
    shortName: "De Jong",
    image: "/fcb/FRENKIE_DE_JONG.png",
  },
  {
    id: "gavi",
    name: "Gavi",
    shortName: "Gavi",
    image: "/fcb/GAVI.png",
  },
  {
    id: "gerard-martin",
    name: "Gerard Martín",
    shortName: "Gerard",
    image: "/fcb/GERARD_MARTIN.png",
  },
  {
    id: "joan-garcia",
    name: "Joan García",
    shortName: "Joan García",
    image: "/fcb/JOAN_GARCIA.png",
    isGoalkeeper: true,
  },
  {
    id: "joao-cancelo",
    name: "João Cancelo",
    shortName: "Cancelo",
    image: "/fcb/JOAO_CANCELO.png",
  },
  {
    id: "jofre-torrents",
    name: "Jofre Torrents",
    shortName: "Jofre",
    image: "/fcb/JOFRE_TORRENTS.png",
  },
  {
    id: "jules-kounde",
    name: "Jules Koundé",
    shortName: "Koundé",
    image: "/fcb/JULES_KOUNDE.png",
  },
  {
    id: "lamine-yamal",
    name: "Lamine Yamal",
    shortName: "Lamine",
    image: "/fcb/LAMINE_YAMAL.png",
  },
  {
    id: "marc-bernal",
    name: "Marc Bernal",
    shortName: "Bernal",
    image: "/fcb/MARC_BERNAL.png",
  },
  {
    id: "marc-casado",
    name: "Marc Casadó",
    shortName: "Casadó",
    image: "/fcb/MARC_CASADO.png",
  },
  {
    id: "pau-cubarsi",
    name: "Pau Cubarsí",
    shortName: "Cubarsí",
    image: "/fcb/PAU_CUBARSI.png",
  },
  {
    id: "pedri",
    name: "Pedri",
    shortName: "Pedri",
    image: "/fcb/PEDRI.png",
  },
  {
    id: "raphinha",
    name: "Raphinha",
    shortName: "Raphinha",
    image: "/fcb/RAPHINHA.png",
  },
  {
    id: "ronald-araujo",
    name: "Ronald Araújo",
    shortName: "Araújo",
    image: "/fcb/RONALD_ARAUJO.png",
  },
  {
    id: "wojciech-szczesny",
    name: "Wojciech Szczęsny",
    shortName: "Szczęsny",
    image: "/fcb/WOJCIECH_SZCZESNY.png",
    isGoalkeeper: true,
  },
];

const playersById = Object.fromEntries(
  players.map((player) => [player.id, player]),
);

const protagonistScoringByPlayerId = {
  "lamine-yamal": {
    groupLabel: "YAMAL SPECIAL",
    groupKey: "special",
    goalContributions: 41,
    hitPoints: 5,
    missPoints: -5,
    order: 1,
  },
  "fermin-lopez": {
    groupLabel: "GRUP A",
    groupKey: "a",
    goalContributions: 30,
    hitPoints: 10,
    missPoints: -5,
    order: 2,
  },
  raphinha: {
    groupLabel: "GRUP A",
    groupKey: "a",
    goalContributions: 26,
    hitPoints: 10,
    missPoints: -5,
    order: 3,
  },
  "ferran-torres": {
    groupLabel: "GRUP A",
    groupKey: "a",
    goalContributions: 23,
    hitPoints: 10,
    missPoints: -5,
    order: 4,
  },
  "anthony-gordon": {
    groupLabel: "GRUP A",
    groupKey: "a",
    goalContributions: 22,
    hitPoints: 10,
    missPoints: -5,
    order: 5,
  },
  "dani-olmo": {
    groupLabel: "GRUP B",
    groupKey: "b",
    goalContributions: 17,
    hitPoints: 20,
    missPoints: -10,
    order: 6,
  },
  "karim-adeyemi": {
    groupLabel: "GRUP B",
    groupKey: "b",
    goalContributions: 16,
    hitPoints: 20,
    missPoints: -10,
    order: 7,
  },
  pedri: {
    groupLabel: "GRUP B",
    groupKey: "b",
    goalContributions: 13,
    hitPoints: 20,
    missPoints: -10,
    order: 8,
  },
  "frenkie-de-jong": {
    groupLabel: "GRUP C",
    groupKey: "c",
    goalContributions: 9,
    hitPoints: 30,
    missPoints: -10,
    order: 9,
  },
  "jules-kounde": {
    groupLabel: "GRUP C",
    groupKey: "c",
    goalContributions: 7,
    hitPoints: 30,
    missPoints: -10,
    order: 10,
  },
  "marc-bernal": {
    groupLabel: "GRUP C",
    groupKey: "c",
    goalContributions: 6,
    hitPoints: 30,
    missPoints: -10,
    order: 11,
  },
  "joao-cancelo": {
    groupLabel: "GRUP D",
    groupKey: "d",
    goalContributions: 4,
    hitPoints: 40,
    missPoints: -5,
    order: 12,
  },
  "ronald-araujo": {
    groupLabel: "GRUP D",
    groupKey: "d",
    goalContributions: 4,
    hitPoints: 40,
    missPoints: -5,
    order: 13,
  },
  "eric-garcia": {
    groupLabel: "GRUP D",
    groupKey: "d",
    goalContributions: 3,
    hitPoints: 40,
    missPoints: -5,
    order: 14,
  },
  gavi: {
    groupLabel: "GRUP D",
    groupKey: "d",
    goalContributions: 1,
    hitPoints: 40,
    missPoints: -5,
    order: 15,
  },
  "alejandro-balde": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 3,
    hitPoints: 50,
    missPoints: -5,
    order: 16,
  },
  "gerard-martin": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 17,
  },
  "marc-casado": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 18,
  },
  "pau-cubarsi": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 19,
  },
  "andreas-christensen": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 0,
    hitPoints: 50,
    missPoints: -5,
    order: 20,
  },
  "jofre-torrents": {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 0,
    hitPoints: 50,
    missPoints: -5,
    order: 21,
  },
};

const teamBadgeVisualsById = {
  barcelona: {
    colors: ["#2147a5", "#a61c48", "#2147a5", "#a61c48"],
  },
  "al-ahly": {
    colors: ["#d0183a", "#f5f6f8"],
  },
  "atletico-madrid": {
    colors: ["#d71920", "#ffffff", "#1d3f72"],
  },
  "athletic-club": {
    colors: ["#d71920", "#ffffff", "#111111"],
  },
  "real-madrid": {
    colors: ["#ffffff"],
  },
  tottenham: {
    colors: ["#ffffff", "#111111"],
  },
};

const DEFAULT_TEAM_BADGE_COLORS = ["#6f7a95"];

const getTeamBadgeBackground = (teamId) => {
  const configuredColors = teamBadgeVisualsById[teamId]?.colors;

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

const matchData = {
  id: "barcelona-al-ahly-2026-08-19",
  homeTeamId: "barcelona",
  homeName: "Barça",
  homeLocation: "Barcelona",
  awayTeamId: "al-ahly",
  awayName: "Al-Ahly",
  awayCountry: "Egipte",
  kickoffLabel: "DIMECRES · 19 AGOST 2026 · 21:00",
  kickoffAt: "2026-08-19T21:00:00+02:00",
};

const PREDICTION_CELEBRATION_MS = 5600;

const getPredictionStorageKey = (userId) =>
  `vesalaporra_prediction_${String(userId)}_${matchData.id}`;

const getCountdown = () => {
  const remainingMilliseconds = Math.max(
    0,
    new Date(matchData.kickoffAt).getTime() - Date.now(),
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

const PROFILE_AVATAR_BUCKET = "vesalaporra-profile-avatars";

const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const PROFILE_NAME_MIN_LENGTH = 2;
const PROFILE_NAME_MAX_LENGTH = 32;

const RANKING_PAGE_SIZE = 20;
const CURRENT_RANKING_USER_ID = "twitter-demo-cris";

const rankingNamedProfiles = [
  {
    displayName: "Culer de Les Corts",
    handle: "culerdelescorts",
  },
  {
    displayName: "La Remuntada",
    handle: "laremuntada_fcb",
  },
  {
    displayName: "Pedri Potter",
    handle: "pedripotter8",
  },
  {
    displayName: "Senyera Blaugrana",
    handle: "senyerafcb",
  },
  {
    displayName: "Gol Nord 1899",
    handle: "golnord1899",
  },
  {
    displayName: "Culereta",
    handle: "culereta_bcn",
  },
  {
    displayName: "Més que una porra",
    handle: "mesqueunaporra",
  },
  {
    displayName: "La Masia Sempre",
    handle: "lamasiasempre",
  },
  {
    displayName: "Tiki Taka Culer",
    handle: "tikitakaculer",
  },
  {
    displayName: "Camp Nou Nights",
    handle: "campnounights",
  },
  {
    displayName: "Blaugrana 1902",
    handle: "blaugrana1902",
  },
  {
    displayName: "Culer del Poble",
    handle: "culerdelpoble",
  },
  {
    displayName: "Onze de Gala",
    handle: "onzegala",
  },
  {
    displayName: "Futbol i Seny",
    handle: "futboliseny",
  },
  {
    displayName: "Cris",
    handle: "cris",
    isCurrentUser: true,
  },
  {
    displayName: "La Pilota d’Or",
    handle: "pilotadorfcb",
  },
  {
    displayName: "Culer Empedreït",
    handle: "culersempre",
  },
  {
    displayName: "ADN Barça",
    handle: "adnbarca",
  },
  {
    displayName: "Nit de Champions",
    handle: "nitchampions",
  },
  {
    displayName: "La Sotana Culer",
    handle: "sotanaculer",
  },
  {
    displayName: "Tribuna 1899",
    handle: "tribuna1899",
  },
  {
    displayName: "Passió Blaugrana",
    handle: "passioblaugrana",
  },
  {
    displayName: "Culer del Vallès",
    handle: "culervalles",
  },
  {
    displayName: "Fins al Final",
    handle: "finsalfinalfcb",
  },
  {
    displayName: "Tercer Anell",
    handle: "terceranell",
  },
  {
    displayName: "La Culerada",
    handle: "laculerada",
  },
  {
    displayName: "Sempre Barça",
    handle: "semprebarca",
  },
  {
    displayName: "El Nou Camp",
    handle: "elnoucamp",
  },
  {
    displayName: "Onze Culé",
    handle: "onzecule",
  },
  {
    displayName: "Orgull Blaugrana",
    handle: "orgullblaugrana",
  },
];

const buildRankingDemoUsers = () => {
  const generatedProfiles = Array.from(
    {
      length: 120 - rankingNamedProfiles.length,
    },
    (_, generatedIndex) => {
      const number = generatedIndex + rankingNamedProfiles.length + 1;

      return {
        displayName: `Culer Blaugrana ${number}`,
        handle: `culer_bcn_${number}`,
      };
    },
  );

  return [...rankingNamedProfiles, ...generatedProfiles].map(
    (profile, index) => {
      const generalResultPoints =
        330 - index * 2 + ((index * 7) % 15) - (index % 12 === 0 ? 8 : 0);

      const generalXiPoints =
        225 -
        Math.floor(index * 1.45) +
        ((index * 5) % 11) -
        (index % 10 === 0 ? 6 : 0);

      const generalProtagonistPoints =
        145 -
        Math.floor(index * 0.92) +
        ((index * 3) % 9) -
        (index % 8 === 0 ? 5 : 0);

      const jornadaResultPoints =
        50 -
        Math.floor(index * 0.28) +
        ((index * 5) % 13) -
        (index % 7 === 0 ? 10 : 0);

      const jornadaXiPoints =
        25 -
        Math.floor(index * 0.17) +
        ((index * 4) % 10) -
        (index % 9 === 0 ? 8 : 0);

      const jornadaProtagonistPoints =
        20 -
        Math.floor(index * 0.12) +
        ((index * 3) % 8) -
        (index % 6 === 0 ? 5 : 0);

      const id = profile.isCurrentUser
        ? CURRENT_RANKING_USER_ID
        : `twitter-demo-${index + 1}`;

      return {
        id,
        twitterId: `x-${index + 100000}`,
        displayName: profile.displayName,
        handle: `@${profile.handle}`,
        handleSlug: profile.handle,
        twitterAvatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
          profile.handle,
        )}`,
        twitterUrl: `https://x.com/${profile.handle}`,
        hasXIdentity: true,
        identityProvider: "x",
        identityLabel: "X",
        joinedYear: 2026,
        isCurrentUser: Boolean(profile.isCurrentUser),
        general: {
          resultPoints: generalResultPoints,
          xiPoints: generalXiPoints,
          protagonistPoints: generalProtagonistPoints,
          totalPoints:
            generalResultPoints + generalXiPoints + generalProtagonistPoints,
        },
        jornada: {
          resultPoints: jornadaResultPoints,
          xiPoints: jornadaXiPoints,
          protagonistPoints: jornadaProtagonistPoints,
          totalPoints:
            jornadaResultPoints + jornadaXiPoints + jornadaProtagonistPoints,
        },
      };
    },
  );
};

const rankingDemoUsers = buildRankingDemoUsers();

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


const OFFICIAL_MATCH_TABLE =
  import.meta.env.VITE_VESALAPORRA_OFFICIAL_MATCH_TABLE ||
  "vesalaporra_official_matches";

const OFFICIAL_MATCH_STORAGE_KEY =
  "vesalaporra_official_match_j8-atletico-2026";

const NOTES_MATCH_DATA = {
  id: "j8-atletico-2026",
  eyebrow: "ÚLTIM PARTIT PUNTUAT",
  homeTeamId: "barcelona",
  homeName: "Barça",
  awayTeamId: "atletico-madrid",
  awayName: "Atlético",
  dateLabel: "18 OCTUBRE 2026",
};

const formatOfficialMatchTitle = (homeScore, awayScore) =>
  `${NOTES_MATCH_DATA.homeName} ${homeScore}–${awayScore} ${NOTES_MATCH_DATA.awayName}`;

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

const DEFAULT_MATCH_ROLE_BY_PLAYER_ID = {
  "joan-garcia": "T",
  "jules-kounde": "T",
  "pau-cubarsi": "T",
  "ronald-araujo": "T",
  "alejandro-balde": "T",
  pedri: "T",
  "frenkie-de-jong": "T",
  "fermin-lopez": "T",
  "lamine-yamal": "T",
  raphinha: "T",
  "anthony-gordon": "T",
  gavi: "S",
  "ferran-torres": "S",
  "dani-olmo": "S",
  "joao-cancelo": "S",
  "karim-adeyemi": "S",
};

const DEFAULT_MATCH_GOALS_BY_PLAYER_ID = {
  "lamine-yamal": 1,
  raphinha: 1,
};

const DEFAULT_MATCH_ASSISTS_BY_PLAYER_ID = {
  pedri: 1,
  "fermin-lopez": 1,
};

const createInitialOfficialMatchStats = () =>
  Object.fromEntries(
    players.map((player) => [
      player.id,
      {
        role: DEFAULT_MATCH_ROLE_BY_PLAYER_ID[player.id] || null,
        goals: DEFAULT_MATCH_GOALS_BY_PLAYER_ID[player.id] || 0,
        assists: DEFAULT_MATCH_ASSISTS_BY_PLAYER_ID[player.id] || 0,
      },
    ]),
  );

const createInitialOfficialMatchState = () => ({
  id: NOTES_MATCH_DATA.id,
  homeScore: 2,
  awayScore: 1,
  statsByPlayerId: createInitialOfficialMatchStats(),
  version: 1,
  publishedAt: null,
  updatedAt: null,
});

const normalizeOfficialMatchState = (rawState) => {
  const fallbackState = createInitialOfficialMatchState();

  const homeScore = Number(
    rawState?.homeScore ?? rawState?.home_score ?? fallbackState.homeScore,
  );

  const awayScore = Number(
    rawState?.awayScore ?? rawState?.away_score ?? fallbackState.awayScore,
  );

  const rawStats =
    rawState?.statsByPlayerId ??
    rawState?.player_stats ??
    rawState?.stats_by_player_id ??
    fallbackState.statsByPlayerId;

  const statsByPlayerId = Object.fromEntries(
    players.map((player) => {
      const playerStats = rawStats?.[player.id] || {};

      return [
        player.id,
        {
          role:
            playerStats.role === "T" || playerStats.role === "S"
              ? playerStats.role
              : null,
          goals: Math.max(0, Number(playerStats.goals || 0)),
          assists: Math.max(0, Number(playerStats.assists || 0)),
        },
      ];
    }),
  );

  return {
    id: NOTES_MATCH_DATA.id,
    homeScore: Number.isFinite(homeScore) ? Math.max(0, homeScore) : 0,
    awayScore: Number.isFinite(awayScore) ? Math.max(0, awayScore) : 0,
    statsByPlayerId,
    version: Math.max(
      1,
      Number(rawState?.version ?? fallbackState.version) || 1,
    ),
    publishedAt:
      rawState?.publishedAt ?? rawState?.published_at ?? null,
    updatedAt: rawState?.updatedAt ?? rawState?.updated_at ?? null,
  };
};

const officialMatchStateToSupabaseRow = (officialMatchState, updatedBy) => ({
  id: NOTES_MATCH_DATA.id,
  home_team_id: NOTES_MATCH_DATA.homeTeamId,
  away_team_id: NOTES_MATCH_DATA.awayTeamId,
  home_score: officialMatchState.homeScore,
  away_score: officialMatchState.awayScore,
  player_stats: officialMatchState.statsByPlayerId,
  version: officialMatchState.version,
  published_at: officialMatchState.publishedAt,
  updated_by: updatedBy || null,
});

const SEASON_RATING_AVERAGE_BY_PLAYER_ID = {
  "lamine-yamal": 8.9,
  pedri: 8.7,
  raphinha: 8.5,
  "fermin-lopez": 8.2,
  "pau-cubarsi": 8.1,
  "joan-garcia": 7.9,
  "frenkie-de-jong": 7.8,
  "jules-kounde": 7.7,
  "dani-olmo": 7.6,
  "ferran-torres": 7.5,
  "anthony-gordon": 7.4,
  "karim-adeyemi": 7.3,
  gavi: 7.2,
  "alejandro-balde": 7.1,
  "ronald-araujo": 7,
  "joao-cancelo": 6.9,
  "eric-garcia": 6.8,
  "marc-bernal": 6.7,
  "marc-casado": 6.6,
  "gerard-martin": 6.5,
  "andreas-christensen": 6.4,
  "jofre-torrents": 6.3,
  "wojciech-szczesny": 6.2,
};

const SEASON_PLAYER_STATS_BY_ID = Object.fromEntries(
  players.map((player, index) => {
    const starts = Math.max(0, 28 - Math.floor(index * 0.72));
    const substituteAppearances = Math.max(0, 3 + ((index * 3) % 9));
    const goals = Math.max(
      0,
      protagonistScoringByPlayerId[player.id]
        ? Math.round(
            protagonistScoringByPlayerId[player.id].goalContributions * 0.58,
          )
        : index % 7 === 0
          ? 1
          : 0,
    );
    const assists = Math.max(
      0,
      protagonistScoringByPlayerId[player.id]
        ? Math.round(
            protagonistScoringByPlayerId[player.id].goalContributions * 0.42,
          )
        : index % 9 === 0
          ? 1
          : 0,
    );

    return [
      player.id,
      {
        starts,
        substituteAppearances,
        goals,
        assists,
      },
    ];
  }),
);

const MATCH_COMMUNITY_RATING_BY_PLAYER_ID = Object.fromEntries(
  players.map((player, index) => {
    const average = Math.max(
      4.8,
      Math.min(
        9.4,
        (SEASON_RATING_AVERAGE_BY_PLAYER_ID[player.id] || 6.5) +
          (((index * 7) % 7) - 3) * 0.13,
      ),
    );
    const voteCount = 84 + ((index * 37) % 119);

    return [
      player.id,
      {
        average,
        voteCount,
        totalValue: average * voteCount,
      },
    ];
  }),
);

const SEASON_COMMUNITY_RATING_BY_PLAYER_ID = Object.fromEntries(
  players.map((player, index) => {
    const average = SEASON_RATING_AVERAGE_BY_PLAYER_ID[player.id] || 6;
    const voteCount = 610 + ((index * 79) % 970);

    return [
      player.id,
      {
        average,
        voteCount,
        totalValue: average * voteCount,
      },
    ];
  }),
);

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

function TeamColorBadge({ teamId, className = "" }) {
  return (
    <span
      className={`team-color-dot ${className}`.trim()}
      style={{
        background: getTeamBadgeBackground(teamId),
      }}
      aria-hidden="true"
    ></span>
  );
}

function OfficialMatchCard({
  homeScore,
  awayScore,
  editable = false,
  onHomeScoreChange,
  onAwayScoreChange,
}) {
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
      aria-label={formatOfficialMatchTitle(homeScore, awayScore)}
    >
      <span className="official-match-eyebrow">
        {NOTES_MATCH_DATA.eyebrow}
      </span>

      <div className="official-match-line">
        <div className="official-match-team home">
          <TeamColorBadge
            teamId={NOTES_MATCH_DATA.homeTeamId}
            className="official-match-badge"
          />

          <strong>{NOTES_MATCH_DATA.homeName}</strong>
        </div>

        {editable ? (
          <div className="official-score-editor" aria-label="Resultat oficial">
            <div className="official-score-side">
              <button
                type="button"
                onClick={() => changeScore("home", -1)}
                aria-label={`Resta un gol a ${NOTES_MATCH_DATA.homeName}`}
              >
                −
              </button>

              <strong>{homeScore}</strong>

              <button
                type="button"
                onClick={() => changeScore("home", 1)}
                aria-label={`Suma un gol a ${NOTES_MATCH_DATA.homeName}`}
              >
                +
              </button>
            </div>

            <span aria-hidden="true">–</span>

            <div className="official-score-side">
              <button
                type="button"
                onClick={() => changeScore("away", -1)}
                aria-label={`Resta un gol a ${NOTES_MATCH_DATA.awayName}`}
              >
                −
              </button>

              <strong>{awayScore}</strong>

              <button
                type="button"
                onClick={() => changeScore("away", 1)}
                aria-label={`Suma un gol a ${NOTES_MATCH_DATA.awayName}`}
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
            teamId={NOTES_MATCH_DATA.awayTeamId}
            className="official-match-badge"
          />

          <strong>{NOTES_MATCH_DATA.awayName}</strong>
        </div>
      </div>

      <small className="official-match-date">
        {NOTES_MATCH_DATA.dateLabel}
      </small>
    </section>
  );
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
          {achievement.icon}
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

function ProtagonistEventIcon({ type, count = null, className = "" }) {
  const isGoal = type === "goal";
  const eventLabel = isGoal ? "Gol" : "Assistència";

  return (
    <span
      className={`protagonist-event-stat ${type} ${className}`.trim()}
      aria-label={count === null ? eventLabel : `${eventLabel}: ${count}`}
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
    </span>
  );
}

function ParticipationRoleIcon({ type, count = null, className = "" }) {
  const isStarter = type === "starter";
  const roleLetter = isStarter ? "T" : "S";
  const roleLabel = isStarter ? "Titular" : "Suplent";

  return (
    <span
      className={`participation-role-stat ${type} ${className}`.trim()}
      aria-label={count === null ? roleLabel : `${roleLabel}: ${count}`}
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
    </span>
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

const profileDemoMatches = [
  {
    id: "j8",
    label: "J8",
    dateLabel: "18 OCT",
    opponent: "Atlético",
    opponentShort: "ATM",
    actualHome: 2,
    actualAway: 1,
    xiBase: 9,
    protagonist: "Raphinha",
    protagonistHitPoints: 10,
    protagonistMissPoints: -10,
  },
  {
    id: "j7",
    label: "J7",
    dateLabel: "04 OCT",
    opponent: "Sevilla",
    opponentShort: "SEV",
    actualHome: 3,
    actualAway: 0,
    xiBase: 10,
    protagonist: "Pedri",
    protagonistHitPoints: 20,
    protagonistMissPoints: -10,
  },
  {
    id: "j6",
    label: "J6",
    dateLabel: "27 SET",
    opponent: "Villarreal",
    opponentShort: "VIL",
    actualHome: 2,
    actualAway: 2,
    xiBase: 8,
    protagonist: "Fermín",
    protagonistHitPoints: 10,
    protagonistMissPoints: -10,
  },
  {
    id: "j5",
    label: "J5",
    dateLabel: "20 SET",
    opponent: "València",
    opponentShort: "VAL",
    actualHome: 4,
    actualAway: 1,
    xiBase: 11,
    protagonist: "Lamine",
    protagonistHitPoints: 5,
    protagonistMissPoints: -5,
  },
  {
    id: "j4",
    label: "J4",
    dateLabel: "13 SET",
    opponent: "Betis",
    opponentShort: "BET",
    actualHome: 1,
    actualAway: 0,
    xiBase: 7,
    protagonist: "Cubarsí",
    protagonistHitPoints: 50,
    protagonistMissPoints: -5,
  },
  {
    id: "j3",
    label: "J3",
    dateLabel: "30 AGO",
    opponent: "Athletic",
    opponentShort: "ATH",
    actualHome: 3,
    actualAway: 2,
    xiBase: 9,
    protagonist: "Dani Olmo",
    protagonistHitPoints: 20,
    protagonistMissPoints: -10,
  },
  {
    id: "j2",
    label: "J2",
    dateLabel: "23 AGO",
    opponent: "Real Sociedad",
    opponentShort: "RSO",
    actualHome: 2,
    actualAway: 0,
    xiBase: 8,
    protagonist: "Gavi",
    protagonistHitPoints: 40,
    protagonistMissPoints: -5,
  },
  {
    id: "j1",
    label: "J1",
    dateLabel: "16 AGO",
    opponent: "Mallorca",
    opponentShort: "MLL",
    actualHome: 3,
    actualAway: 1,
    xiBase: 10,
    protagonist: "Ferran",
    protagonistHitPoints: 10,
    protagonistMissPoints: -10,
  },
];

const profileXiPointsByHits = {
  11: 50,
  10: 25,
  9: 10,
  8: 5,
  7: 0,
  6: -5,
  5: -10,
  4: -15,
  3: -20,
  2: -25,
  1: -30,
  0: 30,
};

const getProfileSeed = (user) =>
  String(user?.twitterId || user?.handle || user?.id || "vesalaporra")
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

const getDemoResultSign = (homeGoals, awayGoals) => {
  if (homeGoals > awayGoals) {
    return "home";
  }

  if (homeGoals < awayGoals) {
    return "away";
  }

  return "draw";
};

const getDemoResultPoints = (
  predictedHome,
  predictedAway,
  actualHome,
  actualAway,
) => {
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 50;
  }

  let points = 0;

  if (
    getDemoResultSign(predictedHome, predictedAway) ===
    getDemoResultSign(actualHome, actualAway)
  ) {
    points += 10;
  }

  if (predictedHome === actualHome) {
    points += 15;
  }

  if (predictedAway === actualAway) {
    points += 10;
  }

  return points;
};

const getDemoOfficialPrediction = (user) => {
  const seed = getProfileSeed(user);
  const lineupOffset = seed % players.length;

  const lineupIds = Array.from({ length: 11 }, (_, index) =>
    players[(lineupOffset + index) % players.length].id,
  );

  const eligibleProtagonistIds = players
    .filter(
      (player) =>
        !player.isGoalkeeper && protagonistScoringByPlayerId[player.id],
    )
    .sort(
      (firstPlayer, secondPlayer) =>
        protagonistScoringByPlayerId[firstPlayer.id].order -
        protagonistScoringByPlayerId[secondPlayer.id].order,
    )
    .map((player) => player.id);

  return {
    predictedHome: seed % 5,
    predictedAway: Math.floor(seed / 7) % 4,
    lineupIds,
    protagonistId:
      eligibleProtagonistIds[seed % eligibleProtagonistIds.length],
  };
};

const getOfficialMatchPointsForUser = (user, officialMatchState) => {
  const prediction = getDemoOfficialPrediction(user);

  const officialStarterIds = new Set(
    Object.entries(officialMatchState.statsByPlayerId)
      .filter(([, stats]) => stats.role === "T")
      .map(([playerId]) => playerId),
  );

  const xiHits = prediction.lineupIds.filter((playerId) =>
    officialStarterIds.has(playerId),
  ).length;

  const protagonistStats =
    officialMatchState.statsByPlayerId[prediction.protagonistId] || {};

  const protagonistHit =
    Number(protagonistStats.goals || 0) > 0 ||
    Number(protagonistStats.assists || 0) > 0;

  const protagonistScoring =
    protagonistScoringByPlayerId[prediction.protagonistId];

  const resultPoints = getDemoResultPoints(
    prediction.predictedHome,
    prediction.predictedAway,
    officialMatchState.homeScore,
    officialMatchState.awayScore,
  );

  const xiPoints = profileXiPointsByHits[xiHits] ?? -30;

  const protagonistPoints = protagonistHit
    ? protagonistScoring.hitPoints
    : protagonistScoring.missPoints;

  return {
    ...prediction,
    actualHome: officialMatchState.homeScore,
    actualAway: officialMatchState.awayScore,
    xiHits,
    protagonistHit,
    protagonistPoints,
    resultPoints,
    xiPoints,
    totalPoints: resultPoints + xiPoints + protagonistPoints,
    isExact:
      prediction.predictedHome === officialMatchState.homeScore &&
      prediction.predictedAway === officialMatchState.awayScore,
  };
};

const applyOfficialMatchPointsToRankingUser = (user, officialMatchState) => {
  const jornada = getOfficialMatchPointsForUser(user, officialMatchState);

  const previousGeneral = {
    resultPoints: Math.max(
      0,
      user.general.resultPoints - user.jornada.resultPoints,
    ),
    xiPoints: Math.max(0, user.general.xiPoints - user.jornada.xiPoints),
    protagonistPoints:
      user.general.protagonistPoints - user.jornada.protagonistPoints,
  };

  const officialJornada = {
    resultPoints: jornada.resultPoints,
    xiPoints: jornada.xiPoints,
    protagonistPoints: jornada.protagonistPoints,
    totalPoints: jornada.totalPoints,
  };

  const general = {
    resultPoints: previousGeneral.resultPoints + officialJornada.resultPoints,
    xiPoints: previousGeneral.xiPoints + officialJornada.xiPoints,
    protagonistPoints:
      previousGeneral.protagonistPoints + officialJornada.protagonistPoints,
    totalPoints: 0,
  };

  general.totalPoints =
    general.resultPoints + general.xiPoints + general.protagonistPoints;

  return {
    ...user,
    general,
    jornada: officialJornada,
  };
};

const buildProfileDemoData = (
  user,
  generalPosition,
  jornadaPosition,
  officialMatchState,
) => {
  const seed = getProfileSeed(user);
  const officialJourney = getOfficialMatchPointsForUser(
    user,
    officialMatchState,
  );

  const history = profileDemoMatches.map((match, index) => {
    if (match.id === "j8") {
      const protagonistPlayer = playersById[officialJourney.protagonistId];

      return {
        ...match,
        actualHome: officialJourney.actualHome,
        actualAway: officialJourney.actualAway,
        predictedHome: officialJourney.predictedHome,
        predictedAway: officialJourney.predictedAway,
        xiHits: officialJourney.xiHits,
        protagonist:
          protagonistPlayer?.shortName || protagonistPlayer?.name || "Jugador",
        protagonistHit: officialJourney.protagonistHit,
        resultPoints: officialJourney.resultPoints,
        xiPoints: officialJourney.xiPoints,
        protagonistPoints: officialJourney.protagonistPoints,
        totalPoints: officialJourney.totalPoints,
        isExact: officialJourney.isExact,
      };
    }

    const homeVariation = ((seed + index * 5) % 3) - 1;
    const awayVariation = ((seed + index * 7) % 3) - 1;
    const predictedHome = Math.max(0, match.actualHome + homeVariation);
    const predictedAway = Math.max(0, match.actualAway + awayVariation);
    const totalXiMiss = (seed + index * 13) % 41 === 0;

    const xiHits = totalXiMiss
      ? 0
      : Math.max(
          0,
          Math.min(11, match.xiBase + (((seed + index * 3) % 3) - 1)),
        );

    const protagonistHit = (seed + index * 11) % 5 < 3;

    const resultPoints = getDemoResultPoints(
      predictedHome,
      predictedAway,
      match.actualHome,
      match.actualAway,
    );

    const xiPoints = profileXiPointsByHits[xiHits];

    const protagonistPoints = protagonistHit
      ? match.protagonistHitPoints
      : match.protagonistMissPoints;

    return {
      ...match,
      predictedHome,
      predictedAway,
      xiHits,
      protagonistHit,
      resultPoints,
      xiPoints,
      protagonistPoints,
      totalPoints: resultPoints + xiPoints + protagonistPoints,
      isExact:
        predictedHome === match.actualHome &&
        predictedAway === match.actualAway,
    };
  });

  const played = 18 + (seed % 11);
  const exactXiCount =
    history.filter((match) => match.xiHits === 11).length + (seed % 3);
  const exactScores =
    history.filter((match) => match.isExact).length + (seed % 2);
  const protagonistHits = history.filter(
    (match) => match.protagonistHit,
  ).length;
  const jornadaWins = Math.min(
    5,
    (seed % 3) + (jornadaPosition === 1 ? 1 : 0),
  );
  const topTenConsecutive =
    generalPosition > 0 && generalPosition <= 10 ? 3 + (seed % 2) : seed % 3;
  const allXiMisses =
    history.filter((match) => match.xiHits === 0).length +
    (seed % 17 === 0 ? 1 : 0);

  const averageXi =
    history.reduce((total, match) => total + match.xiHits, 0) / history.length;

  const bestMatch = [...history].sort(
    (firstMatch, secondMatch) =>
      secondMatch.totalPoints - firstMatch.totalPoints,
  )[0];

  const bestXi = Math.max(...history.map((match) => match.xiHits));

  const bestProtagonistPoints = Math.max(
    ...history.map((match) => match.protagonistPoints),
  );

  const longestStreak = 2 + (seed % 5);

  const achievements = [
    {
      id: "flick-reader",
      icon: "🧠",
      title: "Llegeix Flick",
      description: "Encerta 3 vegades l’11 titular exacte.",
      unlocked: exactXiCount >= 3,
      progress: `${Math.min(exactXiCount, 3)}/3`,
    },
    {
      id: "nostradamus",
      icon: "🔮",
      title: "Nostradamus",
      description: "Encerta el resultat exacte 3 cops.",
      unlocked: exactScores >= 3,
      progress: `${Math.min(exactScores, 3)}/3`,
    },
    {
      id: "yoyalodije",
      icon: "🎯",
      title: "Yoyalodije",
      description: "Encerta el protagonista —marca o assisteix— 3 cops.",
      unlocked: protagonistHits >= 3,
      progress: `${Math.min(protagonistHits, 3)}/3`,
    },
    {
      id: "winner",
      icon: "👑",
      title: "Winner",
      description: "Guanya 3 cops una jornada.",
      unlocked: jornadaWins >= 3,
      progress: `${Math.min(jornadaWins, 3)}/3`,
    },
    {
      id: "candidat",
      icon: "🚴",
      title: "Candidat",
      description: "Estigues al Top 10 tres jornades seguides.",
      unlocked: topTenConsecutive >= 3,
      progress: `${Math.min(topTenConsecutive, 3)}/3`,
    },
    {
      id: "xop-xop-salinas",
      icon: "🐙",
      title: "Xop xop Salinas",
      description:
        "Falla tots els jugadors una vegada intentant encertar l’11 titular.",
      unlocked: allXiMisses >= 1,
      progress: `${Math.min(allXiMisses, 1)}/1`,
    },
  ];

  return {
    history,
    played,
    exactXiCount,
    exactScores,
    protagonistHits,
    averageXi,
    bestMatch,
    bestXi,
    bestProtagonistPoints,
    longestStreak,
    jornadaWins,
    topTenConsecutive,
    allXiMisses,
    achievements,
    unlockedAchievements: achievements.filter(
      (achievement) => achievement.unlocked,
    ).length,
  };
};

const VESALAPORRA_CURRENT_MATCH_ID =
  import.meta.env.VITE_VESALAPORRA_CURRENT_MATCH_ID ||
  "6e6e5216-0d3f-4a65-9171-31b72026b001";

const PLAYER_SOURCE_MAX_BYTES = 5 * 1024 * 1024;

const PLAYER_SOURCE_ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const EMPTY_ADMIN_PLAYER_FORM = {
  displayName: "",
  shortName: "",
  shirtNumber: "",
  playerKey: "",
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
  rosterOrder: Number(row.roster_order || 9999),
  isDynamicPlayer: true,
});

const getDefaultDynamicProtagonistScoring = (player) => {
  if (!player?.eligibleForProtagonist) {
    return null;
  }

  return {
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 0,
    hitPoints: 50,
    missPoints: -5,
    order: 1000 + Number(player.rosterOrder || 0),
  };
};

const formation433 = [
  {
    id: "forwards",
    label: "Davanters",
    slots: [0, 1, 2],
  },
  {
    id: "midfielders",
    label: "Migcampistes",
    slots: [3, 4, 5],
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
  const [activePage, setActivePage] = useState("play");

  const [rankingTab, setRankingTab] = useState("general");

  const [visibleRankingCount, setVisibleRankingCount] =
    useState(RANKING_PAGE_SIZE);

  const [selectedProfileUserId, setSelectedProfileUserId] = useState(
    CURRENT_RANKING_USER_ID,
  );

  const [profileTab, setProfileTab] = useState("overview");

  const [authSession, setAuthSession] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [authActionLoading, setAuthActionLoading] = useState(false);

  const [authError, setAuthError] = useState("");

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [authProfile, setAuthProfile] = useState(null);

  const [profileLoading, setProfileLoading] = useState(false);

  const [profileNameEditorOpen, setProfileNameEditorOpen] = useState(false);

  const [profileDraftName, setProfileDraftName] = useState("");

  const [profileActionLoading, setProfileActionLoading] = useState(false);

  const [profileFeedback, setProfileFeedback] = useState(null);

  const profileAvatarInputRef = useRef(null);

  const [barcaScore, setBarcaScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [scoreTouched, setScoreTouched] = useState(false);

  const [lineup, setLineup] = useState(Array.from({ length: 11 }, () => null));

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const [protagonistId, setProtagonistId] = useState(null);

  const [openInfoSection, setOpenInfoSection] = useState(null);

  const [countdown, setCountdown] = useState(getCountdown);

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const [predictionConfirmed, setPredictionConfirmed] = useState(false);

  const [confirmedPrediction, setConfirmedPrediction] = useState(null);

  const [confirmationAnimationActive, setConfirmationAnimationActive] =
    useState(false);

  const confirmationAnimationTimerRef = useRef(null);

  const [notesTab, setNotesTab] = useState("match");

  const [notesRatingsByPlayerId, setNotesRatingsByPlayerId] = useState({});

  const [officialMatchState, setOfficialMatchState] = useState(
    createInitialOfficialMatchState,
  );

  const [officialMatchSaving, setOfficialMatchSaving] = useState(false);

  const [officialMatchFeedback, setOfficialMatchFeedback] = useState(null);

  const [selectedAdminTool, setSelectedAdminTool] = useState(null);


  const [backendIsAdmin, setBackendIsAdmin] = useState(false);

  const [adminScoringTab, setAdminScoringTab] = useState("match");

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

  const adminPlayerFileInputRef = useRef(null);

  const officialMatchStatsByPlayerId = officialMatchState.statsByPlayerId;
  const officialHomeScore = officialMatchState.homeScore;
  const officialAwayScore = officialMatchState.awayScore;

  const authUser = authSession?.user ?? null;

  const isAdmin =
    import.meta.env.DEV ||
    backendIsAdmin ||
    Boolean(
      authUser && VESALAPORRA_ADMIN_USER_IDS.includes(String(authUser.id)),
    );

  const mergedPublicMatchPlayers = [
    ...publicMatchPlayers,
    ...players.filter(
      (player) =>
        !publicMatchPlayers.some(
          (dynamicPlayer) =>
            dynamicPlayer.name.trim().toLocaleLowerCase("ca") ===
            player.name.trim().toLocaleLowerCase("ca"),
        ),
    ),
  ];

  const gamePlayers =
    publicMatchPlayers.length >= 11
      ? [...publicMatchPlayers].sort(
          (firstPlayer, secondPlayer) =>
            firstPlayer.rosterOrder - secondPlayer.rosterOrder,
        )
      : mergedPublicMatchPlayers.filter(
          (player, index, allPlayers) =>
            allPlayers.findIndex((candidate) => candidate.id === player.id) ===
            index,
        );

  const lineupPlayers = gamePlayers.filter(
    (player) => player.eligibleForLineup !== false,
  );

  const gamePlayersById = Object.fromEntries(
    gamePlayers.map((player) => [player.id, player]),
  );

  const getPlayerProtagonistScoring = (player) =>
    protagonistScoringByPlayerId[player?.id] ||
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

  const eligibleProtagonistPlayers = gamePlayers
    .filter(
      (player) =>
        !player.isGoalkeeper && Boolean(getPlayerProtagonistScoring(player)),
    )
    .sort(
      (firstPlayer, secondPlayer) =>
        getPlayerProtagonistScoring(firstPlayer).order -
        getPlayerProtagonistScoring(secondPlayer).order,
    );

  const protagonist = protagonistId ? gamePlayersById[protagonistId] : null;

  const protagonistScoring = protagonist
    ? getPlayerProtagonistScoring(protagonist)
    : null;

  const protagonistIsComplete = Boolean(protagonist && protagonistScoring);

  const confirmButtonLabel = predictionConfirmed
    ? "PRONÒSTIC CONFIRMAT"
    : countdown.isClosed
      ? "PORRA TANCADA"
      : !authLoading && !authUser
        ? "ENTRA PER CONFIRMAR"
        : "CONFIRMA EL TEU PRONÒSTIC";

  const rankingUsers = rankingDemoUsers.map((baseUser) => {
    const identityUser =
      baseUser.isCurrentUser && authUser
        ? {
            ...baseUser,
            authUserId: authUser.id,
            twitterId: authUser.id,
            displayName: profileDisplayName,
            handle:
              authIsX && providerHandleSlug ? `@${providerHandleSlug}` : "",
            handleSlug: authIsX ? providerHandleSlug : "",
            twitterAvatarUrl: profileAvatarUrl,
            twitterUrl: providerTwitterUrl,
            hasXIdentity: authIsX && Boolean(providerHandleSlug),
            identityProvider: authProvider || "vesalaporra",
            identityLabel: authIsX
              ? "X"
              : authProvider === "google"
                ? "GOOGLE"
                : "VESALAPORRA",
            joinedYear: profileJoinedYear,
          }
        : baseUser;

    return applyOfficialMatchPointsToRankingUser(
      identityUser,
      officialMatchState,
    );
  });

  const rankingRows = [...rankingUsers].sort((firstUser, secondUser) => {
    const firstPoints = firstUser[rankingTab];
    const secondPoints = secondUser[rankingTab];

    return (
      secondPoints.totalPoints - firstPoints.totalPoints ||
      secondPoints.resultPoints - firstPoints.resultPoints ||
      secondPoints.xiPoints - firstPoints.xiPoints ||
      secondPoints.protagonistPoints - firstPoints.protagonistPoints ||
      firstUser.id.localeCompare(secondUser.id)
    );
  });

  const visibleRankingRows = rankingRows.slice(0, visibleRankingCount);

  const rankingHasMore = visibleRankingCount < rankingRows.length;

  const currentRankingPosition =
    rankingRows.findIndex((user) => user.isCurrentUser) + 1;

  const currentRankingUser =
    rankingRows.find((user) => user.isCurrentUser) || rankingRows[0];

  const selectedProfileUser =
    rankingUsers.find((user) => user.id === selectedProfileUserId) ||
    currentRankingUser;

  const generalRankingRows = [...rankingUsers].sort((firstUser, secondUser) => {
    const firstPoints = firstUser.general;
    const secondPoints = secondUser.general;

    return (
      secondPoints.totalPoints - firstPoints.totalPoints ||
      secondPoints.resultPoints - firstPoints.resultPoints ||
      secondPoints.xiPoints - firstPoints.xiPoints ||
      secondPoints.protagonistPoints - firstPoints.protagonistPoints ||
      firstUser.id.localeCompare(secondUser.id)
    );
  });

  const selectedProfilePosition =
    generalRankingRows.findIndex(
      (user) => user.id === selectedProfileUser?.id,
    ) + 1;

  const jornadaRankingRows = [...rankingUsers].sort(
    (firstUser, secondUser) => {
      const firstPoints = firstUser.jornada;
      const secondPoints = secondUser.jornada;

      return (
        secondPoints.totalPoints - firstPoints.totalPoints ||
        secondPoints.resultPoints - firstPoints.resultPoints ||
        secondPoints.xiPoints - firstPoints.xiPoints ||
        secondPoints.protagonistPoints - firstPoints.protagonistPoints ||
        firstUser.id.localeCompare(secondUser.id)
      );
    },
  );

  const selectedProfileJornadaPosition =
    jornadaRankingRows.findIndex(
      (user) => user.id === selectedProfileUser?.id,
    ) + 1;

  const getProfileDataForUser = (user) => {
    const generalPosition =
      generalRankingRows.findIndex((row) => row.id === user.id) + 1;

    const jornadaPosition =
      jornadaRankingRows.findIndex((row) => row.id === user.id) + 1;

    return buildProfileDemoData(
      user,
      generalPosition,
      jornadaPosition,
      officialMatchState,
    );
  };

  const selectedProfileData = selectedProfileUser
    ? getProfileDataForUser(selectedProfileUser)
    : null;

  const isOwnAuthenticatedProfile = Boolean(
    authUser && selectedProfileUser?.isCurrentUser,
  );

  const notesMatchRows = players
    .filter((player) => {
      const stats = officialMatchStatsByPlayerId[player.id];

      return stats?.role === "T" || stats?.role === "S";
    })
    .map((player) => {
      const ownStars = notesRatingsByPlayerId[player.id] || 0;
      const ratingSummary = getCombinedRatingSummary(
        MATCH_COMMUNITY_RATING_BY_PLAYER_ID[player.id],
        ownStars,
      );

      return {
        player,
        stats: officialMatchStatsByPlayerId[player.id],
        ownStars,
        displayStars: ownStars,
        average: ratingSummary.average,
        voteCount: ratingSummary.voteCount,
      };
    });

  const notesSeasonRows = players
    .map((player) => {
      const ratingSummary =
        SEASON_COMMUNITY_RATING_BY_PLAYER_ID[player.id] || null;
      const average = ratingSummary?.average || 0;

      return {
        player,
        stats: SEASON_PLAYER_STATS_BY_ID[player.id],
        ownStars: 0,
        displayStars: getStarsFromAverage(average),
        average,
        voteCount: ratingSummary?.voteCount || 0,
      };
    })
    .sort(
      (firstRow, secondRow) =>
        secondRow.average - firstRow.average ||
        secondRow.voteCount - firstRow.voteCount ||
        firstRow.player.name.localeCompare(secondRow.player.name, "ca"),
    );

  const visibleNotesRows =
    notesTab === "match" ? notesMatchRows : notesSeasonRows;

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

  const handleRatePlayer = (playerId, stars) => {
    if (!authUser) {
      handleXSignIn();
      return;
    }

    setNotesRatingsByPlayerId((currentRatings) => ({
      ...currentRatings,
      [playerId]: stars,
    }));
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
    const starterCount = Object.values(
      officialMatchState.statsByPlayerId,
    ).filter((stats) => stats.role === "T").length;

    if (starterCount !== 11) {
      return `Cal marcar exactament 11 titulars. Ara n’hi ha ${starterCount}.`;
    }

    const barcaGoals = Object.values(
      officialMatchState.statsByPlayerId,
    ).reduce((total, stats) => total + Number(stats.goals || 0), 0);

    if (barcaGoals !== officialMatchState.homeScore) {
      return `Els gols assignats als jugadors (${barcaGoals}) han de coincidir amb els gols del Barça (${officialMatchState.homeScore}).`;
    }

    const invalidEventPlayer = gamePlayers.find((player) => {
      const stats = officialMatchState.statsByPlayerId[player.id];

      return (
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

    const publishedState = {
      ...officialMatchState,
      version: officialMatchState.version + 1,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOfficialMatchSaving(true);
    setOfficialMatchFeedback(null);
    setOfficialMatchState(publishedState);

    try {
      window.localStorage.setItem(
        OFFICIAL_MATCH_STORAGE_KEY,
        JSON.stringify(publishedState),
      );

      const { data, error } = await supabase
        .from(OFFICIAL_MATCH_TABLE)
        .upsert(
          officialMatchStateToSupabaseRow(publishedState, authUser?.id),
          {
            onConflict: "id",
          },
        )
        .select(
          "id, home_score, away_score, player_stats, version, published_at, updated_at",
        )
        .single();

      if (error) {
        throw error;
      }

      setOfficialMatchState(normalizeOfficialMatchState(data));
      setOfficialMatchFeedback({
        type: "success",
        message:
          "Partit guardat. Les Notes, el Rànquing, el Perfil i totes les puntuacions ja llegeixen aquesta versió oficial.",
      });
    } catch (error) {
      console.warn(
        "No s’ha pogut sincronitzar la font oficial amb Supabase:",
        error,
      );

      setOfficialMatchFeedback({
        type: "warning",
        message:
          "El càlcul s’ha aplicat instantàniament en aquest navegador, però Supabase no ha confirmat el guardat. Revisa la taula oficial abans de publicar.",
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
        nextStats.role = "T";
      }

      if (toolId === "substitute") {
        nextStats.role = "S";
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

  const clearAdminPlayerRole = (playerId) => {
    if (!isAdmin) {
      return;
    }

    setOfficialMatchStatsByPlayerId((currentStatsByPlayerId) => ({
      ...currentStatsByPlayerId,
      [playerId]: {
        ...currentStatsByPlayerId[playerId],
        role: null,
      },
    }));
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

  const handleAdminToolDragStart = (event, toolId) => {
    event.dataTransfer.setData("text/plain", toolId);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleAdminPlayerDrop = (event, playerId) => {
    event.preventDefault();

    const toolId = event.dataTransfer.getData("text/plain");

    if (ADMIN_SCORING_TOOLS.some((tool) => tool.id === toolId)) {
      applyAdminToolToPlayer(playerId, toolId);
    }
  };

  const loadPublicMatchPlayers = async () => {
    const { data, error } = await supabase.rpc(
      "vesalaporra_public_match_players",
      {
        p_match_id: VESALAPORRA_CURRENT_MATCH_ID,
      },
    );

    if (error) {
      console.warn("No s’ha pogut carregar la plantilla pública:", error);
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
          p_match_id: VESALAPORRA_CURRENT_MATCH_ID,
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
    const shortName = adminPlayerForm.shortName.trim();
    const playerKey = adminPlayerForm.playerKey.trim();
    const shirtNumber = adminPlayerForm.shirtNumber.trim();

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
          p_short_name: shortName || null,
          p_shirt_number: shirtNumber === "" ? null : Number(shirtNumber),
          p_player_key: playerKey || null,
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
        "source_path",
        "upload_path",
        "object_path",
        "path",
      ]);

      if (!uploadId || !sourceBucket || !sourcePath) {
        throw new Error(
          "La preparació de la pujada no ha retornat upload_id, bucket i path.",
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

    const nextValues = {
      availabilityStatus:
        patch.availabilityStatus ?? player.availabilityStatus ?? "available",
      isPublicVisible:
        patch.isPublicVisible ?? Boolean(player.isPublicVisible),
      eligibleForLineup:
        patch.eligibleForLineup ?? Boolean(player.eligibleForLineup),
      eligibleForProtagonist:
        patch.eligibleForProtagonist ??
        Boolean(player.eligibleForProtagonist),
      eligibleForRatings:
        patch.eligibleForRatings ?? Boolean(player.eligibleForRatings),
      adminNote: patch.adminNote ?? player.adminNote ?? "",
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
          p_match_id: VESALAPORRA_CURRENT_MATCH_ID,
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
        message: "Configuració del jugador guardada.",
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
          p_match_id: VESALAPORRA_CURRENT_MATCH_ID,
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
      player.catalogStatus === "archived" ? "active" : "archived";

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
          p_audit_id: createAdminAuditId("UPDATE_PLAYER_STATUS"),
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

      await loadAdminPlayerWorkspace({ quiet: true });
    } catch (error) {
      setAdminPlayerFeedback({
        type: "error",
        message: error?.message || "No s’ha pogut actualitzar el jugador.",
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

      const providerLabel = provider === "x" ? "X" : "Google";

      setAuthError(
        error?.message ||
          `No s’ha pogut obrir ${providerLabel}. Torna-ho a provar.`,
      );
      setAuthActionLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleOAuthSignIn("google");

  const handleXSignIn = () => handleOAuthSignIn("x");

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

    try {
      await persistProfile({
        displayName: nextDisplayName,
        avatarUrl: profileAvatarUrl,
        avatarPath: authProfile?.avatarPath || null,
      });

      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: nextDisplayName,
        },
      });

      if (error) {
        console.warn(
          "No s’ha pogut sincronitzar el nom amb auth metadata:",
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

      setAuthProfile((currentProfile) => ({
        ...(currentProfile || {}),
        displayName: nextDisplayName,
        avatarUrl: profileAvatarUrl,
      }));
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

      setAccountMenuOpen(false);
    } catch (error) {
      setAuthError(error?.message || "No s’ha pogut tancar la sessió.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleConfirmPrediction = () => {
    if (
      predictionConfirmed ||
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

    setConfirmationDialogOpen(true);
  };

  const handleCancelPredictionConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleFinalizePrediction = () => {
    if (
      !authUser ||
      predictionConfirmed ||
      countdown.isClosed ||
      !scoreTouched
    ) {
      return;
    }

    const predictionSnapshot = {
      matchId: matchData.id,
      confirmedAt: new Date().toISOString(),
      barcaScore,
      rivalScore,
      lineup: [...lineup],
      protagonistId,
    };

    try {
      window.localStorage.setItem(
        getPredictionStorageKey(authUser.id),
        JSON.stringify(predictionSnapshot),
      );
    } catch (error) {
      console.warn(
        "No s’ha pogut conservar el pronòstic al navegador:",
        error,
      );
    }

    setConfirmedPrediction(predictionSnapshot);
    setPredictionConfirmed(true);
    setConfirmationDialogOpen(false);
    setSelectedSlotIndex(null);
    setSelectedPlayerId(null);
    setConfirmationAnimationActive(false);

    window.requestAnimationFrame(() => {
      setConfirmationAnimationActive(true);
    });

    if (confirmationAnimationTimerRef.current) {
      window.clearTimeout(confirmationAnimationTimerRef.current);
    }

    confirmationAnimationTimerRef.current = window.setTimeout(() => {
      setConfirmationAnimationActive(false);
      confirmationAnimationTimerRef.current = null;
    }, PREDICTION_CELEBRATION_MS);
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
    loadPublicMatchPlayers();
  }, []);

  useEffect(() => {
    if (activePage === "scoring" && isAdmin && adminScoringTab === "players") {
      loadAdminPlayerWorkspace();
    }
  }, [activePage, adminScoringTab, isAdmin]);

  useEffect(() => {
    let isMounted = true;

    const cleanAuthUrl = () => {
      if (
        window.location.pathname === "/auth/callback" ||
        window.location.pathname === "/entra-x"
      ) {
        window.history.replaceState({}, document.title, "/");
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

      if (oauthError) {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);

        if (isMounted) {
          setAuthError(oauthError);
          setAuthLoading(false);
          setAuthActionLoading(false);
          cleanAuthUrl();
        }

        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setAuthSession(data.session ?? null);
      setAuthLoading(false);

      if (data.session) {
        window.sessionStorage.removeItem(X_AUTO_LOGIN_STORAGE_KEY);
        setActivePage("play");
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
        setAccountMenuOpen(false);
        setActivePage("play");
        cleanAuthUrl();
      }

      if (event === "SIGNED_OUT") {
        setAccountMenuOpen(false);
        setAuthProfile(null);
        setProfileDraftName("");
        setProfileNameEditorOpen(false);
        setProfileFeedback(null);
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
    const resetPredictionDraft = () => {
      setBarcaScore(0);
      setRivalScore(0);
      setScoreTouched(false);
      setLineup(Array.from({ length: 11 }, () => null));
      setProtagonistId(null);
      setSelectedSlotIndex(null);
      setSelectedPlayerId(null);
      setPredictionConfirmed(false);
      setConfirmedPrediction(null);
      setConfirmationDialogOpen(false);
      setConfirmationAnimationActive(false);
    };

    if (!authUser) {
      resetPredictionDraft();
      return;
    }

    const storageKey = getPredictionStorageKey(authUser.id);

    try {
      const storedPrediction = window.localStorage.getItem(storageKey);

      if (!storedPrediction) {
        resetPredictionDraft();
        return;
      }

      const parsedPrediction = JSON.parse(storedPrediction);

      if (
        parsedPrediction?.matchId !== matchData.id ||
        !Number.isFinite(parsedPrediction?.barcaScore) ||
        !Number.isFinite(parsedPrediction?.rivalScore) ||
        !Array.isArray(parsedPrediction?.lineup)
      ) {
        window.localStorage.removeItem(storageKey);
        resetPredictionDraft();
        return;
      }

      const restoredLineup = Array.from(
        { length: 11 },
        (_, index) => parsedPrediction.lineup[index] || null,
      );

      setBarcaScore(parsedPrediction.barcaScore);
      setRivalScore(parsedPrediction.rivalScore);
      setScoreTouched(true);
      setLineup(restoredLineup);
      setProtagonistId(parsedPrediction.protagonistId || null);
      setConfirmedPrediction({
        ...parsedPrediction,
        lineup: restoredLineup,
      });
      setPredictionConfirmed(true);
    } catch (error) {
      console.warn("No s’ha pogut restaurar el pronòstic confirmat:", error);
      window.localStorage.removeItem(storageKey);
      resetPredictionDraft();
    }
  }, [authUser?.id]);

  useEffect(
    () => () => {
      if (confirmationAnimationTimerRef.current) {
        window.clearTimeout(confirmationAnimationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const countdownInterval = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, []);

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
    }
  }, [protagonistId, publicMatchPlayers]);

  useEffect(() => {
    let isCurrent = true;

    try {
      const storedOfficialMatch = window.localStorage.getItem(
        OFFICIAL_MATCH_STORAGE_KEY,
      );

      if (storedOfficialMatch) {
        setOfficialMatchState(
          normalizeOfficialMatchState(JSON.parse(storedOfficialMatch)),
        );
      }
    } catch (error) {
      console.warn("No s’ha pogut restaurar el partit oficial local:", error);
    }

    const loadOfficialMatch = async () => {
      const { data, error } = await supabase
        .from(OFFICIAL_MATCH_TABLE)
        .select(
          "id, home_score, away_score, player_stats, version, published_at, updated_at",
        )
        .eq("id", NOTES_MATCH_DATA.id)
        .maybeSingle();

      if (!isCurrent || error || !data) {
        if (error) {
          console.warn(
            "La font oficial de Supabase encara no està disponible:",
            error,
          );
        }
        return;
      }

      const normalizedState = normalizeOfficialMatchState(data);
      setOfficialMatchState(normalizedState);
      window.localStorage.setItem(
        OFFICIAL_MATCH_STORAGE_KEY,
        JSON.stringify(normalizedState),
      );
    };

    loadOfficialMatch();

    const officialMatchChannel = supabase
      .channel(`vesalaporra-official-match-${NOTES_MATCH_DATA.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: OFFICIAL_MATCH_TABLE,
          filter: `id=eq.${NOTES_MATCH_DATA.id}`,
        },
        (payload) => {
          const nextRow = payload.new;

          if (!nextRow?.id) {
            return;
          }

          const normalizedState = normalizeOfficialMatchState(nextRow);
          setOfficialMatchState(normalizedState);
          window.localStorage.setItem(
            OFFICIAL_MATCH_STORAGE_KEY,
            JSON.stringify(normalizedState),
          );
        },
      )
      .subscribe();

    return () => {
      isCurrent = false;
      supabase.removeChannel(officialMatchChannel);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        OFFICIAL_MATCH_STORAGE_KEY,
        JSON.stringify(officialMatchState),
      );
    } catch (error) {
      console.warn("No s’ha pogut conservar el partit oficial:", error);
    }
  }, [officialMatchState]);

  useEffect(() => {
    if (activePage === "scoring" && !isAdmin) {
      setActivePage("play");
    }
  }, [activePage, isAdmin]);

  const placePlayerInSlot = (playerId, targetSlotIndex) => {
    if (predictionConfirmed || !gamePlayersById[playerId]) {
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
    if (predictionConfirmed || !gamePlayersById[playerId]) {
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
    if (predictionConfirmed) {
      return;
    }

    const fieldPlayerId = lineup[slotIndex];

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
    if (predictionConfirmed) {
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

    if (predictionConfirmed) {
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
    if (predictionConfirmed) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("text/plain", playerId);

    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, targetSlotIndex) => {
    event.preventDefault();

    if (predictionConfirmed) {
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
      <header className="app-header">
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
              LA PORRA
            </button>

            <button
              type="button"
              className={
                activePage === "notes" ? "nav-button active" : "nav-button"
              }
              onClick={() => setActivePage("notes")}
            >
              LES NOTES
            </button>

            <button
              type="button"
              className={
                activePage === "ranking" ? "nav-button active" : "nav-button"
              }
              onClick={() => setActivePage("ranking")}
            >
              RÀNQUING
            </button>

            <button
              type="button"
              className={
                activePage === "profile" ? "nav-button active" : "nav-button"
              }
              onClick={() => {
                setSelectedProfileUserId(CURRENT_RANKING_USER_ID);
                setProfileTab("overview");
                setActivePage("profile");
              }}
            >
              PERFIL
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
                onClick={() =>
                  setAccountMenuOpen((currentValue) => !currentValue)
                }
                aria-label={`Obre el compte de ${profileDisplayName}`}
                aria-expanded={accountMenuOpen}
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
              </div>
            )}

            {authUser && accountMenuOpen && (
              <div className="auth-menu">
                <div className="auth-menu-identity">
                  <AuthAvatar
                    imageUrl={profileAvatarUrl}
                    displayName={profileDisplayName}
                  />

                                  <span>
                    <strong>{profileDisplayName}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={authActionLoading}
                >
                  TANCA SESSIÓ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
        {activePage === "play" && (
          <section
            className={
              predictionConfirmed
                ? "play-page prediction-locked"
                : "play-page"
            }
          >
            <section className="prediction-card score-card">
              <div className="section-heading score-heading">
                <div>
                  <h2>Pronostica el resultat</h2>

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
                    scoreTouched ? "status-pill completed" : "status-pill"
                  }
                >
                  {scoreTouched ? "FET" : "PENDENT"}
                </span>
              </div>

              <div className="score-match-overview">
                <div className="score-match-date">
                  <span>PROPER PARTIT</span>

                  <strong>{matchData.kickoffLabel}</strong>
                </div>

                <div
                  className={
                    countdown.isClosed
                      ? "score-deadline closed"
                      : "score-deadline"
                  }
                >
                  <span className="score-deadline-title">
                    {countdown.isClosed ? "ESTAT" : "TANCA EN"}
                  </span>

                  {countdown.isClosed ? (
                    <strong className="score-deadline-closed">
                      PORRA TANCADA
                    </strong>
                  ) : (
                    <div className="score-countdown-grid">
                      <div className="score-countdown-unit">
                        <strong>
                          {String(countdown.days).padStart(2, "0")}
                        </strong>

                        <span>DIES</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(countdown.hours).padStart(2, "0")}
                        </strong>

                        <span>HORES</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(countdown.minutes).padStart(2, "0")}
                        </strong>

                        <span>MIN</span>
                      </div>

                      <div className="score-countdown-unit">
                        <strong>
                          {String(countdown.seconds).padStart(2, "0")}
                        </strong>

                        <span>SEG</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                  </div>

                  <small className="section-info-note">
                    Si claves el marcador exacte, obtens +50. Si no, pots sumar
                    els parcials. El número dels gols del Barça no es duplica si
                    ja està cobert pel bonus de +15.
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
                        ),
                      }}
                      aria-hidden="true"
                    ></span>

                    <span className="score-team-copy">
                      <strong>{matchData.homeName}</strong>

                      <small>{matchData.homeLocation}</small>
                    </span>
                  </div>
                </div>

                <div className="score-center-controls">
                  <div className="score-control">
                    <button
                      type="button"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (predictionConfirmed) {
                          return;
                        }

                        setScoreTouched(true);
                        setBarcaScore((score) => Math.max(0, score - 1));
                      }}
                      aria-label="Resta un gol al Barça"
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (!predictionConfirmed) {
                          setScoreTouched(true);
                        }
                      }}
                      aria-label={`Confirmar ${barcaScore} gols del Barça`}
                    >
                      {barcaScore}
                    </button>

                    <button
                      type="button"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (predictionConfirmed) {
                          return;
                        }

                        setScoreTouched(true);
                        setBarcaScore((score) => score + 1);
                      }}
                      aria-label="Suma un gol al Barça"
                    >
                      +
                    </button>
                  </div>

                  <span className="score-separator" aria-hidden="true">
                    :
                  </span>

                  <div className="score-control">
                    <button
                      type="button"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (predictionConfirmed) {
                          return;
                        }

                        setScoreTouched(true);
                        setRivalScore((score) => Math.max(0, score - 1));
                      }}
                      aria-label="Resta un gol a l'Al-Ahly"
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (!predictionConfirmed) {
                          setScoreTouched(true);
                        }
                      }}
                      aria-label={`Confirmar ${rivalScore} gols de l'Al-Ahly`}
                    >
                      {rivalScore}
                    </button>

                    <button
                      type="button"
                      disabled={predictionConfirmed}
                      onClick={() => {
                        if (predictionConfirmed) {
                          return;
                        }

                        setScoreTouched(true);
                        setRivalScore((score) => score + 1);
                      }}
                      aria-label="Suma un gol a l'Al-Ahly"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="score-team away">
                  <div className="score-team-label">
                    <span
                      className="team-color-dot"
                      style={{
                        background: getTeamBadgeBackground(
                          matchData.awayTeamId,
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
            </section>

            <section className="prediction-card lineup-card">
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

                    <span className="formation-label">4-3-3 FIX</span>
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
                    lineupIsComplete
                      ? "lineup-counter completed"
                      : "lineup-counter"
                  }
                >
                  {lineupIsComplete
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
                      <strong>+25</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>9/11 encerts</span>
                      <strong>+10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>8/11 encerts</span>
                      <strong>+5</strong>
                    </div>

                    <div className="section-info-points-row neutral">
                      <span>7/11 encerts</span>
                      <strong>0</strong>
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

              <p className="section-help">
                Selecciona una posició i una xapa en l’ordre que vulguis. Per
                desfer, selecciona el jugador del camp i després torna a clicar
                la seva mateixa xapa de la safata, o fes-ho a l’inrevés. També
                pots arrossegar-lo sobre la seva xapa.
              </p>

              <div className="football-field">
                <div className="field-line halfway-line"></div>

                <div className="field-circle"></div>

                <div className="penalty-area penalty-area-top"></div>

                <div className="penalty-area penalty-area-bottom"></div>

                <div className="field-slots formation-433">
                  {formation433.map((line) => (
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

                        const fieldSlotClassName = [
                          "field-slot",
                          player ? "occupied" : "",
                          isTargetSelected ? "target-selected" : "",
                          isPlayerSelected ? "player-selected" : "",
                          isProtagonist ? "protagonist" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <button
                            key={slotIndex}
                            type="button"
                            className={fieldSlotClassName}
                            disabled={predictionConfirmed}
                            draggable={!predictionConfirmed && Boolean(player)}
                            onDragStart={(event) => {
                              if (player) {
                                handleDragStart(event, player.id);
                              }
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDrop(event, slotIndex)}
                            onClick={() => handleSlotClick(slotIndex)}
                            aria-pressed={isTargetSelected || isPlayerSelected}
                            aria-label={
                              player
                                ? `Posició de ${player.name}`
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
                  <strong>23 XAPES DEL BARÇA</strong>

                  <span>{lineupPlayers.length} jugadors</span>
                </div>

                <div className="player-badges">
                  {lineupPlayers.map((player) => {
                    const isInLineup = lineup.includes(player.id);

                    const isPendingSelection = selectedPlayerId === player.id;

                    const playerBadgeClassName = [
                      "player-badge",
                      isInLineup ? "selected" : "",
                      isPendingSelection ? "pending-selection" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={player.id}
                        type="button"
                        className={playerBadgeClassName}
                        disabled={predictionConfirmed}
                        draggable={!predictionConfirmed}
                        onDragStart={(event) =>
                          handleDragStart(event, player.id)
                        }
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) =>
                          handlePlayerBadgeDrop(event, player.id)
                        }
                        onClick={() => handlePlayerClick(player.id)}
                        aria-pressed={isPendingSelection}
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
            </section>

            <section className="prediction-card protagonist-card">
              <div className="section-heading">
                <div>
                  <h2>Marca el protagonista</h2>

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
                    protagonistIsComplete
                      ? "status-pill completed"
                      : "status-pill"
                  }
                >
                  {protagonistIsComplete ? "FET" : "OPCIONAL"}
                </span>
              </div>

              {openInfoSection === "protagonist" && (
                <div className="section-info-panel" role="note">
                  <strong className="section-info-title">
                    PUNTS DEL PROTAGONISTA
                  </strong>

                  <div className="section-info-protagonist-grid">
                    <div className="section-info-points-row special">
                      <span>Lamine Yamal</span>

                      <strong>+5 / −5</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Fermín López · Raphinha · Ferran Torres · Anthony Gordon
                      </span>

                      <strong>+10 / −10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Dani Olmo · Karim Adeyemi · Pedri</span>

                      <strong>+20 / −10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>Frenkie de Jong · Jules Koundé · Marc Bernal</span>

                      <strong>+30 / −10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        João Cancelo · Ronald Araújo · Eric Garcia · Gavi
                      </span>

                      <strong>+40 / −5</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Alejandro Balde · Gerard Martín · Marc Casadó · Pau
                        Cubarsí · Andreas Christensen · Jofre Torrents
                      </span>

                      <strong>+50 / −5</strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    El primer número són els punts si marca o assisteix. El
                    segon és la penalització si no participa en cap gol. Gol i
                    assistència no acumulen.
                  </small>
                </div>
              )}

              <p className="section-help">
                Tria qualsevol jugador de camp. Encertes si marca o dona una
                assistència. Cada jugador té un premi i un risc segons el seu
                grup.
              </p>

              <div className="protagonist-combined-rule">
                <div className="protagonist-combined-icons">
                  <span className="protagonist-combined-icon goal">⚽</span>

                  <span className="protagonist-combined-or">O</span>

                  <span className="protagonist-combined-icon assist">A</span>
                </div>

                <div className="protagonist-combined-copy">
                  <span>UNA ÚNICA APOSTA</span>

                  <strong>MARCA O ASSISTEIX</strong>

                  <small>
                    Gol o assistència donen el mateix encert. Si fa totes dues
                    coses, només puntua una vegada.
                  </small>
                </div>

                <span className="protagonist-binary-pill">RESULTAT BINARI</span>
              </div>

              <div className="protagonist-picker">
                <div className="protagonist-picker-copy">
                  <span>PROTAGONISTA</span>

                  <strong>Tria un dels 21 jugadors de camp</strong>

                  <small>Cada opció mostra premi i penalització</small>
                </div>

                <select
                  value={protagonistId ?? ""}
                  disabled={predictionConfirmed}
                  onChange={(event) =>
                    setProtagonistId(event.target.value || null)
                  }
                  aria-label="Selecciona el protagonista"
                >
                  <option value="">
                    Selecciona un dels 21 jugadors de camp
                  </option>

                  {eligibleProtagonistPlayers.map((player) => {
                    const scoring = getPlayerProtagonistScoring(player);

                    return (
                      <option key={player.id} value={player.id}>
                        {`${player.name} · +${scoring.hitPoints} si encertes · ${scoring.missPoints} si falles`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div
                className={
                  protagonistIsComplete
                    ? "protagonist-showcase selected"
                    : "protagonist-showcase"
                }
              >
                {protagonistIsComplete ? (
                  <>
                    <div className="protagonist-image-wrap">
                      <img
                        src={protagonist.image}
                        className="protagonist-showcase-image"
                        alt=""
                      />

                      <span
                        className="protagonist-showcase-star"
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    </div>

                    <div className="protagonist-showcase-copy">
                      <span className="protagonist-kicker">
                        PROTAGONISTA ESCOLLIT
                      </span>

                      <strong>{protagonist.name}</strong>

                      <div className="protagonist-score-grid">
                        <div className="protagonist-score-box hit">
                          <span>SI MARCA O ASSISTEIX</span>

                          <strong>+{protagonistScoring.hitPoints}</strong>
                        </div>

                        <div className="protagonist-score-box miss">
                          <span>SI NO PARTICIPA EN GOL</span>

                          <strong>{protagonistScoring.missPoints}</strong>
                        </div>
                      </div>

                      <small className="protagonist-single-score-note">
                        L’aposta no es multiplica: encara que faci més d’un gol,
                        més d’una assistència o totes dues coses, només genera
                        un encert.
                      </small>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="protagonist-empty-icon">★</div>

                    <div className="protagonist-showcase-copy">
                      <span className="protagonist-kicker">
                        FALTA UN ÚLTIM PAS
                      </span>

                      <strong>Tria el teu protagonista</strong>

                      <small>
                        Aposta qui marcarà o assistirà. Veuràs els punts que et pot donar o treure cada jugador.
                      </small>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section
              className={[
                "confirm-section",
                confirmationDialogOpen ? "confirming" : "",
                predictionConfirmed ? "confirmed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="prediction-summary">
                <span>
                  {scoreTouched
                    ? `RESULTAT ${barcaScore}-${rivalScore}`
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
                  countdown.isClosed ||
                  authLoading ||
                  authActionLoading ||
                  predictionConfirmed
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
                  Valora els jugadors de l’últim partit i consulta la nota
                  acumulada de tota la temporada.
                </p>
              </div>

              <OfficialMatchCard
                homeScore={officialHomeScore}
                awayScore={officialAwayScore}
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
                  <strong>Una valoració per jugador i partit</strong>
                </div>

                <p>
                  Només es poden valorar els jugadors marcats oficialment com
                  a titulars o suplents que han jugat. Pots canviar la teva
                  valoració mentre el partit continuï obert per votar.
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

                <p>
                  La nota del partit és la mitjana de totes les valoracions. La
                  nota de temporada acumula totes les jornades i ordena els
                  jugadors de millor a pitjor mitjana.
                </p>
              </section>
            )}

            <section className="notes-board">
              <header className="notes-board-heading">
                <div>
                  <span>
                    {notesTab === "match"
                      ? "VALORA L’ÚLTIM PARTIT"
                      : "CLASSIFICACIÓ DE LA TEMPORADA"}
                  </span>

                  <strong>
                    {notesTab === "match"
                      ? `${visibleNotesRows.length} jugadors puntuables`
                      : `${visibleNotesRows.length} jugadors ordenats per nota`}
                  </strong>
                </div>

                <small>MITJANA SOBRE 10</small>
              </header>

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

                      <div className="notes-player-copy">
                        <strong>{row.player.name}</strong>

                        <PlayerNotesStats
                          stats={row.stats}
                          mode={notesTab}
                        />
                      </div>
                    </div>

                    <div className="notes-rating-area">
                      <RatingStars
                        value={row.displayStars}
                        readOnly={notesTab === "season"}
                        onRate={(stars) =>
                          handleRatePlayer(row.player.id, stars)
                        }
                      />

                      <div className="notes-average">
                        <strong>{formatRatingAverage(row.average)}</strong>
                        <span>MITJANA</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}

        {activePage === "scoring" && isAdmin && (
          <section className="admin-scoring-page">
            <header className="admin-scoring-hero">
              <div>
                <span className="admin-scoring-kicker">ÀREA PRIVADA</span>
                <h1>PUNTUACIONS</h1>
                <p>
                  Gestiona el partit oficial i la plantilla pública des d’un
                  únic espai segur. El backend valida tots els canvis.
                </p>
              </div>

              {adminScoringTab === "match" ? (
                <OfficialMatchCard
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
              ) : (
                <div className="admin-player-hero-summary">
                  <span>CATÀLEG DINÀMIC</span>
                  <strong>{adminPlayerCatalog.length} jugadors</strong>
                  <small>
                    Match ID · {VESALAPORRA_CURRENT_MATCH_ID.slice(0, 8)}…
                  </small>
                </div>
              )}
            </header>

            <div className="admin-area-tabs" role="tablist">
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
            </div>

            {adminScoringTab === "match" ? (
              <>
                <section className="admin-tools-card">
                  <header>
                    <div>
                      <span>EINES OFICIALS</span>
                      <strong>Arrossega una icona sobre cada jugador</strong>
                    </div>

                    <small>
                      També pots seleccionar una eina i aplicar-la des de la
                      targeta del jugador.
                    </small>
                  </header>

                  <div className="admin-tool-tray">
                    {ADMIN_SCORING_TOOLS.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        draggable
                        className={
                          selectedAdminTool === tool.id
                            ? `admin-tool ${tool.id} selected`
                            : `admin-tool ${tool.id}`
                        }
                        onDragStart={(event) =>
                          handleAdminToolDragStart(event, tool.id)
                        }
                        onClick={() =>
                          setSelectedAdminTool((currentTool) =>
                            currentTool === tool.id ? null : tool.id,
                          )
                        }
                        aria-pressed={selectedAdminTool === tool.id}
                      >
                        {tool.id === "goal" || tool.id === "assist" ? (
                          <ProtagonistEventIcon type={tool.id} />
                        ) : (
                          <ParticipationRoleIcon type={tool.id} />
                        )}
                        <strong>{tool.label}</strong>
                      </button>
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

                    <small>T i S són excloents</small>
                  </header>

                  <div className="admin-player-grid">
                    {gamePlayers.map((player) => {
                      const stats = officialMatchStatsByPlayerId[player.id] || {
                        role: null,
                        goals: 0,
                        assists: 0,
                      };

                      const selectedToolLabel = ADMIN_SCORING_TOOLS.find(
                        (tool) => tool.id === selectedAdminTool,
                      )?.label;

                      return (
                        <article key={player.id} className="admin-player-card">
                          <div className="admin-player-identity">
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

                          <button
                            type="button"
                            className={
                              selectedAdminTool
                                ? "admin-player-drop-target armed"
                                : "admin-player-drop-target"
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) =>
                              handleAdminPlayerDrop(event, player.id)
                            }
                            onClick={() => {
                              if (selectedAdminTool) {
                                applyAdminToolToPlayer(
                                  player.id,
                                  selectedAdminTool,
                                );
                              }
                            }}
                          >
                            <span aria-hidden="true">＋</span>
                            <small>
                              {selectedToolLabel
                                ? `APLICA ${selectedToolLabel.toUpperCase()}`
                                : "ARROSSEGA AQUÍ"}
                            </small>
                          </button>

                          <div className="admin-player-current-stats">
                            <div className="admin-role-controls">
                              <ParticipationRoleIcon
                                type="starter"
                                className={
                                  stats.role === "T"
                                    ? "admin-current-role active"
                                    : "admin-current-role"
                                }
                              />

                              <ParticipationRoleIcon
                                type="substitute"
                                className={
                                  stats.role === "S"
                                    ? "admin-current-role active"
                                    : "admin-current-role"
                                }
                              />

                              {stats.role && (
                                <button
                                  type="button"
                                  className="admin-clear-role"
                                  onClick={() =>
                                    clearAdminPlayerRole(player.id)
                                  }
                                  aria-label={`Elimina la participació de ${player.name}`}
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            <div className="admin-count-control">
                              <ProtagonistEventIcon
                                type="goal"
                                count={stats.goals}
                                className="admin-event-stat"
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
            ) : (
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
                    <small>
                      Primer crea’l. Després puja la xapa i decideix si apareix
                      al partit.
                    </small>
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
                          setAdminPlayerForm((currentForm) => ({
                            ...currentForm,
                            displayName: event.target.value,
                          }))
                        }
                        placeholder="Hèctor Fort"
                        maxLength={80}
                        required
                      />
                    </label>

                    <label>
                      <span>NOM CURT</span>
                      <input
                        type="text"
                        value={adminPlayerForm.shortName}
                        onChange={(event) =>
                          setAdminPlayerForm((currentForm) => ({
                            ...currentForm,
                            shortName: event.target.value,
                          }))
                        }
                        placeholder="Hèctor"
                        maxLength={40}
                      />
                    </label>

                    <label>
                      <span>DORSAL</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={adminPlayerForm.shirtNumber}
                        onChange={(event) =>
                          setAdminPlayerForm((currentForm) => ({
                            ...currentForm,
                            shirtNumber: event.target.value,
                          }))
                        }
                        placeholder="32"
                      />
                    </label>

                    <label>
                      <span>CLAU OPCIONAL</span>
                      <input
                        type="text"
                        value={adminPlayerForm.playerKey}
                        onChange={(event) =>
                          setAdminPlayerForm((currentForm) => ({
                            ...currentForm,
                            playerKey: event.target.value,
                          }))
                        }
                        placeholder="hector-fort"
                        maxLength={80}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={adminPlayerCreating}
                    >
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
                                      isPublicVisible: false,
                                      eligibleForLineup: true,
                                      eligibleForProtagonist: true,
                                      eligibleForRatings: true,
                                    })
                                  }
                                >
                                  AFEGEIX AL PARTIT
                                </button>
                              )}
                            </div>

                            {player.assignedToMatch && (
                              <div className="admin-catalog-toggles">
                                <label>
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
                                  <span>VISIBLE A LA PORRA</span>
                                </label>

                                <label>
                                  <input
                                    type="checkbox"
                                    checked={player.eligibleForLineup}
                                    disabled={isBusy}
                                    onChange={(event) =>
                                      saveAdminMatchPlayer(player, {
                                        eligibleForLineup:
                                          event.target.checked,
                                      })
                                    }
                                  />
                                  <span>XI TITULAR</span>
                                </label>

                                <label>
                                  <input
                                    type="checkbox"
                                    checked={player.eligibleForProtagonist}
                                    disabled={isBusy}
                                    onChange={(event) =>
                                      saveAdminMatchPlayer(player, {
                                        eligibleForProtagonist:
                                          event.target.checked,
                                      })
                                    }
                                  />
                                  <span>PROTAGONISTA</span>
                                </label>

                                <label>
                                  <input
                                    type="checkbox"
                                    checked={player.eligibleForRatings}
                                    disabled={isBusy}
                                    onChange={(event) =>
                                      saveAdminMatchPlayer(player, {
                                        eligibleForRatings:
                                          event.target.checked,
                                      })
                                    }
                                  />
                                  <span>LES NOTES</span>
                                </label>
                              </div>
                            )}

                            <button
                              type="button"
                              className="admin-archive-player"
                              disabled={isBusy}
                              onClick={() => toggleAdminPlayerArchive(player)}
                            >
                              {player.catalogStatus === "archived"
                                ? "REACTIVA JUGADOR"
                                : "ARXIVA JUGADOR"}
                            </button>
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

                  <h1>RÀNQUING</h1>

                  <p>
                    Identitat culer verificada, rivalitat i punts transparents
                    partit rere partit.
                  </p>
                </div>

                <span className="ranking-x-origin">
                  <strong>✓</strong>
                  IDENTITAT CULER
                </span>
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
                        achievements={
                          getProfileDataForUser(currentRankingUser).achievements
                        }
                        className="current-user-icons"
                      />
                    </strong>
                  </span>

                  <span className="ranking-current-stat">
                    <small>POSICIÓ</small>

                    <strong>#{currentRankingPosition}</strong>
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
                      : "ÚLTIMA JORNADA"}
                  </span>

                  <strong>{visibleRankingRows.length} culers carregats</strong>
                </div>

                <small>20 EN 20 · SENSE LÍMIT</small>
              </header>

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

                  const medal =
                    position === 1
                      ? "🥇"
                      : position === 2
                        ? "🥈"
                        : position === 3
                          ? "🥉"
                          : null;

                  const rankingRowClassName = [
                    "ranking-row",
                    user.isCurrentUser ? "current-user" : "",
                    position <= 3 ? "podium" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article
                      key={`${rankingTab}-${user.id}`}
                      className={rankingRowClassName}
                    >
                      <span className="ranking-position">
                        {medal ? (
                          <span className="ranking-medal">{medal}</span>
                        ) : (
                          position
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
                              achievements={
                                getProfileDataForUser(user).achievements
                              }
                            />

                            {user.isCurrentUser && (
                              <span className="ranking-you-badge">TU</span>
                            )}
                          </strong>

                          {!user.isCurrentUser &&
                            user.hasXIdentity &&
                            user.handle && (
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

                      <span className="ranking-breakdown xi" data-label="XI">
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
            </section>
          </section>
        )}

        {activePage === "profile" &&
          selectedProfileUser &&
          selectedProfileData && (
            <section className="profile-page">
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
                      {selectedProfileUser.isCurrentUser
                        ? "EL TEU PERFIL"
                        : "PERFIL PÚBLIC"}
                    </span>

                    <h1>{selectedProfileUser.displayName}</h1>

                                        {!isOwnAuthenticatedProfile &&
                    selectedProfileUser.hasXIdentity &&
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

                        <button
                          type="button"
                          className="profile-inline-action"
                          disabled={profileLoading || profileActionLoading}
                          onClick={() => profileAvatarInputRef.current?.click()}
                        >
                          <span aria-hidden="true">◉</span>
                          CANVIA AVATAR
                        </button>

                        <input
                          ref={profileAvatarInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="profile-avatar-input"
                          onChange={handleProfileAvatarChange}
                        />
                      </div>
                    ) : (
                      <div className="profile-identity-badges">
                        {selectedProfileUser.hasXIdentity && (
                          <span>IDENTITAT X</span>
                        )}

                        <span>
                          CULER DES DE {selectedProfileUser.joinedYear || 2026}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-hero-stats">
                  <div>
                    <span>POSICIÓ GENERAL</span>

                    <strong>#{selectedProfilePosition}</strong>
                  </div>

                  <div className="gold">
                    <span>PUNTS</span>

                    <strong>{selectedProfileUser.general.totalPoints}</strong>
                  </div>
                </div>

                {(selectedProfileUser.twitterUrl ||
                  !selectedProfileUser.isCurrentUser) && (
                  <div className="profile-hero-actions">
                    {selectedProfileUser.twitterUrl && (
                      <a
                        href={selectedProfileUser.twitterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-action-button x"
                      >
                        <span aria-hidden="true">𝕏</span>
                        VEURE A X
                      </a>
                    )}

                    {!selectedProfileUser.isCurrentUser && (
                      <button
                        type="button"
                        className="profile-action-button back"
                        onClick={() => setActivePage("ranking")}
                      >
                        ← RÀNQUING
                      </button>
                    )}
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

              <nav className="profile-tabs" aria-label="Seccions del perfil">
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
              </nav>

              {profileTab === "overview" && (
                <div className="profile-overview">
                  <section className="profile-main-stats">
                    <article>
                      <span>POSICIÓ</span>

                      <strong>#{selectedProfilePosition}</strong>

                      <small>classificació general</small>
                    </article>

                    <article className="featured">
                      <span>PUNTS TOTALS</span>

                      <strong>{selectedProfileUser.general.totalPoints}</strong>

                      <small>temporada actual</small>
                    </article>

                    <article>
                      <span>PORRES</span>

                      <strong>{selectedProfileData.played}</strong>

                      <small>partits jugats</small>
                    </article>

                    <article>
                      <span>EXACTES</span>

                      <strong>{selectedProfileData.exactScores}</strong>

                      <small>marcadors clavats</small>
                    </article>
                  </section>

                  <section className="profile-breakdown-card">
                    <header>
                      <div>
                        <span>PUNTS PER CATEGORIA</span>

                        <strong>D’on surt la puntuació</strong>
                      </div>

                      <small>
                        TOTAL {selectedProfileUser.general.totalPoints}
                      </small>
                    </header>

                    {[
                      {
                        key: "result",
                        label: "RESULTAT",
                        value: selectedProfileUser.general.resultPoints,
                        className: "result",
                      },
                      {
                        key: "xi",
                        label: "LOTTO FLICK",
                        value: selectedProfileUser.general.xiPoints,
                        className: "xi",
                      },
                      {
                        key: "protagonist",
                        label: "PROTAGONISTA",
                        value: selectedProfileUser.general.protagonistPoints,
                        className: "protagonist",
                      },
                    ].map((item) => {
                      const totalPoints = Math.max(
                        1,
                        selectedProfileUser.general.totalPoints,
                      );

                      const percentage = Math.max(
                        0,
                        Math.min(
                          100,
                          Math.round((item.value / totalPoints) * 100),
                        ),
                      );

                      return (
                        <div key={item.key} className="profile-breakdown-row">
                          <span>{item.label}</span>

                          <div className="profile-breakdown-track">
                            <span
                              className={`profile-breakdown-fill ${item.className}`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></span>
                          </div>

                          <strong>{item.value}</strong>
                        </div>
                      );
                    })}
                  </section>

                  <section className="profile-performance-grid">
                    <article>
                      <span className="profile-performance-icon">🎯</span>

                      <div>
                        <small>RESULTATS EXACTES</small>

                        <strong>{selectedProfileData.exactScores}</strong>

                        <span>de {selectedProfileData.played} porres</span>
                      </div>
                    </article>

                    <article>
                      <span className="profile-performance-icon">🧠</span>

                      <div>
                        <small>MITJANA LOTTO</small>

                        <strong>
                          {selectedProfileData.averageXi.toFixed(1)}
                          /11
                        </strong>

                        <span>lectura de titulars</span>
                      </div>
                    </article>

                    <article>
                      <span className="profile-performance-icon">⭐</span>

                      <div>
                        <small>PROTAGONISTES</small>

                        <strong>
                          {selectedProfileData.protagonistHits}/
                          {selectedProfileData.history.length}
                        </strong>

                        <span>encerts recents</span>
                      </div>
                    </article>

                                      <article>
                      <span className="profile-performance-icon">🥇</span>

                      <div>
                        <small>JORNADES GUANYADES</small>

                        <strong>{selectedProfileData.jornadaWins}</strong>

                        <span>primers llocs de jornada</span>
                      </div>
                    </article>
                  </section>

                  <section className="profile-records-section">
                    <header>
                      <div>
                        <span>MILLORS ACTUACIONS</span>

                        <strong>Els tres records del perfil</strong>
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
                          {selectedProfileData.bestMatch.label} · Barça vs{" "}
                          {selectedProfileData.bestMatch.opponent}
                        </p>
                      </article>

                      <article className="profile-record-card silver">
                        <span className="profile-record-ordinal">02</span>

                        <span className="profile-record-icon">🧠</span>

                        <strong>
                          {selectedProfileData.bestXi}
                          /11
                        </strong>

                        <small>Millor Lotto Flick</small>

                        <p>Titulars encertats en una sola jornada.</p>
                      </article>

                      <article className="profile-record-card bronze">
                        <span className="profile-record-ordinal">03</span>

                        <span className="profile-record-icon">⭐</span>

                        <strong>
                          +{selectedProfileData.bestProtagonistPoints}
                        </strong>

                        <small>Millor protagonista</small>

                        <p>
                          Premi màxim aconseguit amb una marca o assistència.
                        </p>
                      </article>
                    </div>
                  </section>
                </div>
              )}

              {profileTab === "history" && (
                <section className="profile-history-card">
                  <header>
                    <div>
                      <span>HISTORIAL DE PORRES</span>

                      <strong>Últims partits puntuats</strong>
                    </div>

                    <small>{selectedProfileData.history.length} JORNADES</small>
                  </header>

                  <div className="profile-history-list">
                    {selectedProfileData.history.map((match) => (
                      <article key={match.id} className="profile-history-row">
                        <div className="profile-history-match">
                          <span className="profile-opponent-badge">
                            {match.opponentShort}
                          </span>

                          <div>
                            <small>
                              {match.label} · {match.dateLabel}
                            </small>

                            <strong>Barça vs {match.opponent}</strong>
                          </div>
                        </div>

                        <div className="profile-history-score">
                          <span>PRONÒSTIC</span>

                          <strong>
                            {match.predictedHome}-{match.predictedAway}
                          </strong>

                          <small>
                            REAL {match.actualHome}-{match.actualAway}
                          </small>
                        </div>

                        <div className="profile-history-details">
                          <span className="result">
                            RESULTAT {match.resultPoints >= 0 ? "+" : ""}
                            {match.resultPoints}
                          </span>

                          <span className="xi">
                            XI {match.xiHits}/11 ·{" "}
                            {match.xiPoints >= 0 ? "+" : ""}
                            {match.xiPoints}
                          </span>

                          <span
                            className={
                              match.protagonistHit
                                ? "protagonist hit"
                                : "protagonist miss"
                            }
                          >
                            {match.protagonist} ·{" "}
                            {match.protagonistPoints >= 0 ? "+" : ""}
                            {match.protagonistPoints}
                          </span>
                        </div>

                        <strong
                          className={
                            match.totalPoints >= 0
                              ? "profile-history-total positive"
                              : "profile-history-total negative"
                          }
                        >
                          {match.totalPoints >= 0 ? "+" : ""}
                          {match.totalPoints}
                          <small>PTS</small>
                        </strong>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {profileTab === "achievements" && (
                <section className="profile-achievements-section">
                  <header className="profile-achievements-hero">
                    <div className="profile-achievements-trophy">🏅</div>

                    <div>
                      <span>VITRINA DEL CULER</span>

                      <strong>
                        {selectedProfileData.unlockedAchievements}/
                        {selectedProfileData.achievements.length} medalles
                      </strong>

                      <p>
                        Cada medalla desbloquejada queda il·luminada i acompanya
                        el nom del culer als rànquings general i de jornada.
                      </p>
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
                          {achievement.icon}
                        </span>

                        <div>
                          <span>
                            {achievement.unlocked ? "DESBLOQUEJADA" : "PENDENT"}
                          </span>

                          <strong>{achievement.title}</strong>

                          <p>{achievement.description}</p>
                        </div>

                        <small>{achievement.progress}</small>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </section>
          )}
      </main>

      {confirmationDialogOpen && !predictionConfirmed && (
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
              Quan confirmis el pronòstic ja no el podràs modificar fins que
              s’obri una jornada nova.
            </p>

            <div className="prediction-confirm-dialog-summary">
              <span>RESULTAT {barcaScore}-{rivalScore}</span>
              <span>XI {lineupCount}/11</span>
              <span>
                {protagonistIsComplete
                  ? `PROTAGONISTA ${protagonist.shortName.toUpperCase()}`
                  : "SENSE PROTAGONISTA"}
              </span>
            </div>

            <div className="prediction-confirm-dialog-actions">
              <button
                type="button"
                className="prediction-confirm-yes"
                onClick={handleFinalizePrediction}
              >
                SÍ, CONFIRMA’L
              </button>

              <button
                type="button"
                className="prediction-confirm-no"
                onClick={handleCancelPredictionConfirmation}
              >
                NO, TORNA ENRERE
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmationAnimationActive && confirmedPrediction && (
        <div className="prediction-celebration-overlay" aria-hidden="true">
          <section className="prediction-celebration-card">
            <span className="prediction-celebration-kicker">
              PRONÒSTIC ENREGISTRAT
            </span>

            <strong>VISCA EL BARÇA!</strong>

            <div className="prediction-celebration-summary">
              <span>
                RESULTAT {confirmedPrediction.barcaScore}-
                {confirmedPrediction.rivalScore}
              </span>

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
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
