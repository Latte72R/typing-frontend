import { useEffect, useMemo, useState } from 'react';
import { usePromptsQuery } from '@/features/admin/api/adminQueries.ts';
import {
  useContestPromptsQuery,
  useUpdateContestPromptsMutation,
} from '@/features/contest/api/contestQueries.ts';
import type { ContestPromptAssignment, Prompt } from '@/types/api.ts';
import styles from '@/app/routes/ContestLobby.module.css';

type ContestPromptManagerProps = {
  contestId: string;
};

type LocalAssignment = ContestPromptAssignment;

const normalizeLanguage = (language: Prompt['language']): ContestPromptAssignment['language'] => {
  if (language === 'english' || language === 'kana' || language === 'romaji') {
    return language;
  }
  return 'romaji';
};

export const ContestPromptManager = ({ contestId }: ContestPromptManagerProps) => {
  const { data: assignedPrompts, isLoading, isError } = useContestPromptsQuery(contestId, Boolean(contestId));
  const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = usePromptsQuery();
  const updatePrompts = useUpdateContestPromptsMutation(contestId);

  const [entries, setEntries] = useState<LocalAssignment[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (assignedPrompts && !updatePrompts.isPending) {
      const sorted = [...assignedPrompts].sort((a, b) => a.orderIndex - b.orderIndex);
      setEntries(sorted);
    }
  }, [assignedPrompts, updatePrompts.isPending]);

  const availablePrompts = useMemo(() => {
    const assignedIds = new Set(entries.map((entry) => entry.promptId));
    return (catalog ?? []).filter((prompt) => !assignedIds.has(prompt.id) && prompt.isActive !== false);
  }, [catalog, entries]);

  const handleAddPrompt = () => {
    if (!selectedPromptId) return;
    const target = catalog?.find((prompt) => prompt.id === selectedPromptId);
    if (!target) return;
    setEntries((prev) => [
      ...prev,
      {
        promptId: target.id,
        displayText: target.displayText,
        typingTarget: target.typingTarget,
        language: normalizeLanguage(target.language),
        orderIndex: prev.length,
      },
    ]);
    setSelectedPromptId('');
    setFeedback(null);
  };

  const handleRemove = (promptId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.promptId !== promptId));
    setFeedback(null);
  };

  const handleMove = (promptId: string, delta: number) => {
    setEntries((prev) => {
      const index = prev.findIndex((entry) => entry.promptId === promptId);
      if (index === -1) return prev;
      const newIndex = index + delta;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(newIndex, 0, item);
      return updated;
    });
    setFeedback(null);
  };

  const handleSave = () => {
    updatePrompts.mutate(
      {
        prompts: entries.map((entry, index) => ({ promptId: entry.promptId, orderIndex: index })),
      },
      {
        onSuccess: () => {
          setFeedback('プロンプト構成を保存しました。');
        },
        onError: (error) => {
          setFeedback(error.message ?? 'プロンプト構成の保存に失敗しました。');
        },
      },
    );
  };

  const isBusy = isLoading || isCatalogLoading || updatePrompts.isPending;
  const showLoading = (isLoading || isCatalogLoading) && !assignedPrompts;

  return (
    <section className={styles.promptManager} aria-label="プロンプト管理">
      <header className={styles.promptManagerHeader}>
        <div>
          <h2>プロンプト管理</h2>
          <p>コンテストで使用するプロンプトの追加・順序を設定します。</p>
        </div>
        <div className={styles.promptManagerActions}>
          <select
            value={selectedPromptId}
            onChange={(event) => setSelectedPromptId(event.target.value)}
            disabled={isBusy || availablePrompts.length === 0}
            aria-label="追加するプロンプトを選択"
          >
            <option value="" disabled>
              {availablePrompts.length === 0 ? '追加可能なプロンプトはありません' : 'プロンプトを選択'}
            </option>
            {availablePrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.displayText}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleAddPrompt} disabled={isBusy || !selectedPromptId}>
            追加
          </button>
        </div>
      </header>

      {isError || isCatalogError ? (
        <p className={styles.promptManagerError} role="alert">
          プロンプト情報の取得に失敗しました。
        </p>
      ) : null}
      {showLoading ? (
        <p className={styles.promptManagerLoading}>読み込み中...</p>
      ) : null}

      <ul className={styles.promptList}>
        {entries.length === 0 && !showLoading ? (
          <li className={styles.promptListEmpty}>まだプロンプトが設定されていません。</li>
        ) : null}
        {entries.map((entry, index) => (
          <li key={entry.promptId} className={styles.promptListItem}>
            <div className={styles.promptListContent}>
              <span className={styles.promptOrder}>{index + 1}</span>
              <div>
                <p className={styles.promptTitle}>{entry.displayText}</p>
                <p className={styles.promptMeta}>言語: {entry.language} / キー列: {entry.typingTarget}</p>
              </div>
            </div>
            <div className={styles.promptListControls}>
              <button
                type="button"
                onClick={() => handleMove(entry.promptId, -1)}
                disabled={index === 0 || isBusy}
                aria-label={`${entry.displayText} を上に移動`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMove(entry.promptId, 1)}
                disabled={index === entries.length - 1 || isBusy}
                aria-label={`${entry.displayText} を下に移動`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => handleRemove(entry.promptId)}
                disabled={isBusy}
                aria-label={`${entry.displayText} を削除`}
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.promptManagerFooter}>
        <button type="button" onClick={handleSave} disabled={isBusy}>
          {updatePrompts.isPending ? '保存中...' : 'この構成で保存'}
        </button>
        {feedback ? (
          <output className={styles.promptManagerFeedback} aria-live="polite" aria-atomic="true">
            {feedback}
          </output>
        ) : null}
      </div>
    </section>
  );
};
