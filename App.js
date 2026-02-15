import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { createDonRuntime, runDonCommand } from './src/donEngine';

const runtime = createDonRuntime();

const commandExamples = [
  'Open strategy board for Q3 launch',
  'Spend 80 on software',
  'Manage launch timeline for investor demo',
  'Automate morning reporting workflow',
  'Assess if our plan has risk this week',
  'Read and summarize priority tasks',
];

export default function App() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [snapshot, setSnapshot] = useState(runtime.getState());

  const intro = useMemo(
    () =>
      'Don is an execution-grade voice command system: opens, spends, reads, manages, automates, and assesses with memory + guardrails.',
    []
  );

  const processCommand = (text) => {
    if (!text.trim()) return;

    const result = runDonCommand(text, runtime);
    setHistory((prev) => [{ input: text, result }, ...prev].slice(0, 20));
    setSnapshot(runtime.getState());
    setQuery('');
    Speech.speak(result.summary, { language: 'en-US', pitch: 1.04, rate: 1.0 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DON</Text>
      <Text style={styles.subtitle}>{intro}</Text>

      <View style={styles.metricsRow}>
        <Metric label="Tasks" value={snapshot.tasks.length} />
        <Metric label="Automations" value={snapshot.automations.length} />
        <Metric label="Opened" value={snapshot.openedApps.length} />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Speak or type a command for DON"
        placeholderTextColor="#97a5cf"
        style={styles.input}
        multiline
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => processCommand(query)}>
          <Text style={styles.btnText}>Execute</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsWrap}>
        {commandExamples.map((example) => (
          <TouchableOpacity key={example} style={styles.chip} onPress={() => setQuery(example)}>
            <Text style={styles.chipText}>{example}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.timeline} contentContainerStyle={styles.timelineContent}>
        {history.map((item, idx) => (
          <View key={`${item.input}-${idx}`} style={styles.card}>
            <Text style={styles.userLabel}>YOU</Text>
            <Text style={styles.userText}>{item.input}</Text>

            <Text style={styles.donLabel}>DON · {item.result.intent.toUpperCase()} · {item.result.riskLevel.toUpperCase()} RISK</Text>
            <Text style={styles.donText}>{item.result.summary}</Text>

            {item.result.actions.map((action) => (
              <Text key={action} style={styles.actionItem}>• {action}</Text>
            ))}

            <Text style={styles.snapshotText}>
              Snapshot — tasks: {item.result.stateSnapshot.tasks}, automations: {item.result.stateSnapshot.automations}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050918',
    padding: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 6,
    color: '#c5d0ee',
    fontSize: 13,
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0f1632',
    borderWidth: 1,
    borderColor: '#2d3f7a',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricValue: {
    color: '#dde7ff',
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#9fb0e1',
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    marginTop: 14,
    minHeight: 80,
    backgroundColor: '#111a38',
    color: '#eff4ff',
    borderWidth: 1,
    borderColor: '#2b3f79',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  actionsRow: {
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: '#4768ff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  chipsWrap: {
    marginTop: 12,
    maxHeight: 50,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#121f46',
    borderWidth: 1,
    borderColor: '#334b8f',
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#bfd0ff',
    fontSize: 12,
  },
  timeline: {
    marginTop: 12,
  },
  timelineContent: {
    gap: 10,
    paddingBottom: 18,
  },
  card: {
    backgroundColor: '#0c1430',
    borderWidth: 1,
    borderColor: '#2d3f7c',
    borderRadius: 12,
    padding: 12,
  },
  userLabel: {
    color: '#90a7ff',
    fontWeight: '700',
    fontSize: 11,
  },
  userText: {
    color: '#dce5ff',
    marginTop: 4,
  },
  donLabel: {
    marginTop: 10,
    color: '#70f0db',
    fontSize: 11,
    fontWeight: '700',
  },
  donText: {
    marginTop: 4,
    color: '#f1f5ff',
    lineHeight: 20,
  },
  actionItem: {
    color: '#bbcbf6',
    marginTop: 6,
    lineHeight: 19,
  },
  snapshotText: {
    marginTop: 8,
    color: '#8fa4da',
    fontSize: 12,
  },
});
