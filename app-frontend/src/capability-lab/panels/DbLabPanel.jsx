import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from '@sparrowengg/twigs-react';
import { sdkAction } from '../labApi.js';

const DB_TABS = [
  { id: 'string', label: 'String', keyName: 'StringTest' },
  { id: 'list', label: 'List', keyName: 'ListTest' },
  { id: 'map', label: 'Map', keyName: 'MapTest' },
  { id: 'number', label: 'Number', keyName: 'NumberTest' },
  { id: 'boolean', label: 'Boolean', keyName: 'BooleanTest' },
];

/**
 * One row per API action: small heading, optional helper text, optional input, CTA button(s).
 */
function DbActionRow({ title, description, input, cta, inputWide = false }) {
  return (
    <Box
      className="lab-db-action-row"
      css={{
        padding: '$4 0',
        borderBottom: '1px solid $neutral200',
        '&:last-of-type': {
          borderBottom: 'none',
          paddingBottom: 0,
        },
      }}
    >
      <Text
        as="div"
        size="xs"
        weight="bold"
        css={{
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '$neutral700',
          marginBottom: description ? '$1' : '$2',
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text as="div" size="xs" css={{ color: '$neutral500', lineHeight: 1.45, marginBottom: '$2' }}>
          {description}
        </Text>
      ) : null}
      {input ? (
        <Box
          css={{
            marginBottom: '$3',
            width: '100%',
            maxWidth: inputWide ? 'min(100%, 42rem)' : '28rem',
          }}
        >
          {input}
        </Box>
      ) : null}
      <HStack gap="$2" wrap="wrap" align="flex-start">
        {cta}
      </HStack>
    </Box>
  );
}

