import { Avatar } from '@mui/material';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import type { User } from '../model/types';
export function UserAvatar({
  user,
  size = 22,
}: {
  user?: Pick<User, 'name' | 'color'> | null;
  size?: number;
}) {
  return (
    <Avatar
      aria-label={user?.name ?? 'Без исполнителя'}
      sx={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.4),
        fontWeight: 600,
        bgcolor: user?.color ?? 'action.hover',
        color: user ? '#fff' : 'text.secondary',
      }}
    >
      {user ? (
        user.name
          .split(/\s+/)
          .filter((part) => /^[\p{L}\p{N}]/u.test(part) && part !== 'демо')
          .slice(0, 2)
          .map((part) => Array.from(part)[0])
          .join('')
          .toUpperCase()
      ) : (
        <PersonOutlineRounded sx={{ fontSize: size * 0.7 }} />
      )}
    </Avatar>
  );
}
