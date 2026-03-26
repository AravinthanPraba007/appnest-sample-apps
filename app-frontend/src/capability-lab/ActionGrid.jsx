import { Box } from '@sparrowengg/twigs-react';

export function ActionGrid({ children }) {
  return (
    <Box
      className="lab-action-grid"
      css={{
        display: 'grid',
        gap: '$3',
        gridTemplateColumns: '1fr',
        '@media (min-width: 520px)': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@media (min-width: 900px)': {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
      }}
    >
      {children}
    </Box>
  );
}
