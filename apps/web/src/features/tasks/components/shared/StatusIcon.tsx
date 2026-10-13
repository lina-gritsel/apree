import { SvgIcon } from '@mui/material';
import type { Status } from '../../model/types';

export function StatusIcon({ status }: { status: Status }) {
  return (
    <SvgIcon
      viewBox="0 0 16 16"
      sx={{
        fontSize: 16,
        color:
          status === 'in_progress'
            ? '#d7b943'
            : status === 'done'
              ? 'primary.main'
              : 'text.secondary',
      }}
    >
      {status === 'done' ? (
        <>
          <circle cx="8" cy="8" r="6.5" fill="currentColor" />
          <path
            d="m4.7 8 2.1 2.1 4.5-4.5"
            fill="none"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle cx="8" cy="8" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {status === 'in_progress' && (
            <path d="M8 2.25a5.75 5.75 0 0 1 0 11.5Z" fill="currentColor" />
          )}
        </>
      )}
    </SvgIcon>
  );
}
