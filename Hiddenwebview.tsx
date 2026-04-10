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
