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
  allowBackspace: boolean;
  leaderboardVisibility: LeaderboardVisibility;
  language: ContestLanguage;
};

export type Prompt = {
  id: string;
  displayText: string;
  typingTarget: string;
  language?: ContestLanguage;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
};

export type ContestPromptAssignment = {
  promptId: string;
  displayText: string;
  typingTarget: string;
  language: ContestLanguage;
  orderIndex: number;
};

export type StartSessionRes = {
  sessionId: string;
  contestId: string;
  prompt: Prompt;
  startedAt: string;
  attemptsUsed: number;
  orderIndex: number;
};

export type NextPromptRes = {
  prompt: Prompt;
  orderIndex: number;
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
  score: number;
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
};

export type LeaderboardEntry = {
  sessionId: string;
  userId: string;
  username?: string;
  rank: number;
  score: number;
  cpm: number;
  accuracy: number;
  endedAt: string;
};

export type LeaderboardPayload = {
  top: LeaderboardEntry[];
  total: number;
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
  refreshToken: string;
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

export type CreateContestPayload = {
  title: string;
  description?: string;
  visibility: ContestVisibility;
  joinCode?: string;
  startsAt: string;
  endsAt: string;
  timezone: 'Asia/Tokyo';
  timeLimitSec: number;
  allowBackspace: boolean;
  leaderboardVisibility: LeaderboardVisibility;
  language: ContestLanguage;
};

export type CreatePromptPayload = {
  displayText: string;
  typingTarget: string;
  language: ContestLanguage;
};
