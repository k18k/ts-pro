import { text } from 'node:stream/consumers'

const isObject = (value: unknown) => typeof value === 'object' && value !== null

export const readHookInput = async () => {
  const hookInput: unknown = JSON.parse(await text(process.stdin))
  return hookInput
}

// Hook input looks like { tool_name, tool_input: { command | file_path, ... } }.
export const readToolInputString = ({ hookInput, field }: { hookInput: unknown; field: string }) => {
  if (!isObject(hookInput)) return undefined
  const toolInput: unknown = Reflect.get(hookInput, 'tool_input')
  if (!isObject(toolInput)) return undefined
  const value: unknown = Reflect.get(toolInput, field)
  return typeof value === 'string' ? value : undefined
}
