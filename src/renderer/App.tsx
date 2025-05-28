import { useEffect, useState } from 'react'

function App() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    window.api.on('eventChannel', (msg) => { });
    window.api.send('toMain', {});
  }, [])

  const startServer = () => {
    window.api.send('start-server', { port: 3000 })
  }

  return (
    <div>
      <h1>TCP Chat Server</h1>
      <button onClick={startServer}>Start Server</button>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  )
}

export default App
