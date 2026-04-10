import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

interface OutputPanelProps {
  output: string;
  isRunning: boolean;
  error?: string;
}

export default function OutputPanel({ output, isRunning, error }: OutputPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Output</Text>

      {isRunning ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Running...</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          <Text style={styles.codeText}>{output || '// No output yet'}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 200, borderRadius: 12, overflow: 'hidden', margin: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F8FAFC' },
  header: { padding: 12, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  loading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginLeft: 8, color: '#6B7280' },
  scroll: { flex: 1 },
  codeText: { padding: 12, fontFamily: 'monospace', fontSize: 14, color: '#1F2937' },
  error: { padding: 12, color: '#EF4444' },
});
