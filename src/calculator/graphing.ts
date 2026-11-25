import { create, all } from 'mathjs'
import type { AngleUnit } from './engine'

const math = create(all)

export function compileFunction(expression: string, angleUnit: AngleUnit) {
  const normalized = expression
    .replaceAll('π', 'pi')
    .replace(/\^/g, '^')
    .replace(/\by\s*=/i, '')
    .replace(/^=\s*/, '')
  const node = math.parse(normalized)
  const allowedFunctions = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'sqrt', 'abs', 'log', 'log10', 'log2', 'ln', 'exp', 'floor', 'ceil',
  ])
  const identifiers = normalized.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
  for (const identifier of identifiers) {
    const position = normalized.indexOf(identifier) + identifier.length
    const isCall = normalized.slice(position).trimStart().startsWith('(')
    if (identifier !== 'x' && identifier !== 'pi' && identifier !== 'e' &&
      !(isCall && allowedFunctions.has(identifier))) {
      throw new Error(`Unknown graph symbol: ${identifier}`)
    }
  }
  const fn = node.compile()
  return (x: number) => {
    const toRadians = (value: number) => angleUnit === 'DEG' ? value * Math.PI / 180 : value
    const fromRadians = (value: number) => angleUnit === 'DEG' ? value * 180 / Math.PI : value
    const value = fn.evaluate({
      x,
      sin: (value: number) => Math.sin(toRadians(value)),
      cos: (value: number) => Math.cos(toRadians(value)),
      tan: (value: number) => Math.tan(toRadians(value)),
      asin: (value: number) => fromRadians(Math.asin(value)),
      acos: (value: number) => fromRadians(Math.acos(value)),
      atan: (value: number) => fromRadians(Math.atan(value)),
    })
    return typeof value === 'number' ? value : Number(value)
  }
}
