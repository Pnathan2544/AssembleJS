import { useState, useEffect } from 'react'

const API = '/api'

function useApi(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}${path}`)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [path])

  return { data, error, loading }
}

function StatusBadge({ ok, label }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: ok ? '#16a34a' : '#dc2626',
      color: '#fff',
      marginLeft: 8,
    }}>
      {label}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '16px 20px',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function TaskList() {
  const { data, loading, error } = useApi('/tasks')
  const [newTitle, setNewTitle] = useState('')
  const [tasks, setTasks] = useState(null)

  useEffect(() => {
    if (data?.tasks) setTasks(data.tasks)
  }, [data])

  const createTask = async () => {
    if (!newTitle.trim()) return
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    const json = await res.json()
    if (json.task) {
      setTasks(prev => [json.task, ...(prev || [])])
      setNewTitle('')
    }
  }

  return (
    <Section title="Tasks (cache-aside demo)">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createTask()}
          placeholder="New task title…"
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#0f172a',
            border: '1px solid #475569',
            borderRadius: 6,
            color: '#f1f5f9',
            fontSize: 14,
          }}
        />
        <button
          onClick={createTask}
          style={{
            padding: '8px 18px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Add
        </button>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading…</p>}
      {error && <p style={{ color: '#f87171' }}>Failed to load tasks.</p>}
      {tasks && tasks.length === 0 && <p style={{ color: '#64748b' }}>No tasks yet.</p>}
      {tasks && tasks.map(t => (
        <Card key={t._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t.title}</span>
            <span style={{ color: '#64748b', fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</span>
          </div>
          {t.fromCache && (
            <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, display: 'block' }}>from cache</span>
          )}
        </Card>
      ))}
    </Section>
  )
}

export default function App() {
  const { data: health } = useApi('/health')
  const { data: version } = useApi('/version')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          NodeMesh
          <StatusBadge ok={health?.status === 'ok'} label={health?.status ?? '…'} />
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {version ? `v${version.version} · ${version.nodeEnv}` : 'Connecting…'}
        </p>
      </header>

      {health && (
        <Section title="Service health">
          {Object.entries(health.services || {}).map(([svc, ok]) => (
            <Card key={svc}>
              <span style={{ textTransform: 'capitalize' }}>{svc}</span>
              <StatusBadge ok={ok} label={ok ? 'healthy' : 'down'} />
            </Card>
          ))}
        </Section>
      )}

      <TaskList />
    </div>
  )
}
