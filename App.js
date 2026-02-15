import React, { useMemo, useRef, useState } from 'react';
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
import { createDonBrain } from './src/donEngine';

const powerCommands = [
  'Manage product launch checklist tomorrow at 9 am',
  'Spend 48 from groceries budget',
  'Automate my morning routine',
  'Open calendar war-room',
  'Assess execution risk now',
  'Connect banking integration',
  'Read and summarize my system status',
];

export default function App() {
  const brainRef = useRef(createDonBrain());
  const [query, setQuery] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [snapshot, setSnapshot] = useState(brainRef.current.getSnapshot());

  const intro = useMemo(
    () =>
      'Don is your high-autonomy voice copilot for planning, spending, automation, and live risk assessment.',
    []
  );

  const processCommand = (text) => {
    if (!text.trim()) return;

    const result = brainRef.current.process(text);

    const nextTimeline = [
      {
        role: 'You',
        text,
      },
      {
        role: 'Don',
        text: result.summary,
        details: result.actions,
        riskLevel: result.riskLevel,
      },
      ...timeline,
    ];

    setTimeline(nextTimeline);
    setSnapshot(result.snapshot);
    setQuery('');
    Speech.speak(result.summary, { language: 'en', pitch: 1.02, rate: 1 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Don</Text>
      <Text style={styles.subtitle}>{intro}</Text>

      <View style={styles.dashboard}>
        <StatCard label="Autonomy" value={`${snapshot.autonomyScore}/100`} />
        <StatCard label="Risk" value={snapshot.riskLevel.toUpperCase()} />
        <StatCard label="Tasks" value={`${snapshot.pendingTasks}`} />
        <StatCard label="Flows" value={`${snapshot.automations}`} />
        <StatCard label="Providers" value={`${snapshot.connectedProviders}`} />
        <StatCard label="Audit" value={`${snapshot.auditEvents}`} />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Say or type a command for Don"
          placeholderTextColor="#9fa6b2"
          style={styles.input}
          multiline
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => processCommand(query)}>
          <Text style={styles.btnText}>Execute</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.examplesTitle}>Power commands</Text>
      <View style={styles.examplesWrap}>
        {powerCommands.map((example) => (
          <TouchableOpacity key={example} style={styles.exampleChip} onPress={() => setQuery(example)}>
            <Text style={styles.exampleText}>{example}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.timeline} contentContainerStyle={styles.timelineContent}>
        {timeline.map((item, idx) => (
          <View key={`${item.role}-${idx}`} style={styles.card}>
            <Text style={styles.cardRole}>{item.role}</Text>
            <Text style={styles.cardText}>{item.text}</Text>
            {item.details?.map((line) => (
              <Text key={line} style={styles.cardDetail}>
                • {line}
              </Text>
            ))}
            {item.riskLevel ? <Text style={styles.risk}>Risk: {item.riskLevel.toUpperCase()}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    padding: 16,
  },
  title: {
    color: '#f3f4f6',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    color: '#c3c8d3',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  dashboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#101935',
    borderWidth: 1,
    borderColor: '#2a3a69',
    borderRadius: 12,
    padding: 10,
  },
  statLabel: {
    color: '#8ea2d5',
    fontSize: 12,
  },
  statValue: {
    color: '#ecf2ff',
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
  },
  inputRow: {
    marginTop: 14,
  },
  input: {
    minHeight: 72,
    backgroundColor: '#11172b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#253056',
    color: '#e5e7eb',
    padding: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#4461ff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  examplesTitle: {
    marginTop: 16,
    color: '#dbe2f4',
    fontWeight: '600',
  },
  examplesWrap: {
    marginTop: 8,
    gap: 8,
  },
  exampleChip: {
    backgroundColor: '#121b36',
    borderColor: '#2f3f72',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  exampleText: {
    color: '#b9c4df',
    fontSize: 13,
  },
  timeline: {
    marginTop: 14,
  },
  timelineContent: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#0d142b',
    borderColor: '#253056',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardRole: {
    color: '#9ab2ff',
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    color: '#dce3f5',
    lineHeight: 20,
  },
  cardDetail: {
    marginTop: 4,
    color: '#b5c3e7',
    fontSize: 13,
  },
  risk: {
    marginTop: 8,
    color: '#ffce73',
    fontWeight: '700',
  },
});
