// Imports (add these)
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';  // expo install react-native-webview
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../common/ThemeProvider';  // your theme hook

export default function EditorScreen() {
  const { theme } = useTheme();
  const = useState('// Type JS here\nconsole.log(2 + 2);');
  const = useState('');
  const = useState(false);
  const webViewRef = useRef<WebView>(null);

  const runCode = () => {
    setIsRunning(true);
    setOutput('Running...\n');

    webViewRef.current?.injectJavaScript(`
      window.postMessage({ code: ${JSON.stringify(code)} }, "*");
      true;
    `);

    // Safety timeout
    setTimeout(() => {
      if (isRunning) {
        setIsRunning(false);
        setOutput(prev => prev + '\nTimeout—took too long.');
      }
    }, 10000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Hidden JS runner */}
      <WebView
        ref={webViewRef}
        source={{
          html: `
            <!DOCTYPE html><html><body>
              <script>
                window.onerror = (msg) => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', msg}));
                  return true;
                };
                window.addEventListener('message', e => {
                  try {
                    const res = eval(e.data.code);
                    window.ReactNativeWebView.postMessage(JSON.stringify({type:'result', res}));
                  } catch (err) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', msg: err.message}));
                  }
                });
              </script>
            </body></html>
          `
        }}
        style={{ height: 0, width: 0 }}
        onMessage={e => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'result') {
              setOutput(`→ ${data.res ?? 'undefined'}`);
            } else {
              setOutput(`Error: ${data.msg}`);
            }
          } catch {}
          setIsRunning(false);
        }}
      />

      {/* Editor */}
      <TextInput
        multiline
        style={{ flex: 1, padding: 16, fontFamily: 'monospace', color: theme.textPrimary, backgroundColor: theme.card }}
        value={code}
        onChangeText={setCode}
      />

      {/* Run button */}
      <TouchableOpacity
        onPress={runCode}
        disabled={isRunning}
        style={{ padding: 16, backgroundColor: '#10B981', alignItems: 'center' }}
      >
        {isRunning ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Run JS</Text>
        )}
      </TouchableOpacity>

      {/* Output */}
      <OutputPanel output={output} isRunning={isRunning} />
    </View>
  );
}
