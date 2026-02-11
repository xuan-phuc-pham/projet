import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [backendResponse, setBackendResponse] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://100.106.222.60:3000'
        const res = await fetch(`${baseUrl}/health`)

        // if (!res.ok) {
        //   throw new Error(`Request failed with status ${res.status}`)
        // }

        const data = await res.json()
        setBackendResponse(data)
      } catch (err) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBackend()
  }, [])

  return (
    <div className="app">
      <h1>Backend response</h1>

      {loading && <p>Loading backend data...</p>}

      {error && !loading && (
        <p className="error">
          Failed to reach backend no no: <code>{error}</code>
        </p>
      )}

      {!loading && !error && backendResponse && (
        <pre className="response">
          {JSON.stringify(backendResponse, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App
