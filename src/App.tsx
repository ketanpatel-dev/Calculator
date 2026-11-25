import { useEffect, useRef, useState } from 'react'
import {
  Calculator, Sigma, Binary, ChartNoAxesColumnIncreasing, LineChart,
  Repeat2, FunctionSquare, Sun, Moon, History, Trash2, Search,
  RotateCcw, Minus, X, Divide,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { evaluate, type AngleUnit } from './calculator/engine'
import { compileFunction } from './calculator/graphing'
import { storage, type HistoryEntry } from './services/storage'
import './App.css'

type Mode = 'Standard' | 'Scientific' | 'Programmer' | 'Statistics' | 'Converter' | 'Graphing' | 'Solver'
const graphColors = ['#a78bfa', '#22d3ee', '#fb7185', '#34d399', '#fbbf24']

const modes: { name: Mode; icon: typeof Calculator }[] = [
  { name: 'Standard', icon: Calculator },
  { name: 'Scientific', icon: FunctionSquare },
  { name: 'Programmer', icon: Binary },
  { name: 'Statistics', icon: ChartNoAxesColumnIncreasing },
  { name: 'Converter', icon: Repeat2 },
  { name: 'Graphing', icon: LineChart },
  { name: 'Solver', icon: Sigma },
]

const standardKeys = [
  ['%', '(', ')', 'AC'], ['7', '8', '9', '÷'], ['4', '5', '6', '×'],
  ['1', '2', '3', '−'], ['±', '0', '.', '+'],
]

const scientificKeys = [
  ['sin', 'cos', 'tan', 'π'], ['asin', 'acos', 'atan', 'e'],
  ['ln', 'log10', 'log2', '10^'],
  ['sinh', 'cosh', 'tanh', 'e^'],
]

function App() {
  const [mode, setMode] = useState<Mode>('Standard')
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [angle, setAngle] = useState<AngleUnit>('DEG')
  const [theme, setTheme] = useState<'dark' | 'light'>(storage.theme())
  const [history, setHistory] = useState<HistoryEntry[]>(storage.history())
  const [memory, setMemory] = useState<string>(storage.memory())
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storage.saveTheme(theme)
  }, [theme])

  useEffect(() => {
    storage.saveMemory(memory)
  }, [memory])

  const input = (token: string) => {
    if (token === 'AC') {
      setExpression('')
      setResult('0')
      return
    }
    if (token === '±') {
      setExpression((value) => value.startsWith('-') ? value.slice(1) : `-${value}`)
      return
    }
    if (token === 'π') token = 'π'
    if (token === '10^') token = '10^('
    if (token === 'e^') token = 'exp('
    if (token === 'n!') token = 'factorial('
    if (token === 'nCr(') token = 'combinations('
    if (token === 'nPr(') token = 'permutations('
    if (token === '1/') token = '1/'
    if (token === 'mod(') token = 'mod('
    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log10', 'log2', 'abs', 'floor', 'ceil', 'round'].includes(token)) token += '('
    setExpression((value) => value + token)
  }

  const calculate = () => {
    if (!expression) return
    const evaluated = evaluate(expression, angle)
    setResult(evaluated)
    if (!evaluated.startsWith('Error')) {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        expression,
        result: evaluated,
        timestamp: Date.now(),
        mode,
      }
      const next = [entry, ...history].slice(0, 100)
      setHistory(next)
      storage.saveHistory(next)
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        calculate()
      } else if (event.key === 'Backspace') {
        setExpression((value) => value.slice(0, -1))
      } else if (event.key === 'Escape') {
        setExpression('')
        setResult('0')
      } else if (/^[0-9.+\-*/()%^]$/.test(event.key)) {
        setExpression((value) => value + event.key)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const memoryAction = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    if (action === 'MC') setMemory('0')
    if (action === 'MR') setExpression(memory)
    if (action === 'MS' && !result.startsWith('Error')) setMemory(result)
    if (action === 'M+' && !result.startsWith('Error')) setMemory(evaluate(`${memory}+(${result})`, angle))
    if (action === 'M-' && !result.startsWith('Error')) setMemory(evaluate(`${memory}-(${result})`, angle))
  }

  const filteredHistory = history.filter((entry) =>
    `${entry.expression} ${entry.result}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="brand">
          <div className="brand-mark"><Sigma size={22} /></div>
          {sidebarOpen && <span>NEXUS</span>}
        </div>
        <nav className="mode-nav" aria-label="Calculator modes">
          {modes.map(({ name, icon: Icon }) => (
            <button key={name} className={mode === name ? 'active' : ''} onClick={() => setMode(name)}>
              <Icon size={20} /><span>{name}</span>
            </button>
          ))}
        </nav>
        <button className="collapse-button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Universal Scientific</p>
            <h1>{mode} Calculator</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setHistoryOpen((value) => !value)} aria-label="History"><History size={19} /></button>
            <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <div className="content-grid">
          <section className="calculator-card">
                    {mode === 'Standard' && <StandardPanel expression={expression} result={result} input={input} calculate={calculate} memoryAction={memoryAction} />}
            {mode === 'Scientific' && (
              <ScientificPanel expression={expression} result={result} angle={angle} setAngle={setAngle}
                input={input} calculate={calculate} />
            )}
            {mode === 'Programmer' && <ProgrammerPanel />}
            {mode === 'Statistics' && <StatisticsPanel />}
            {mode === 'Converter' && <ConverterPanel />}
            {mode === 'Graphing' && <GraphingPanel angle={angle} setAngle={setAngle} />}
            {mode === 'Solver' && <SolverPanel />}
            {mode !== 'Graphing' && mode !== 'Standard' && mode !== 'Scientific' && null}
          </section>

          {historyOpen && (
            <aside className="history-panel">
              <div className="history-header">
                <h2>History</h2>
                <button className="icon-button" onClick={() => { setHistory([]); storage.saveHistory([]) }} aria-label="Clear history"><Trash2 size={16} /></button>
              </div>
              <label className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search calculations" /></label>
              <div className="history-list">
                {filteredHistory.map((entry) => (
                  <article key={entry.id} onClick={() => { setExpression(entry.expression); setResult(entry.result) }}>
                    <div><span>{entry.expression}</span><small>{new Date(entry.timestamp).toLocaleString()}</small></div>
                    <strong>{entry.result}</strong>
                    <button onClick={(event) => {
                      event.stopPropagation()
                      const next = history.filter((item) => item.id !== entry.id)
                      setHistory(next); storage.saveHistory(next)
                    }} aria-label="Delete entry"><Trash2 size={14} /></button>
                  </article>
                ))}
                {!filteredHistory.length && <p className="empty">No calculations yet</p>}
              </div>
            </aside>
          )}
        </div>
      </section>
    </main>
  )
}

interface PanelProps {
  expression: string
  result: string
  input: (token: string) => void
  calculate: () => void
}

function Display({ expression, result }: { expression: string; result: string }) {
  return (
    <div className="display">
      <div className="expression">{expression || '0'}</div>
      <div className="result">{result}</div>
    </div>
  )
}

function StandardPanel({ expression, result, input, calculate, memoryAction }: PanelProps & { memoryAction?: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void }) {
  return (
    <>
      <Display expression={expression} result={result} />
      <div className="utility-row">
        {[
          ['x²', '^2'], ['√x', 'sqrt('], ['x³', '^3'], ['1/x', '1/'],
          ['x!', 'n!'], ['|x|', 'abs('],
        ].map(([label, token]) => <button key={label} onClick={() => input(token)}>{label}</button>)}
      </div>
      <div className="memory-row">
        {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((key) => (
          <button key={key} onClick={() => memoryAction?.(key)}>{key}</button>
        ))}
      </div>
      <div className="keypad standard-keypad">
        {standardKeys.flat().map((key) => (
          <button key={key} className={`${['÷', '×', '−', '+'].includes(key) ? 'operator' : ''}`}
            onClick={() => input(key)}>
            {key === '÷' ? <Divide size={18} /> : key === '×' ? <X size={18} /> : key === '−' ? <Minus size={18} /> : key}
          </button>
        ))}
      </div>
      <button className="standard-equals" onClick={calculate}>=</button>
    </>
  )
}

interface ScientificProps extends PanelProps {
  angle: AngleUnit
  setAngle: (angle: AngleUnit) => void
}

function ScientificPanel({ expression, result, angle, setAngle, input, calculate }: ScientificProps) {
  return (
    <>
      <Display expression={expression} result={result} />
      <div className="science-toolbar">
        <button className={angle === 'DEG' ? 'active' : ''} onClick={() => setAngle('DEG')}>DEG</button>
        <button className={angle === 'RAD' ? 'active' : ''} onClick={() => setAngle('RAD')}>RAD</button>
        {['n!', 'nCr(', 'nPr(', 'GCD(', 'LCM(', 'mod(', 'abs(', '1/', '10^(', 'e^('].map((key) =>
          <button key={key} onClick={() => input(key)}>{key}</button>)}
      </div>
      <div className="keypad scientific-keypad">
        {scientificKeys.flat().map((key) => <button key={key} onClick={() => input(key)}>{key}</button>)}
        {['(', ')', '^', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '+', 'AC', '='].map((key) => (
          <button key={key} className={key === '=' ? 'equals' : ''} onClick={() => key === '=' ? calculate() : key === 'AC' ? input('AC') : input(key)}>{key}</button>
        ))}
      </div>
    </>
  )
}

function parseBaseInteger(value: string, base: number): bigint | null {
  const text = value.trim().toLowerCase()
  if (!text || base < 2 || base > 16) return null
  const negative = text.startsWith('-')
  const digits = negative || text.startsWith('+') ? text.slice(1) : text
  if (!digits) return null
  let result = 0n
  for (const character of digits) {
    const digit = Number.parseInt(character, 16)
    if (!Number.isInteger(digit) || digit >= base) return null
    result = result * BigInt(base) + BigInt(digit)
  }
  return negative ? -result : result
}

function ProgrammerPanel() {
  const [value, setValue] = useState('42')
  const [base, setBase] = useState(10)
  const [operation, setOperation] = useState('AND')
  const [operand, setOperand] = useState('15')

  const parsed = parseBaseInteger(value, base)
  const parsedOperand = parseBaseInteger(operand, base)
  let result = ''
  if (parsed !== null) {
    if (operation === 'AND' && parsedOperand !== null) result = String(parsed & parsedOperand)
    if (operation === 'OR' && parsedOperand !== null) result = String(parsed | parsedOperand)
    if (operation === 'XOR' && parsedOperand !== null) result = String(parsed ^ parsedOperand)
    if (operation === '<<' && parsedOperand !== null && parsedOperand >= 0n && parsedOperand <= 4096n) result = String(parsed << parsedOperand)
    if (operation === '>>' && parsedOperand !== null && parsedOperand >= 0n && parsedOperand <= 4096n) result = String(parsed >> parsedOperand)
  }

  return (
    <div className="feature-panel programmer">
      <div className="display"><div className="expression">Base {base}</div><div className="result">{value}</div></div>
      <div className="field-grid">
        {[
          ['BIN', 2, parsed], ['OCT', 8, parsed], ['DEC', 10, parsed], ['HEX', 16, parsed],
        ].map(([label, radix, number]) => (
          <button key={String(label)} className={base === radix ? 'active' : ''} onClick={() => {
            setBase(Number(radix))
            setValue(typeof number === 'bigint' ? number.toString(Number(radix)).toUpperCase() : '0')
          }}><span>{label}</span><strong>{typeof number === 'bigint' ? number.toString(Number(radix)).toUpperCase() : '—'}</strong></button>
        ))}
      </div>
      <label>Value<input value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <div className="operation-row">
        {['AND', 'OR', 'XOR', 'NOT', '<<', '>>'].map((name) => <button key={name} className={operation === name ? 'active' : ''} onClick={() => setOperation(name)}>{name}</button>)}
      </div>
      {operation !== 'NOT' && <label>Operand<input value={operand} onChange={(event) => setOperand(event.target.value)} /></label>}
      <div className="answer-box"><small>Result</small><strong>{operation === 'NOT' && parsed !== null ? (~parsed).toString(10) : result || 'Invalid input'}</strong></div>
    </div>
  )
}

function StatisticsPanel() {
  const [input, setInput] = useState('12, 18, 24, 24, 30')
  const values = input.split(/[,\s]+/).map(Number).filter(Number.isFinite)
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = values.length ? sum / values.length : 0
  const sorted = [...values].sort((a, b) => a - b)
  const median = values.length ? (values.length % 2 ? sorted[Math.floor(values.length / 2)]
    : (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2) : 0
  const variance = values.length ? values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length : 0
  const frequency = new Map<number, number>()
  values.forEach((value) => frequency.set(value, (frequency.get(value) || 0) + 1))
  const maxFrequency = Math.max(0, ...frequency.values())
  const modeValues = maxFrequency ? [...frequency].filter(([, count]) => count === maxFrequency).map(([value]) => value).join(', ') : '—'
  const stats = [
    ['Count', values.length], ['Sum', sum], ['Mean', mean], ['Median', median],
    ['Mode', modeValues], ['Variance', variance], ['Std Dev', Math.sqrt(variance)],
    ['Minimum', values.length ? sorted[0] : '—'], ['Maximum', values.length ? sorted.at(-1) : '—'],
  ]
  return (
    <div className="feature-panel">
      <label className="wide-field">Data values<input value={input} onChange={(event) => setInput(event.target.value)} /></label>
      <div className="stats-grid">{stats.map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{typeof value === 'number' ? Number(value.toPrecision?.(10) ?? value) : value}</strong></div>)}</div>
    </div>
  )
}

const conversionGroups: Record<string, Record<string, number>> = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.344 },
  Weight: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 },
  Area: { 'm²': 1, 'km²': 1000000, 'ft²': 0.09290304, acre: 4046.8564224 },
  Volume: { 'm³': 1, L: 0.001, mL: 0.000001, gal: 0.003785411784 },
  Speed: { 'm/s': 1, 'km/h': 0.2777777778, mph: 0.44704, knot: 0.5144444444 },
  Time: { s: 1, min: 60, h: 3600, day: 86400 },
  'Data storage': { byte: 1, KB: 1000, MB: 1000000, GB: 1000000000 },
  Pressure: { Pa: 1, kPa: 1000, bar: 100000, psi: 6894.757293168 },
  Energy: { J: 1, kJ: 1000, cal: 4.184, kWh: 3600000 },
  Power: { W: 1, kW: 1000, hp: 745.6998715823 },
  Angle: { deg: 1, rad: 180 / Math.PI, grad: 0.9 },
}

function ConverterPanel() {
  const [group, setGroup] = useState('Length')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('ft')
  const [value, setValue] = useState('1')
  const units = conversionGroups[group]
  const keys = Object.keys(units)
  const convert = () => {
    if (group === 'Temperature') return 0
    return (Number(value) * units[from]) / units[to]
  }
  return (
    <div className="feature-panel converter">
      <label>Category<select value={group} onChange={(event) => {
        const next = event.target.value
        setGroup(next)
        if (next !== 'Temperature') {
          const nextKeys = Object.keys(conversionGroups[next])
          setFrom(nextKeys[0]); setTo(nextKeys[1])
        }
      }}>{[...Object.keys(conversionGroups), 'Temperature'].map((name) => <option key={name}>{name}</option>)}</select></label>
      {group === 'Temperature' ? <TemperatureConverter /> : (
        <>
          <div className="convert-row">
            <label>From<select value={from} onChange={(event) => setFrom(event.target.value)}>{keys.map((key) => <option key={key}>{key}</option>)}</select></label>
            <label>Value<input type="number" value={value} onChange={(event) => setValue(event.target.value)} /></label>
            <label>To<select value={to} onChange={(event) => setTo(event.target.value)}>{keys.map((key) => <option key={key}>{key}</option>)}</select></label>
          </div>
          <div className="answer-box"><small>{value} {from} equals</small><strong>{Number.isFinite(convert()) ? convert().toPrecision(12) : 'Invalid'} {to}</strong></div>
        </>
      )}
    </div>
  )
}

function TemperatureConverter() {
  const [value, setValue] = useState('25')
  const [from, setFrom] = useState('C')
  const [to, setTo] = useState('F')
  const toC = (n: number) => from === 'C' ? n : from === 'F' ? (n - 32) * 5 / 9 : n - 273.15
  const fromC = (n: number) => to === 'C' ? n : to === 'F' ? n * 9 / 5 + 32 : n + 273.15
  const answer = fromC(toC(Number(value)))
  return (
    <>
      <div className="convert-row">
        <label>From<select value={from} onChange={(event) => setFrom(event.target.value)}>{['C', 'F', 'K'].map((key) => <option key={key}>{key}</option>)}</select></label>
        <label>Value<input type="number" value={value} onChange={(event) => setValue(event.target.value)} /></label>
        <label>To<select value={to} onChange={(event) => setTo(event.target.value)}>{['C', 'F', 'K'].map((key) => <option key={key}>{key}</option>)}</select></label>
      </div>
      <div className="answer-box"><small>Converted result</small><strong>{Number.isFinite(answer) ? answer.toFixed(6) : 'Invalid'} {to}</strong></div>
    </>
  )
}

function GraphingPanel({ angle, setAngle }: { angle: AngleUnit; setAngle: (angle: AngleUnit) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [expressions, setExpressions] = useState(['x^2', 'sin(x)', 'cos(x)'])
  const [draft, setDraft] = useState('')
  const [zoom, setZoom] = useState(44)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [coordinate, setCoordinate] = useState('x: 0, y: 0')
  const [canvasRevision, setCanvasRevision] = useState(0)
  const [colorIndexes, setColorIndexes] = useState([0, 1, 2])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => setCanvasRevision((revision) => revision + 1))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const cx = rect.width / 2 + offset.x
    const cy = rect.height / 2 + offset.y
    ctx.lineWidth = 1
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim()
    for (let x = cx % zoom; x < rect.width; x += zoom) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke()
    }
    for (let y = cy % zoom; y < rect.height; y += zoom) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke()
    }
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--axis').trim()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, rect.height); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(rect.width, cy); ctx.stroke()

    expressions.forEach((expression, index) => {
      try {
        const fn = compileFunction(expression, angle)
        ctx.beginPath()
        ctx.strokeStyle = graphColors[colorIndexes[index] % graphColors.length]
        ctx.lineWidth = 2.5
        let drawing = false
        for (let px = 0; px <= rect.width; px++) {
          const x = (px - cx) / zoom
          const y = fn(x)
          const py = cy - y * zoom
          if (Number.isFinite(py) && py > -rect.height * 2 && py < rect.height * 3) {
            if (!drawing) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
            drawing = true
          } else {
            drawing = false
          }
        }
        ctx.stroke()
      } catch {
        // Invalid graph expressions are ignored in the canvas.
      }
    })
  }, [expressions, zoom, offset, angle, canvasRevision, colorIndexes])

  const pointerCoordinates = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const cx = rect.width / 2 + offset.x
    const cy = rect.height / 2 + offset.y
    const x = (event.clientX - rect.left - cx) / zoom
    const y = (cy - (event.clientY - rect.top)) / zoom
    setCoordinate(`x: ${x.toFixed(3)}, y: ${y.toFixed(3)}`)
  }

  return (
    <div className="graph-panel">
      <div className="graph-controls">
        <div className="function-list">
          {expressions.map((expression, index) => (
            <div key={`${expression}-${index}`}><button className="graph-color" style={{ background: graphColors[colorIndexes[index] % graphColors.length] }} aria-label="Change graph color" onClick={() => setColorIndexes((values) => values.map((value, i) => i === index ? (value + 1) % graphColors.length : value))} /><span>y =</span><input value={expression} onChange={(event) => setExpressions((values) => values.map((value, i) => i === index ? event.target.value : value))} /><button onClick={() => {
              setExpressions((values) => values.filter((_, i) => i !== index))
              setColorIndexes((values) => values.filter((_, i) => i !== index))
            }} aria-label="Remove graph"><Trash2 size={14} /></button></div>
          ))}
          <div><i style={{ background: '#64748b' }} /><span>y =</span><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add function" onKeyDown={(event) => {
            if (event.key === 'Enter' && draft.trim()) {
              setExpressions((values) => [...values, draft.trim()])
              setColorIndexes((values) => [...values, values.length % graphColors.length])
              setDraft('')
            }
          }} /></div>
        </div>
        <div className="graph-actions">
          <button onClick={() => setAngle(angle === 'DEG' ? 'RAD' : 'DEG')}>{angle}</button>
          <button onClick={() => setZoom((value) => Math.min(120, value * 1.2))}>+</button>
          <button onClick={() => setZoom((value) => Math.max(15, value / 1.2))}>−</button>
          <button onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(44) }}><RotateCcw size={16} /></button>
        </div>
      </div>
      <div className="canvas-wrap"
        onPointerMove={(event) => {
          const target = event.currentTarget.querySelector('canvas') as HTMLCanvasElement | null
          if (target) {
            const rect = target.getBoundingClientRect()
            const cx = rect.width / 2 + offset.x
            const cy = rect.height / 2 + offset.y
            const x = (event.clientX - rect.left - cx) / zoom
            const y = (cy - (event.clientY - rect.top)) / zoom
            setCoordinate(`x: ${x.toFixed(3)}, y: ${y.toFixed(3)}`)
          }
        }}
        onPointerDown={(event) => setDrag({ x: event.clientX - offset.x, y: event.clientY - offset.y })}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}>
        <canvas ref={canvasRef}
          onPointerMove={(event) => {
            pointerCoordinates(event)
            if (drag) setOffset({ x: event.clientX - drag.x, y: event.clientY - drag.y })
          }}
          onWheel={(event) => {
            event.preventDefault()
            setZoom((value) => Math.max(15, Math.min(120, value * (event.deltaY > 0 ? 0.9 : 1.1))))
          }} />
        <span className="coordinate-readout">{coordinate}</span>
      </div>
    </div>
  )
}

function SolverPanel() {
  const [kind, setKind] = useState<'Quadratic' | 'Linear' | 'Simultaneous'>('Quadratic')
  const [a, setA] = useState('1')
  const [b, setB] = useState('-5')
  const [c, setC] = useState('6')
  const [d, setD] = useState('2')
  const [e, setE] = useState('3')
  const [f, setF] = useState('12')

  const quadratic = () => {
    const av = Number(a), bv = Number(b), cv = Number(c)
    if (!Number.isFinite(av) || av === 0) return ['Invalid: a must be non-zero']
    const discriminant = bv * bv - 4 * av * cv
    if (discriminant > 0) {
      return [`x₁ = ${((-bv + Math.sqrt(discriminant)) / (2 * av)).toPrecision(10)}`, `x₂ = ${((-bv - Math.sqrt(discriminant)) / (2 * av)).toPrecision(10)}`]
    }
    if (discriminant === 0) return [`x = ${(-bv / (2 * av)).toPrecision(10)} (repeated root)`]
    const real = -bv / (2 * av)
    const imaginary = Math.sqrt(-discriminant) / (2 * av)
    return [`x₁ = ${real.toPrecision(10)} + ${imaginary.toPrecision(10)}i`, `x₂ = ${real.toPrecision(10)} - ${imaginary.toPrecision(10)}i`]
  }

  const simultaneous = () => {
    const av = Number(a), bv = Number(b), cv = Number(c), dv = Number(d), ev = Number(e), fv = Number(f)
    const determinant = av * ev - bv * dv
    if (determinant === 0) return ['No unique solution']
    return [`x = ${((cv * ev - bv * fv) / determinant).toPrecision(10)}`, `y = ${((av * fv - cv * dv) / determinant).toPrecision(10)}`]
  }

  return (
    <div className="feature-panel solver">
      <div className="operation-row">{(['Linear', 'Quadratic', 'Simultaneous'] as const).map((name) => <button key={name} className={kind === name ? 'active' : ''} onClick={() => setKind(name)}>{name}</button>)}</div>
      {kind === 'Quadratic' && (
        <>
          <p className="equation">ax² + bx + c = 0</p>
          <div className="coefficients"><label>a<input value={a} onChange={(e) => setA(e.target.value)} /></label><label>b<input value={b} onChange={(e) => setB(e.target.value)} /></label><label>c<input value={c} onChange={(e) => setC(e.target.value)} /></label></div>
          <div className="steps">{quadratic().map((step) => <div key={step}>{step}</div>)}</div>
        </>
      )}
      {kind === 'Linear' && (
        <>
          <p className="equation">ax + b = c</p>
          <div className="coefficients"><label>a<input value={a} onChange={(e) => setA(e.target.value)} /></label><label>b<input value={b} onChange={(e) => setB(e.target.value)} /></label><label>c<input value={c} onChange={(e) => setC(e.target.value)} /></label></div>
          <div className="answer-box"><small>Solution</small><strong>{Number(a) === 0 ? 'No unique solution' : `x = ${((Number(c) - Number(b)) / Number(a)).toPrecision(10)}`}</strong></div>
        </>
      )}
      {kind === 'Simultaneous' && (
        <>
          <p className="equation">ax + by = c<br />dx + ey = f</p>
          <div className="coefficients">
            <label>a<input value={a} onChange={(e) => setA(e.target.value)} /></label><label>b<input value={b} onChange={(e) => setB(e.target.value)} /></label><label>c<input value={c} onChange={(e) => setC(e.target.value)} /></label>
            <label>d<input value={d} onChange={(e) => setD(e.target.value)} /></label><label>e<input value={e} onChange={(e) => setE(e.target.value)} /></label><label>f<input value={f} onChange={(e) => setF(e.target.value)} /></label>
          </div>
          <div className="steps">{simultaneous().map((step) => <div key={step}>{step}</div>)}</div>
        </>
      )}
    </div>
  )
}

export default App
