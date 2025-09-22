import type { ButtonHTMLAttributes } from 'react';
import { useSignOutMutation } from '@/features/auth/api/authQueries.ts';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';
import { clearAccessToken, clearRefreshToken } from '@/lib/apiClient.ts';

type LogoutButtonProps = {
  label?: string;
  pendingLabel?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>;

export const LogoutButton = ({
  label = 'ログアウト',
  pendingLabel = 'ログアウト中...',
  className,
  disabled,
  ...rest
}: LogoutButtonProps) => {
  const { clearUser } = useAuth();
  const signOut = useSignOutMutation();

  const handleClick = () => {
    signOut.mutate(undefined, {
      onError: (error) => {
        console.error('ログアウトに失敗しました', error);
      },
      onSettled: () => {
        clearAccessToken();
        clearRefreshToken();
        clearUser();
      },
    });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled || signOut.isPending}
      {...rest}
    >
      {signOut.isPending ? pendingLabel : label}
    </button>
  );
};
