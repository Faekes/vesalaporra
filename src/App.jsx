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
    groupLabel: "GRUP E",
    groupKey: "e",
    goalContributions: 1,
    hitPoints: 40,
    missPoints: -5,
    order: 15,
  },
  "alejandro-balde": {
    groupLabel: "GRUP D",
    groupKey: "d",
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

const matchData = {
  homeName: "Barça",
  homeLocation: "Barcelona",
  awayName: "Al-Ahly",
  awayCountry: "Egipte",
  kickoffLabel: "DIMECRES · 19 AGOST 2026 · 21:00",
  kickoffAt: "2026-08-19T21:00:00+02:00",
};

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
    protagonistMissPoints: -15,
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
    protagonistHitPoints: 50,
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

const buildProfileDemoData = (user, generalPosition) => {
  const seed = getProfileSeed(user);

  const history = profileDemoMatches.map((match, index) => {
    const homeVariation = ((seed + index * 5) % 3) - 1;

    const awayVariation = ((seed + index * 7) % 3) - 1;

    const predictedHome = Math.max(0, match.actualHome + homeVariation);

    const predictedAway = Math.max(0, match.actualAway + awayVariation);

    const xiHits = Math.max(
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

  const exactScores =
    history.filter((match) => match.isExact).length + (seed % 3);

  const protagonistHits = history.filter(
    (match) => match.protagonistHit,
  ).length;

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

  const identityAchievement = user?.hasXIdentity
    ? {
        id: "x-identity",
        icon: "𝕏",
        title: "Culer d’X",
        description: "Identitat competitiva connectada a X.",
        unlocked: true,
        progress: "DESBLOQUEJAT",
      }
    : {
        id: "verified-identity",
        icon: "✓",
        title: "Perfil verificat",
        description: "Compte connectat i identificat a Vesalaporra.",
        unlocked: true,
        progress: "DESBLOQUEJAT",
      };

  const achievements = [
    identityAchievement,
    {
      id: "exact-score",
      icon: "🎯",
      title: "Marcador clavat",
      description: "Encerta un resultat exacte.",
      unlocked: exactScores >= 1,
      progress: `${Math.min(exactScores, 1)}/1`,
    },
    {
      id: "flick-reader",
      icon: "🧠",
      title: "Llegeix Flick",
      description: "Encerta 10 titulars en una jornada.",
      unlocked: bestXi >= 10,
      progress: `${bestXi}/10`,
    },
    {
      id: "perfect-xi",
      icon: "👑",
      title: "Onze perfecte",
      description: "Clava els 11 titulars del Barça.",
      unlocked: bestXi === 11,
      progress: `${bestXi}/11`,
    },
    {
      id: "protagonist",
      icon: "⭐",
      title: "Protagonista",
      description: "Encerta tres marques o assistències.",
      unlocked: protagonistHits >= 3,
      progress: `${Math.min(protagonistHits, 3)}/3`,
    },
    {
      id: "risk-master",
      icon: "💎",
      title: "Risc premiat",
      description: "Guanya +50 amb un protagonista improbable.",
      unlocked: bestProtagonistPoints >= 50,
      progress:
        bestProtagonistPoints >= 50
          ? "DESBLOQUEJAT"
          : `${bestProtagonistPoints}/50`,
    },
    {
      id: "streak",
      icon: "🔥",
      title: "Ratxa culer",
      description: "Suma quatre jornades positives seguides.",
      unlocked: longestStreak >= 4,
      progress: `${Math.min(longestStreak, 4)}/4`,
    },
    {
      id: "top-ten",
      icon: "🏆",
      title: "Top 10",
      description: "Entra entre els deu millors del rànquing.",
      unlocked: generalPosition > 0 && generalPosition <= 10,
      progress: generalPosition > 0 ? `#${generalPosition}` : "—",
    },
  ];

  return {
    history,
    played,
    exactScores,
    protagonistHits,
    averageXi,
    bestMatch,
    bestXi,
    bestProtagonistPoints,
    longestStreak,
    achievements,
    unlockedAchievements: achievements.filter(
      (achievement) => achievement.unlocked,
    ).length,
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

  const authUser = authSession?.user ?? null;

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

  const eligibleProtagonistPlayers = players
    .filter(
      (player) =>
        !player.isGoalkeeper && protagonistScoringByPlayerId[player.id],
    )
    .sort(
      (firstPlayer, secondPlayer) =>
        protagonistScoringByPlayerId[firstPlayer.id].order -
        protagonistScoringByPlayerId[secondPlayer.id].order,
    );

  const protagonist = protagonistId ? playersById[protagonistId] : null;

  const protagonistScoring = protagonistId
    ? protagonistScoringByPlayerId[protagonistId]
    : null;

  const protagonistIsComplete = Boolean(protagonist && protagonistScoring);

  const predictionConfirmLabel = countdown.isClosed
    ? "PORRA TANCADA"
    : !scoreTouched
      ? "PRONOSTICA EL RESULTAT"
      : lineupIsComplete && protagonistIsComplete
        ? "CONFIRMAR PORRA COMPLETA"
        : lineupIsComplete
          ? "CONFIRMAR RESULTAT + XI"
          : protagonistIsComplete
            ? "CONFIRMAR RESULTAT + PROTAGONISTA"
            : "CONFIRMAR RESULTAT";

  const confirmButtonLabel =
    !countdown.isClosed && scoreTouched && !authLoading && !authUser
      ? "ENTRA PER CONFIRMAR"
      : predictionConfirmLabel;

  const rankingUsers = rankingDemoUsers.map((user) => {
    if (!user.isCurrentUser || !authUser) {
      return user;
    }

    return {
      ...user,
      authUserId: authUser.id,
      twitterId: authUser.id,
      displayName: profileDisplayName,
      handle: authIsX && providerHandleSlug ? `@${providerHandleSlug}` : "",
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
    };
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

  const selectedProfileData = selectedProfileUser
    ? buildProfileDemoData(selectedProfileUser, selectedProfilePosition)
    : null;

  const isOwnAuthenticatedProfile = Boolean(
    authUser && selectedProfileUser?.isCurrentUser,
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
    if (!authUser) {
      handleXSignIn();
    }
  };

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

    const protagonistPlayer = playersById[protagonistId];

    const isStillEligible =
      protagonistPlayer &&
      !protagonistPlayer.isGoalkeeper &&
      Boolean(protagonistScoringByPlayerId[protagonistId]);

    if (!isStillEligible) {
      setProtagonistId(null);
    }
  }, [protagonistId]);

  const placePlayerInSlot = (playerId, targetSlotIndex) => {
    if (!playersById[playerId]) {
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
    if (!playersById[playerId]) {
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

    const draggedPlayerId = event.dataTransfer.getData("text/plain");

    if (
      draggedPlayerId === targetPlayerId &&
      lineup.includes(draggedPlayerId)
    ) {
      removePlayerFromLineup(draggedPlayerId);
    }
  };

  const handleDragStart = (event, playerId) => {
    event.dataTransfer.setData("text/plain", playerId);

    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, targetSlotIndex) => {
    event.preventDefault();

    const playerId = event.dataTransfer.getData("text/plain");

    if (!playersById[playerId]) {
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
              JUGA
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

                    <small>
                      {authIsX && providerHandleSlug
                        ? `@${providerHandleSlug}`
                        : authProvider === "google"
                          ? "COMPTE GOOGLE"
                          : "COMPTE VESALAPORRA"}
                    </small>
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
          <section className="play-page">
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
                      className="team-color-dot team-color-dot-barca"
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
                      onClick={() => {
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
                      onClick={() => setScoreTouched(true)}
                      aria-label={`Confirmar ${barcaScore} gols del Barça`}
                    >
                      {barcaScore}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
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
                      onClick={() => {
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
                      onClick={() => setScoreTouched(true)}
                      aria-label={`Confirmar ${rivalScore} gols de l'Al-Ahly`}
                    >
                      {rivalScore}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
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
                      className="team-color-dot team-color-dot-al-ahly"
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

                        const player = playerId ? playersById[playerId] : null;

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
                            draggable={Boolean(player)}
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

                  <span>{players.length} jugadors</span>
                </div>

                <div className="player-badges">
                  {players.map((player) => {
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
                        draggable
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

                      <strong>+5 / −15</strong>
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
                        João Cancelo · Ronald Araújo · Eric Garcia · Alejandro
                        Balde
                      </span>

                      <strong>+40 / −5</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Gavi · Gerard Martín · Marc Casadó · Pau Cubarsí ·
                        Andreas Christensen · Jofre Torrents
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
                  onChange={(event) =>
                    setProtagonistId(event.target.value || null)
                  }
                  aria-label="Selecciona el protagonista"
                >
                  <option value="">
                    Selecciona un dels 21 jugadors de camp
                  </option>

                  {eligibleProtagonistPlayers.map((player) => {
                    const scoring = protagonistScoringByPlayerId[player.id];

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

            <section className="confirm-section">
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
                  authActionLoading
                }
                onClick={handleConfirmPrediction}
              >
                {confirmButtonLabel}
              </button>
            </section>
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

                    <strong>{currentRankingUser.displayName}</strong>

                    <span className="ranking-current-source">
                      {currentRankingUser.hasXIdentity ? (
                        <>
                          <span aria-hidden="true">𝕏</span>
                          {currentRankingUser.handle}
                        </>
                      ) : (
                        <>
                          <GoogleMark className="ranking-provider-mark google" />
                          COMPTE GOOGLE
                        </>
                      )}
                    </span>
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
                            {user.displayName}

                            {user.isCurrentUser && (
                              <span className="ranking-you-badge">TU</span>
                            )}
                          </strong>

                          <small>
                            {user.hasXIdentity ? (
                              <>
                                <span aria-hidden="true">𝕏</span>
                                {user.handle}
                              </>
                            ) : (
                              <>
                                <GoogleMark className="ranking-provider-mark google" />
                                COMPTE GOOGLE
                              </>
                            )}
                          </small>
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

                    {selectedProfileUser.hasXIdentity &&
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
                    ) : isOwnAuthenticatedProfile ? (
                      <span className="profile-account-source">
                        <GoogleMark className="profile-provider-mark google" />
                        COMPTE GOOGLE
                      </span>
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
                    profileTab === "history"
                      ? "profile-tab active"
                      : "profile-tab"
                  }
                  onClick={() => setProfileTab("history")}
                >
                  HISTORIAL
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
                      <span className="profile-performance-icon">🔥</span>

                      <div>
                        <small>MILLOR RATXA</small>

                        <strong>{selectedProfileData.longestStreak}</strong>

                        <span>jornades positives</span>
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
                        Assoliments públics que expliquen com competeix aquest
                        perfil.
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
    </div>
  );
}

export default App;
