import { Button, Text, VStack } from '@sparrowengg/twigs-react';
import { sdkAction } from '../labApi.js';

export function TraceLabPanel({ loading, runAction }) {
  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800' }}>
        Read <Text as="span" weight="bold">getTraceId()</Text> from the Appnest
        runtime for correlation with platform logs.
      </Text>
      <Button
        color="secondary"
        variant="outline"
        size="lg"
        disabled={loading}
        css={{ alignSelf: 'flex-start' }}
        onClick={() => runAction(() => sdkAction('getTraceId', 'read'), 'getTraceId · read')}
      >
        Read trace id
      </Button>
    </VStack>
  );
}
