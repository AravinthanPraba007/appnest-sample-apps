import { Box, Button, Text } from '@sparrowengg/twigs-react';
import { SDK_NAV } from './sdkNav.js';

export function CapabilityLabSidebar({ activeSdk, onSelectSdk }) {
  return (
    <Box
      id="capability-lab-sidebar"
      as="nav"
      aria-label="Appnest Functions"
      css={{
        width: '100%',
        flexShrink: 0,
        borderBottom: '1px solid $neutral200',
        backgroundColor: '$neutral50',
        padding: '$4',
        '@media (min-width: 900px)': {
          width: '260px',
          borderBottom: 'none',
          borderRight: '1px solid $neutral200',
          minHeight: 'calc(100vh - 72px)',
        },
      }}
    >
      <Text
        as="span"
        className="lab-sidebar-label"
        size="sm"
        weight="bold"
        css={{ color: '$neutral600', marginBottom: '$3', letterSpacing: '0.02em' }}
      >
        Appnest Functions
      </Text>
      <Box className="lab-nav-stack">
        {SDK_NAV.map((item) => (
          <Button
            key={item.id}
            className={`lab-sdk-nav-btn${activeSdk === item.id ? ' is-active' : ''}`}
            color={activeSdk === item.id ? 'primary' : 'default'}
            variant={activeSdk === item.id ? 'solid' : 'ghost'}
            size="lg"
            css={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              height: 'auto',
              minHeight: '44px',
              paddingY: '$3',
              fontFamily: 'ui-monospace, monospace',
            }}
            onClick={() => onSelectSdk(item.id)}
          >
            <Text as="span" className="lab-nav-title" weight="bold">
              {item.title}
            </Text>
          </Button>
        ))}
      </Box>
    </Box>
  );
}
