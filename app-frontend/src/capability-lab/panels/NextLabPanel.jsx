import {
  Box,
  Button,
  Input,
  Separator,
  Text,
  Textarea,
  VStack,
} from '@sparrowengg/twigs-react';
import { sdkAction } from '../labApi.js';

export function NextLabPanel({
  loading,
  runAction,
  nextFn,
  setNextFn,
  nextDelay,
  setNextDelay,
  nextPayloadJson,
  setNextPayloadJson,
}) {
  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        <Text as="span" weight="bold">$next.run</Text> invokes an exported backend
        function by name. Use the chain demo to exercise step 1 → delayed step 2.
      </Text>
      <Button
        color="secondary"
        variant="outline"
        size="lg"
        disabled={loading}
        css={{ alignSelf: 'flex-start' }}
        onClick={() => runAction(() => sdkAction('$next', 'chainDemo'), '$next · chain demo')}
      >
        Chain demo (step 1 + $next → step 2)
      </Button>
      <Separator />
      <Text weight="bold">Custom $next.run</Text>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          functionName
        </Text>
        <Input value={nextFn} onChange={(e) => setNextFn(e.target.value)} />
      </Box>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          delay (seconds, 0–300)
        </Text>
        <Input value={nextDelay} onChange={(e) => setNextDelay(e.target.value)} />
      </Box>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          payload (JSON object)
        </Text>
        <Textarea
          value={nextPayloadJson}
          onChange={(e) => setNextPayloadJson(e.target.value)}
          rows={4}
        />
      </Box>
      <Button
        color="secondary"
        variant="outline"
        disabled={loading}
        css={{ alignSelf: 'flex-start' }}
        onClick={() =>
          runAction(
            () =>
              sdkAction('$next', 'run', {
                functionName: nextFn.trim(),
                payloadJson: nextPayloadJson,
                delaySeconds: Number(nextDelay) || 0,
              }),
            '$next · run',
          )
        }
      >
        Run $next.run
      </Button>
    </VStack>
  );
}
