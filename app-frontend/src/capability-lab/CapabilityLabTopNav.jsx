import { Box, Button, CircleLoader, Heading, Text } from '@sparrowengg/twigs-react';

export function CapabilityLabTopNav({ loading, onOpenResetAll }) {
  return (
    <Box
      id="capability-lab-topnav"
      css={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background:
          'linear-gradient(135deg, $colors$primary100 0%, $colors$accent50 55%, $colors$white900 100%)',
        borderBottom: '1px solid $colors$neutral200',
        padding: '$4 $5',
        boxShadow: 'sm',
      }}
    >
      <Box className="lab-topnav-row">
        <Box className="lab-topnav-title-block">
          <Heading size="h5" css={{ color: '$neutral900' }}>
            Core Capability Lab
          </Heading>
          <Text as="p" className="lab-subtitle" size="sm" css={{ color: '$neutral700' }}>
            Appnest Functions playground · Twigs UI · responsive layout
          </Text>
        </Box>
        <Box className="lab-topnav-actions">
          {loading ? <CircleLoader size="sm" /> : null}
          <Button
            className="lab-toolbar-btn lab-toolbar-btn-primary"
            color="primary"
            variant="solid"
            size="sm"
            disabled={loading}
            onClick={onOpenResetAll}
          >
            Reset all lab data
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
