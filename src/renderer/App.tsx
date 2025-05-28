import { useEffect, useState } from 'react'

function App() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    window.api.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })
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
