import {
  Contest,
  LeaderboardEntry,
  LeaderboardPayload,
  Prompt,
  SessionResult,
  StartSessionRes,
} from '@/types/api.ts';
import {
  calculateAccuracy,
  calculateCpm,
  calculateScore,
  calculateWpm,
} from '@/lib/keyboard/typingUtils.ts';

const sampleContestId = 'sample-contest';

const withOffset = (offsetSeconds: number) =>
  new Date(Date.now() + offsetSeconds * 1000).toISOString();

const contests: Contest[] = [
  {
    id: sampleContestId,
    title: '秋の腕試し杯',
    description: '60秒でベストスコアに挑む公式ルール。',
    visibility: 'public',
    startsAt: withOffset(-3600),
    endsAt: withOffset(86400),
    timezone: 'Asia/Tokyo',
    timeLimitSec: 60,
    maxAttempts: 5,
    allowBackspace: false,
    leaderboardVisibility: 'during',
    language: 'romaji',
  },
  {
    id: 'training-room',
    title: '英語フレーズ練習会',
    description: '英単語のフローを鍛える練習モード。',
    visibility: 'public',
    startsAt: withOffset(-7200),
    endsAt: withOffset(604800),
    timezone: 'Asia/Tokyo',
    timeLimitSec: 45,
    maxAttempts: 0,
    allowBackspace: true,
    leaderboardVisibility: 'after',
    language: 'english',
  },
];

const promptsByContest: Record<string, Prompt[]> = {
  [sampleContestId]: [
    {
      id: 'prompt-1',
      displayText: '今日は良い天気ですね',
      typingTarget: 'kyouhayiitenkidesune',
    },
    {
      id: 'prompt-2',
      displayText: '集中してリズムよく打ちましょう',
      typingTarget: 'shuuchuushiterizumuyokuchimashou',
    },
  ],
  'training-room': [
    {
      id: 'prompt-en-1',
      displayText: 'The quick brown fox jumps over the lazy dog.',
      typingTarget: 'thequickbrownfoxjumpsoverthelazydog',
    },
  ],
};

const leaderboardStore: Record<string, LeaderboardEntry[]> = {
  [sampleContestId]: [
    { rank: 1, user: 'alice', score: 930, cpm: 360, accuracy: 0.99 },
    { rank: 2, user: 'bob', score: 880, cpm: 340, accuracy: 0.97 },
  ],
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const pickPrompt = (contestId: string): Prompt => {
  const prompts = promptsByContest[contestId] ?? promptsByContest[sampleContestId];
  const index = Math.floor(Math.random() * prompts.length);
  return prompts[index];
};

const generateId = () => Math.random().toString(36).slice(2, 10);

export const fetchContests = async (): Promise<Contest[]> => {
  await delay();
  return contests;
};

export const fetchContest = async (contestId: string): Promise<Contest | undefined> => {
  await delay();
  return contests.find((contest) => contest.id === contestId);
};

export const fetchLeaderboard = async (
  contestId: string,
): Promise<LeaderboardPayload> => {
  await delay();
  const entries = leaderboardStore[contestId] ?? [];
  return {
    top: entries
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 10),
    me: undefined,
  };
};

export const startContestSession = async (
  contestId: string,
): Promise<StartSessionRes> => {
  await delay();
  const contest = await fetchContest(contestId);
  const prompt = pickPrompt(contest?.id ?? sampleContestId);
  return {
    sessionId: generateId(),
    contestId: contest?.id ?? sampleContestId,
    prompt,
    startedAt: new Date().toISOString(),
  };
};

export const finishContestSession = async (
  session: SessionResult,
): Promise<SessionResult> => {
  await delay();
  const { contestId } = session;
  const entries = leaderboardStore[contestId] ?? [];
  const nextEntries = [...entries, session].map<LeaderboardEntry>((item, index) => ({
    rank: index + 1,
    user: index === entries.length ? 'you' : item.user,
    score: item.score,
    cpm: item.cpm,
    accuracy: item.accuracy,
  }));

  nextEntries.sort((a, b) => {
    if (a.score === b.score) {
      if (a.accuracy === b.accuracy) {
        return b.cpm - a.cpm;
      }
      return b.accuracy - a.accuracy;
    }
    return b.score - a.score;
  });

  leaderboardStore[contestId] = nextEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return session;
};

export const buildSessionResult = (
  session: StartSessionRes,
  keyCount: number,
  correctCount: number,
  errorCount: number,
  durationSec: number,
  keylogCount: number,
): SessionResult => {
  const accuracy = calculateAccuracy(correctCount, correctCount + errorCount);
  const cpm = calculateCpm(correctCount, durationSec);
  const wpm = calculateWpm(cpm);
  const score = calculateScore(cpm, accuracy);
  return {
    sessionId: session.sessionId,
    contestId: session.contestId,
    cpm,
    wpm,
    accuracy,
    errors: errorCount,
    keylog: new Array(keylogCount).fill(null).map((_, index) => ({
      t: index * 120,
      k: '.',
      ok: true,
    })),
    clientFlags: {
      defocus: 0,
      pasteBlocked: true,
      anomalyScore: Math.max(0, 1 - keyCount / Math.max(durationSec, 1) / 10),
    },
    completedAt: new Date().toISOString(),
    score,
  };
};
