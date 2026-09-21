import React from 'react'

export default function DoseToggle({ value, onChange, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>1일 복용량</span>
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        {[1, 2, 3, 4].map(count => {
          const active = count === value
          return (
            <button
              key={count}
              onClick={() => onChange(count)}
              aria-pressed={active}
              style={{
                padding: '4px 9px',
                border: 'none',
                borderLeft: count === 1 ? 'none' : '1px solid var(--border)',
                background: active ? color : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >{count}정</button>
          )
        })}
      </div>
    </div>
  )
}
