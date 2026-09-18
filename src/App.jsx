import React, { useEffect, useState } from 'react'
import drugs from './data/drugs.js'
import Sidebar from './components/Sidebar.jsx'
import DrugHeader from './components/DrugHeader.jsx'
import ApprovalSection from './components/ApprovalSection.jsx'
import PriceSection from './components/PriceSection.jsx'
import CompetitorSection, { CompareTray } from './components/CompetitorSection.jsx'
import DiagnosisCodePage from './components/DiagnosisCodePage.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(drugs[0].id)
  const [activeSection, setActiveSection] = useState('overview')
  const [diagDrug, setDiagDrug] = useState(null)
  const [copayRate, setCopayRate] = useState(0.3)   // 본인부담률 (약가·경쟁품·제네릭 공유)
  const [compareItems, setCompareItems] = useState([])
  const drug = drugs.find(d => d.id === selectedId)

  useEffect(() => {
    setCompareItems([])
    setActiveSection('priceComparison')
  }, [selectedId])

  const toggleCompare = item => setCompareItems(prev => {
    const exists = prev.some(selected => selected.compareKey === item.compareKey)
    return exists ? prev.filter(selected => selected.compareKey !== item.compareKey) : [...prev, item]
  })

  if (diagDrug) {
    return <DiagnosisCodePage drug={diagDrug} onClose={() => setDiagDrug(null)} />
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <Sidebar drugs={drugs} selectedId={selectedId} onSelect={setSelectedId} />

      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minWidth: 0,
      }}>
        <TopBar activeSection={activeSection} onSelect={setActiveSection} color={drug.color} />
        <DrugHeader drug={drug} />

        <SectionContent
          activeSection={activeSection}
          drug={drug}
          allDrugs={drugs}
          copayRate={copayRate}
          setCopayRate={setCopayRate}
          compareItems={compareItems}
          onToggleCompare={toggleCompare}
          onShowDiag={() => setDiagDrug(drug)}
        />

        {(activeSection === 'priceComparison' || activeSection === 'competitors' || activeSection === 'generics') && (
          <CompareTray
            items={compareItems}
            referencePrice={drug.prices[0]?.insurancePrice ?? 0}
            copayRate={copayRate}
            onClear={() => setCompareItems([])}
          />
        )}

        <footer style={{
          textAlign: 'center',
          padding: '12px 0',
          fontSize: 12,
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
        }}>
          본 대시보드는 건강보험심사평가원(HIRA) 기준 약가 정보를 바탕으로 한 참고용 데이터입니다. 실제 약가는 고시 변경에 따라 달라질 수 있습니다. 기준일: 2026년 6월 1일
        </footer>
      </main>
    </div>
  )
}

const SECTION_TABS = [
  { key: 'price', label: '약가', icon: '💰' },
  { key: 'approvalReimbursement', label: '허가·보험', icon: '📋' },
  { key: 'competitors', label: '경쟁 오리지널', icon: '⚔️' },
  { key: 'generics', label: '제네릭', icon: '🏭' },
  { key: 'priceComparison', label: '가격 비교', icon: '⚖️' },
]

function TopBar({ activeSection, onSelect, color }) {
  return (
    <div className="product-switcher">
      <div className="product-switcher-heading">
        <div>
          <div className="product-switcher-label">정보 보기</div>
          <div className="product-switcher-hint">좌측에서 선택한 제품의 정보를 탐색하세요</div>
        </div>
        <div className="product-switcher-current" style={{ color }}>
          <span className="product-switcher-dot" style={{ background: color }} />
          제품 선택은 좌측 사이드바에서 합니다
        </div>
      </div>

      <div className="product-tabs section-tabs" role="tablist" aria-label="제품 정보 섹션">
        {SECTION_TABS.map(tab => {
          const active = activeSection === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tab.key)}
              className={`product-tab${active ? ' is-active' : ''}`}
              style={active ? { '--tab-color': color, '--tab-bg': `${color}18` } : {}}
            >
              <span className="product-tab-name">{tab.icon} {tab.label}</span>
              <span className="product-tab-meta">{active ? '현재 선택됨' : '열어보기'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionContent({ activeSection, drug, allDrugs, copayRate, setCopayRate, compareItems, onToggleCompare, onShowDiag }) {
  if (activeSection === 'priceComparison') return <PriceComparisonSection
    drug={drug}
    compareItems={compareItems}
  />

  if (activeSection === 'price') {
    return <PriceSection
      drug={drug}
      copayRate={copayRate}
      setCopayRate={setCopayRate}
      compareItems={compareItems}
      onToggleCompare={onToggleCompare}
    />
  }

  if (activeSection === 'approvalReimbursement') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ApprovalSection drug={drug} />
        <ReimbursementSection drug={drug} onShowDiag={onShowDiag} />
      </div>
    )
  }

  return <CompetitorSection
    key={`${drug.id}-${activeSection}`}
    drug={drug}
    allDrugs={allDrugs}
    copayRate={copayRate}
    setCopayRate={setCopayRate}
    compareItems={compareItems}
    onToggleCompare={onToggleCompare}
    mode={activeSection}
  />
}

function PriceComparisonSection({ drug, compareItems }) {
  return (
    <div className="comparison-only-panel">
      <div className="section-intro">
        <div>
          <div className="section-intro-title">⚖️ 선택 항목 가격 비교</div>
          <div className="section-intro-text">경쟁 오리지널 또는 제네릭 탭에서 선택한 항목만 비교합니다.</div>
        </div>
        <span className="section-intro-badge">기준 제품: {drug.name}</span>
      </div>
      {!compareItems.length && (
        <div className="comparison-empty-state">
          <div className="comparison-empty-icon">☑️</div>
          <strong>비교할 항목이 없습니다</strong>
          <span>경쟁 오리지널 또는 제네릭 탭에서 비교할 제품을 선택해 주세요.</span>
        </div>
      )}
    </div>
  )
}

function ReimbursementSection({ drug, onShowDiag }) {
  const criteria = Array.isArray(drug.reimbursementCriteria) ? drug.reimbursementCriteria : []

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
      }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>보험급여 기준</span>
        {drug.diagnosisCode && (
          <button
            onClick={onShowDiag}
            style={{
              marginLeft: 8,
              padding: '3px 10px',
              borderRadius: 12,
              border: `1px solid ${drug.color}`,
              background: drug.lightColor,
              color: drug.color,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📊 상병코드
          </button>
        )}
        <div style={{ marginLeft: 'auto', width: 32, height: 3, borderRadius: 2, background: drug.color }} />
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {criteria.map((section, si) => (
          <div key={si} style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{section.title}</span>
            </div>
            <div style={{ padding: '10px 14px' }}>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(section.items || []).map((item, ii) => (
                  <li key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: drug.color,
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
