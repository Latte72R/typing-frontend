export type ContestVisibility = 'public' | 'private';
export type LeaderboardVisibility = 'during' | 'after' | 'hidden';
export type ContestLanguage = 'romaji' | 'english' | 'kana';

export type Contest = {
  id: string;
  title: string;
  description?: string;
  visibility: ContestVisibility;
  joinCode?: string;
  startsAt: string;
  endsAt: string;
  timezone: 'Asia/Tokyo';
  timeLimitSec: number;
  maxAttempts: number;
  allowBackspace: boolean;
  leaderboardVisibility: LeaderboardVisibility;
  language: ContestLanguage;
};

export type Prompt = {
  id: string;
  displayText: string;
  typingTarget: string;
};

export type StartSessionRes = {
  sessionId: string;
  contestId: string;
  prompt: Prompt;
  startedAt: string;
};

export type KeyLogEntry = {
  t: number;
  k: string;
  ok: boolean;
};

export type FinishSessionReq = {
  cpm: number;
  wpm: number;
  accuracy: number;
  errors: number;
  keylog: KeyLogEntry[];
  clientFlags?: {
    defocus: number;
    pasteBlocked: boolean;
    anomalyScore?: number;
  };
};

export type SessionResult = FinishSessionReq & {
  sessionId: string;
  contestId: string;
  completedAt: string;
  score: number;
};

export type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  cpm: number;
  accuracy: number;
};

export type LeaderboardPayload = {
  top: LeaderboardEntry[];
  me?: LeaderboardEntry | null;
};

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = SignInPayload & {
  username: string;
};

export type PasswordResetPayload = {
  email: string;
};