export function DbLabPanel({
  loading,
  runAction,
  dbTab,
  setDbTab,
  dbStringValue,
  setDbStringValue,
  mapJson,
  setMapJson,
  numVal,
  setNumVal,
  dbIncrementBy,
  setDbIncrementBy,
}) {
  const [mapJsonFormatError, setMapJsonFormatError] = useState(null);
  const tabMeta = DB_TABS.find((t) => t.id === dbTab) || DB_TABS[0];

  const formatMapJson = () => {
    setMapJsonFormatError(null);
    try {
      const parsed = JSON.parse(mapJson);
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        setMapJsonFormatError('Root value must be a JSON object {...}, not an array or primitive.');
        return;
      }
      setMapJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setMapJsonFormatError(e?.message || 'Invalid JSON');
    }
  };

  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        Typed <Text as="span" weight="bold">$db</Text> helpers: pick a data type tab, then run only
        the actions for that key (<Text as="span" weight="bold">{tabMeta.keyName}</Text>). Run logs for
        each tab are stored separately (<Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$db-string</Text>,{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$db-list</Text>, etc.).
      </Text>

      <Box
        className="lab-db-tablist"
        role="tablist"
        aria-label="$db data types"
        css={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '$2',
          paddingBottom: '$3',
          borderBottom: '1px solid $neutral200',
        }}
      >
        {DB_TABS.map((t) => {
          const selected = dbTab === t.id;
          return (
            <Button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`db-tabpanel-${t.id}`}
              id={`db-tab-${t.id}`}
              className={`lab-db-tab${selected ? ' is-selected' : ''}`}
              size="sm"
              color={selected ? 'primary' : 'secondary'}
              variant={selected ? 'solid' : 'outline'}
              onClick={() => setDbTab(t.id)}
            >
              {t.label}
            </Button>
          );
        })}
      </Box>

      <Box
        role="tabpanel"
        id={`db-tabpanel-${dbTab}`}
        aria-labelledby={`db-tab-${dbTab}`}
        className="lab-db-tabpanel lab-db-action-list"
        css={{ paddingTop: '$1' }}
      >
        {dbTab === 'string' ? (
          <VStack gap="$0" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', fontFamily: 'ui-monospace, monospace', marginBottom: '$3' }}>
              Key: StringTest · $db.string
            </Text>
            <DbActionRow
              title="Set string"
              description="Writes the value below to key StringTest via $db.string.set."
              input={
                <>
                  <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
                    Value
                  </Text>
                  <Input
                    value={dbStringValue}
                    onChange={(e) => setDbStringValue(e.target.value)}
                    placeholder="Text stored at StringTest"
                    size="lg"
                  />
                </>
              }
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(
                      () => sdkAction('$db', 'stringSet', { stringValue: dbStringValue }),
                      '$db · string · set',
                    )
                  }
                >
                  Run set
                </Button>
              }
            />
            <DbActionRow
              title="Get string"
              description="Reads the raw string at StringTest with $db.string.get."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'stringGet'), '$db · string · get')}
                >
                  Run get
                </Button>
              }
            />
            <DbActionRow
              title="Delete string"
              description="Removes StringTest with $db.string.delete."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(() => sdkAction('$db', 'stringDelete'), '$db · string · delete')
                  }
                >
                  Run delete
                </Button>
              }
            />
          </VStack>
        ) : null}

        {dbTab === 'list' ? (
          <VStack gap="$0" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', fontFamily: 'ui-monospace, monospace', marginBottom: '$3' }}>
              Key: ListTest · $db.list
            </Text>
            <DbActionRow
              title="Append entry"
              description="Pushes a new timestamped JSON item onto ListTest ($db.list.get / set)."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'listAppend'), '$db · list · append')}
                >
                  Run append
                </Button>
              }
            />
            <DbActionRow
              title="Get list"
              description="Returns the full array stored at ListTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'listGet'), '$db · list · get')}
                >
                  Run get
                </Button>
              }
            />
            <DbActionRow
              title="Clear list"
              description="Sets ListTest to an empty array (no $db.list.delete in Appnest; same as lab reset for this key)."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'listDelete'), '$db · list · clear')}
                >
                  Run clear
                </Button>
              }
            />
          </VStack>
        ) : null}

        {dbTab === 'map' ? (
          <VStack gap="$0" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', fontFamily: 'ui-monospace, monospace', marginBottom: '$3' }}>
              Key: MapTest · $db.map
            </Text>
            <DbActionRow
              title="Set map"
              description="Paste a JSON object. It is stored as-is at MapTest via $db.map.set (must be a single {...} object)."
              inputWide
              input={
                <>
                  <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
                    Map value (JSON object)
                  </Text>
                  <Textarea
                    className="lab-map-json-textarea"
                    value={mapJson}
                    onChange={(e) => {
                      setMapJson(e.target.value);
                      setMapJsonFormatError(null);
                    }}
                    spellCheck={false}
                    css={{
                      width: '100%',
                      minHeight: '200px',
                      maxHeight: '320px',
                      overflow: 'auto',
                      resize: 'vertical',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '$sm',
                      lineHeight: 1.45,
                    }}
                  />
                  {mapJsonFormatError ? (
                    <Text as="div" size="xs" css={{ color: '#b91c1c', marginTop: '$2' }}>
                      {mapJsonFormatError}
                    </Text>
                  ) : null}
                </>
              }
              cta={
                <>
                  <Button
                    type="button"
                    color="secondary"
                    variant="outline"
                    disabled={loading}
                    onClick={formatMapJson}
                  >
                    Format JSON
                  </Button>
                  <Button
                    color="secondary"
                    variant="outline"
                    disabled={loading}
                    onClick={() =>
                      runAction(
                        () => sdkAction('$db', 'mapSet', { mapJson }),
                        '$db · map · set',
                      )
                    }
                  >
                    Run set
                  </Button>
                </>
              }
            />
            <DbActionRow
              title="Get map"
              description="Reads the object at MapTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'mapGet'), '$db · map · get')}
                >
                  Run get
                </Button>
              }
            />
            <DbActionRow
              title="Delete map"
              description="Removes MapTest with $db.map.delete."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'mapDelete'), '$db · map · delete')}
                >
                  Run delete
                </Button>
              }
            />
          </VStack>
        ) : null}

        {dbTab === 'number' ? (
          <VStack gap="$0" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', fontFamily: 'ui-monospace, monospace', marginBottom: '$3' }}>
              Key: NumberTest · $db.number
            </Text>
            <DbActionRow
              title="Set number"
              description="Writes a numeric value to NumberTest."
              input={
                <>
                  <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
                    Value
                  </Text>
                  <Input type="number" value={numVal} onChange={(e) => setNumVal(e.target.value)} />
                </>
              }
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(
                      () => sdkAction('$db', 'numberSet', { numberValue: Number(numVal) }),
                      '$db · number · set',
                    )
                  }
                >
                  Run set
                </Button>
              }
            />
            <DbActionRow
              title="Get number"
              description="Reads the number at NumberTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'numberGet'), '$db · number · get')}
                >
                  Run get
                </Button>
              }
            />
            <DbActionRow
              title="Increment number"
              description="Adds the step below to NumberTest ($db.number.increment)."
              input={
                <>
                  <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
                    Step
                  </Text>
                  <Input
                    type="number"
                    value={dbIncrementBy}
                    onChange={(e) => setDbIncrementBy(e.target.value)}
                    placeholder="1"
                  />
                </>
              }
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(
                      () =>
                        sdkAction('$db', 'numberIncrement', {
                          incrementBy: Number(dbIncrementBy),
                        }),
                      '$db · number · increment',
                    )
                  }
                >
                  Run increment
                </Button>
              }
            />
            <DbActionRow
              title="Delete number"
              description="Removes NumberTest with $db.number.delete."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'numberDelete'), '$db · number · delete')}
                >
                  Run delete
                </Button>
              }
            />
          </VStack>
        ) : null}

        {dbTab === 'boolean' ? (
          <VStack gap="$0" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', fontFamily: 'ui-monospace, monospace', marginBottom: '$3' }}>
              Key: BooleanTest · $db.boolean
            </Text>
            <DbActionRow
              title="Set boolean (true)"
              description="Writes true to BooleanTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(
                      () => sdkAction('$db', 'booleanSet', { boolValue: true }),
                      '$db · boolean · set true',
                    )
                  }
                >
                  Run set true
                </Button>
              }
            />
            <DbActionRow
              title="Set boolean (false)"
              description="Writes false to BooleanTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(
                      () => sdkAction('$db', 'booleanSet', { boolValue: false }),
                      '$db · boolean · set false',
                    )
                  }
                >
                  Run set false
                </Button>
              }
            />
            <DbActionRow
              title="Get boolean"
              description="Reads the boolean at BooleanTest."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() => runAction(() => sdkAction('$db', 'booleanGet'), '$db · boolean · get')}
                >
                  Run get
                </Button>
              }
            />
            <DbActionRow
              title="Delete boolean"
              description="Removes BooleanTest with $db.boolean.delete."
              cta={
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    runAction(() => sdkAction('$db', 'booleanDelete'), '$db · boolean · delete')
                  }
                >
                  Run delete
                </Button>
              }
            />
          </VStack>
        ) : null}
      </Box>
    </VStack>
  );
}
