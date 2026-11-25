import { create, all } from 'mathjs'
import type { BigNumber } from 'mathjs'

export type AngleUnit = 'DEG' | 'RAD'

const DISPLAY_PRECISION = 256
const math = create(all, { number: 'BigNumber', precision: DISPLAY_PRECISION })

const safeExpression = (expression: string) => {
  const cleaned = expression
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('π', 'pi')
    .replaceAll('φ', 'phi')
    .replaceAll('√', 'sqrt(')
  return cleaned
}

export function evaluate(expression: string, angleUnit: AngleUnit = 'RAD'): string {
  if (!expression.trim()) return ''
  try {
    const degreesToRadians = (x: number | BigNumber) =>
      math.divide(math.multiply(x as never, math.pi as never), 180) as never
    const radiansToDegrees = (x: unknown) =>
      math.divide(math.multiply(x as never, 180), math.pi) as never
    const scope: Record<string, unknown> = {
      sin: (x: number | BigNumber) => angleUnit === 'DEG'
        ? math.sin(degreesToRadians(x))
        : math.sin(x as never),
      cos: (x: number | BigNumber) => angleUnit === 'DEG'
        ? math.cos(degreesToRadians(x))
        : math.cos(x as never),
      tan: (x: number | BigNumber) => angleUnit === 'DEG'
        ? math.tan(degreesToRadians(x))
        : math.tan(x as never),
      asin: (x: number | BigNumber) => {
        const value = math.asin(x as never)
        return angleUnit === 'DEG' ? radiansToDegrees(value) : value
      },
      acos: (x: number | BigNumber) => {
        const value = math.acos(x as never)
        return angleUnit === 'DEG' ? radiansToDegrees(value) : value
      },
      atan: (x: number | BigNumber) => {
        const value = math.atan(x as never)
        return angleUnit === 'DEG' ? radiansToDegrees(value) : value
      },
      sinh: math.sinh,
      cosh: math.cosh,
      tanh: math.tanh,
      asinh: math.asinh,
      acosh: math.acosh,
      atanh: math.atanh,
      log10: math.log10,
      ln: math.log,
      log2: (x: number | BigNumber) => math.divide(math.log(x as never), math.log(2)),
      combinations: math.combinations,
      permutations: math.permutations,
      factorial: math.factorial,
      mod: math.mod,
      floor: math.floor,
      ceil: math.ceil,
      round: math.round,
      abs: math.abs,
      phi: math.phi,
      gcd: math.gcd,
      lcm: math.lcm,
      random: () => Math.random(),
    }
    const cleaned = safeExpression(expression)
    if (!/^[0-9+\-*/%^().,\sA-Za-zπ!]*$/.test(cleaned)) throw new Error('Invalid expression')
    const functions = new Set([
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
      'asinh', 'acosh', 'atanh', 'log', 'log10', 'log2', 'ln', 'sqrt',
      'abs', 'floor', 'ceil', 'round', 'gcd', 'lcm', 'combinations',
      'permutations', 'factorial', 'mod', 'random', 'exp',
    ])
    const constants = new Set(['pi', 'e', 'phi', 'i'])
    const identifiers = cleaned.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
    for (const identifier of identifiers) {
      const position = cleaned.indexOf(identifier) + identifier.length
      const isCall = cleaned.slice(position).trimStart().startsWith('(')
      if (isCall ? !functions.has(identifier) : !constants.has(identifier) && !functions.has(identifier)) {
        throw new Error(`Unknown ${isCall ? 'function' : 'symbol'}: ${identifier}`)
      }
    }
    const result = math.evaluate(cleaned, scope)
    const formatted = typeof result === 'string'
      ? result
      : math.format(result, { precision: DISPLAY_PRECISION, lowerExp: -12, upperExp: 18 })
    return formatted
  } catch (error) {
    return error instanceof Error ? `Error: ${error.message}` : 'Error: Invalid expression'
  }
}

