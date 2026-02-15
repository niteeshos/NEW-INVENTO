import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
} from 'react-native';
import * as Speech from 'expo-speech';
import { createDonBrain } from './src/donEngine';

const powerCommands = [
  'Don manage product launch checklist tomorrow at 9 am',
  'Don spend 900 from travel budget',
  'Don spend 900 from travel budget approve',
  'Don automate my morning routine',
  'Don connect banking integration',
  'Don assess execution risk now',
  'Don read and summarize my system status',
];

export default function App() {
  const brainRef = useRef(createDonBrain());
  const [query, setQuery] = useState('Don read and summarize my system status');
  const [timeline, setTimeline] = useState([]);
  const [snapshot, setSnapshot] = useState(brainRef.current.getSnapshot());
  const [lockScreenMode, setLockScreenMode] = useState(true);
  const [continuousVoice, setContinuousVoice] = useState(true);
  const [voiceListening, setVoiceListening] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const intro = useMemo(
    () => 'Don is fully voice-automated via wake-word pipeline: say “Don …command…” and execution starts with autonomous follow-up actions.',
    []
  );

  const pushTimeline = (role, text, details, riskLevel) => {
    setTimeline((prev) => [{ role, text, details, riskLevel }, ...prev]);
  };

  const speakResults = async (results) => {
    for (const result of results) {
      Speech.speak(result.summary, { language: 'en', pitch: 1.02, rate: 1 });
    }
  };

  const runVoicePipeline = async (transcript) => {
    const voiceRun = brainRef.current.processVoiceCommand(transcript);

    pushTimeline('Voice', transcript, [voiceRun.reason], undefined);

    if (!voiceRun.accepted) {
      setSnapshot(voiceRun.snapshot);
      return;
    }

    voiceRun.results.forEach((result) => {
      pushTimeline('Don', result.summary, [...result.actions, `Execution: ${result.execution.id} (${result.execution.title})`], result.riskLevel);
    });

    setSnapshot(voiceRun.snapshot);
    await speakResults(voiceRun.results);
  };

  const triggerVoiceWake = async () => {
    setVoiceListening(true);
    const transcript = query.trim() || 'Don read status';
    await runVoicePipeline(transcript);
    setVoiceListening(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Don</Text>
      <Text style={styles.subtitle}>{intro}</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Lock screen voice mode</Text>
        <Switch value={lockScreenMode} onValueChange={setLockScreenMode} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Continuous voice automation</Text>
        <Switch value={continuousVoice} onValueChange={setContinuousVoice} />
      </View>

      {lockScreenMode ? (
        <View style={styles.lockPanel}>
          <Text style={styles.lockTitle}>LOCK SCREEN • Wake phrase: “Don ...”</Text>
          <Animated.View
            style={[
              styles.voiceOrb,
              {
                transform: [{ scale: voiceListening || continuousVoice ? 1.18 : pulse }],
                shadowOpacity: voiceListening ? 0.9 : 0.45,
              },
            ]}
          >
            <Text style={styles.voiceOrbText}>{voiceListening ? 'Listening…' : 'Always Ready'}</Text>
          </Animated.View>
          <TouchableOpacity style={styles.voiceBtn} onPressIn={triggerVoiceWake}>
            <Text style={styles.btnText}>Speak Command</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.dashboard}>
        <StatCard label="Autonomy" value={`${snapshot.autonomyScore}/100`} />
        <StatCard label="Risk" value={snapshot.riskLevel.toUpperCase()} />
        <StatCard label="Tasks" value={`${snapshot.pendingTasks}`} />
        <StatCard label="Flows" value={`${snapshot.automations}`} />
        <StatCard label="Providers" value={`${snapshot.connectedProviders}`} />
        <StatCard label="Execs" value={`${snapshot.executions}`} />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Voice transcript text, e.g. 'Don automate morning routine'"
          placeholderTextColor="#9fa6b2"
          style={styles.input}
          multiline
        />
      </View>

      <Text style={styles.examplesTitle}>Voice commands</Text>
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
  container: { flex: 1, backgroundColor: '#050816', padding: 16 },
  title: { color: '#f3f4f6', fontSize: 36, fontWeight: '700' },
  subtitle: { color: '#c3c8d3', marginTop: 8, fontSize: 14, lineHeight: 21 },
  switchRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchText: { color: '#dce3f5', fontWeight: '600' },
  lockPanel: {
    marginTop: 10,
    backgroundColor: '#0c1329',
    borderColor: '#2b3a66',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  lockTitle: { color: '#9ab2ff', fontWeight: '700', fontSize: 12 },
  voiceOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5a77ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7694ff',
    shadowRadius: 20,
  },
  voiceOrbText: { color: '#fff', fontWeight: '700' },
  voiceBtn: {
    minWidth: 170,
    backgroundColor: '#2f4cff',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  dashboard: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  statCard: {
    width: '48%',
    backgroundColor: '#101935',
    borderWidth: 1,
    borderColor: '#2a3a69',
    borderRadius: 12,
    padding: 10,
  },
  statLabel: { color: '#8ea2d5', fontSize: 12 },
  statValue: { color: '#ecf2ff', marginTop: 4, fontSize: 18, fontWeight: '700' },
  inputRow: { marginTop: 14 },
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
  examplesTitle: { marginTop: 16, color: '#dbe2f4', fontWeight: '600' },
  examplesWrap: { marginTop: 8, gap: 8 },
  exampleChip: {
    backgroundColor: '#121b36',
    borderColor: '#2f3f72',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  exampleText: { color: '#b9c4df', fontSize: 13 },
  timeline: { marginTop: 14 },
  timelineContent: { gap: 10, paddingBottom: 20 },
  card: {
    backgroundColor: '#0d142b',
    borderColor: '#253056',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardRole: { color: '#9ab2ff', fontWeight: '700', marginBottom: 6 },
  cardText: { color: '#dce3f5', lineHeight: 20 },
  cardDetail: { marginTop: 4, color: '#b5c3e7', fontSize: 13 },
  risk: { marginTop: 8, color: '#ffce73', fontWeight: '700' },
});
