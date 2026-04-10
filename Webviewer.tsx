// 1. Import (add this near the top, after your other imports)
import { WebView } from 'react-native-webview';  // run: expo install react-native-webview

// 2. Inside EditorScreen: add these states + ref (after your existing useState calls)
const = useState('');
const webViewRef = React.useRef<WebView>(null);

// 3. Hidden WebView for real JS execution (put this somewhere in your return JSX, like at the end of the main <View>)
const jsExecutionWebView = (
  <WebView
    ref={webViewRef}
    source={{
      html: `
        <!DOCTYPE html>
        <html><body>
          <script>
            window.onerror = (msg, url, line) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message:msg}));
              return true;
            };
            window.addEventListener('message', (e) => {
              try {
                const result = eval(e.data.code);
                window.ReactNativeWebView.postMessage(JSON.stringify({type:'result', value: result}));
              } catch (err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message: err.message}));
              }
            });
          </script>
        </body></html>
      `
    }}
    style={{ height: 0, width: 0, opacity: 0 }}
    onMessage={(event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'result') {
          setJsResult(String(data.value ?? 'undefined'));
          setOutput(`→ ${String(data.value ?? 'undefined')}`);
        } else if (data.type === 'error') {
          setOutput(`Error: ${data.message}`);
        }
      } catch {}
    }}
  />
);

// 4. Real runCode handler (replace your old one—this handles JS via WebView, Python via Piston API)
const runCode = async (state: any) => {  // <-- use 'any' or type it properly
  state.setIsRunning(true);
  state.setShowOutput(true);

  try {
    if (state.language === 'javascript') {
      state.setOutput('Executing JavaScript...\n');
      webViewRef.current?.injectJavaScript(`
        window.postMessage({code: ${JSON.stringify(state.code)}}, "*");
        true;
      `);
      // Timeout if it hangs
      setTimeout(() => {
        if (state.isRunning) {
          state.setIsRunning(false);
          state.setOutput(state.output + '\n\n(execution timeout)');
        }
      }, 15000);
    } 
    else if (state.language === 'python') {
      state.setOutput('Executing Python...\n');
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10',
          files: [{ name: 'main.py', content: state.code }]
        })
      });
      const data = await res.json();
      if (data.run.code === 0) {
        state.setOutput(data.run.output || data.run.stdout || '(no output)');
      } else {
        state.setOutput('Error:\n' + (data.run.stderr || 'Unknown error'));
      }
    } 
    else {
      state.setOutput('Only JavaScript and Python supported right now.');
    }
  } catch (err) {
    state.setOutput(`Network error: ${err}`);
  } finally {
    state.setIsRunning(false);
  }
};
