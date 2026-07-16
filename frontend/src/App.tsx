import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <div className="docker-status">
        <span className="docker-status-pulse"></span>
        Dockerized Development Server Running
      </div>
      
      <h1 className="title">Project Intern</h1>
      <p className="subtitle">Modern React + TypeScript + Vite Environment</p>

      <div className="details-grid">
        <div className="detail-card">
          <div className="detail-title">⚡ Vite HMR Active</div>
          <div className="detail-desc">Hot Module Replacement is running. Changes made to files in your local directory will reflect immediately.</div>
        </div>
        <div className="detail-card">
          <div className="detail-title">📦 Docker Mounted Workspace</div>
          <div className="detail-desc">The workspace is volume-mounted. Node dependencies are isolated within the container.</div>
        </div>
        <div className="detail-card">
          <div className="detail-title">🛠️ Configured for TSX</div>
          <div className="detail-desc">Fully configured TypeScript support out-of-the-box.</div>
        </div>
      </div>

      <button className="btn" onClick={() => setCount((count) => count + 1)}>
        Counter: {count}
      </button>
    </div>
  )
}

export default App
