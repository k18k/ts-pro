// Catches a security control being weakened to make an error go away. Pattern matching is a
// guard rail, not a sandbox: the rule and the reviewer cover what it cannot see.

const exceptionMarker = 'ts-pro-exception:'
const authMiddleware = /\brequire\w*(auth|login|role|permission|user|session)\w*\b|\bauthenticate\b|\bauthori[sz]e\b/i
const clientPath = /(^|\/)(client|browser|public|frontend|components)\//i

// 7{3} rather than the literal digits, so this file does not trip its own gate.
const textPatterns = [
  { name: 'TLS verification turned off', pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED['"\]]*\s*[=:]\s*['"]?0/ },
  { name: 'row level security turned off', pattern: /disable\s+row\s+level\s+security/i },
  { name: 'policy that allows every row', pattern: /\b(using|with\s+check)\s*\(\s*true\s*\)/i },
  { name: 'schema that lets unknown fields through', pattern: /\.passthrough\(\)/ },
  { name: 'world-writable permissions', pattern: /\bchmod\s+(-\w+\s+)*0?7{3}\b|\b0o7{3}\b/ },
]

const commandPatterns = [
  { name: 'TLS verification turned off', pattern: /\bNODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/ },
  { name: 'curl without certificate checks', pattern: /\bcurl\b[^|;&]*\s(-[a-zA-Z]*k[a-zA-Z]*|--insecure)\b/ },
  { name: 'git hooks skipped', pattern: /\bgit\b[^|;&]*\s--no-verify\b/ },
  { name: 'world-writable permissions', pattern: /\bchmod\s+(-\w+\s+)*0?7{3}\b/ },
]

const unmarkedLines = ({ text }: { text: string }) => text.split('\n').filter((line) => !line.includes(exceptionMarker))

const findPatterns = ({ text, patterns }: { text: string; patterns: typeof textPatterns }) => {
  const lines = unmarkedLines({ text })
  return patterns.filter(({ pattern }) => lines.some((line) => pattern.test(line))).map(({ name }) => name)
}

const isCorsOpenWithCredentials = ({ text }: { text: string }) => {
  const lines = unmarkedLines({ text }).join('\n')
  return /origin\s*:\s*(['"]\*['"]|true\b)/.test(lines) && /credentials\s*:\s*true\b/.test(lines)
}

const isServiceRoleInClientCode = ({ filePath, text }: { filePath: string; text: string }) =>
  (clientPath.test(filePath) || /\.(tsx|jsx)$/.test(filePath)) &&
  unmarkedLines({ text }).some((line) => /service_role/i.test(line))

// Best effort: the replaced text had an auth check and the new text has none.
const isAuthMiddlewareRemoved = ({ removedText, addedText }: { removedText: string; addedText: string }) =>
  authMiddleware.test(removedText) && !authMiddleware.test(addedText)

const explainBlock = ({ found }: { found: string[] }) => ({
  isAllowed: false,
  reason: `ts-pro: this weakens a security control (${found.join(', ')}). The error it would silence is information: find out why the control fired. If the control itself is wrong, ask the developer; if they agree, mark the line with \`// ts-pro-exception: <reason>\`.`,
})

export const decideFileControlGate = ({
  filePath,
  addedText,
  removedText,
}: {
  filePath: string
  addedText: string
  removedText: string
}) => {
  // Docs and rules quote these patterns to warn against them.
  if (filePath.endsWith('.md')) return { isAllowed: true, reason: '' }
  const found = [
    ...findPatterns({ text: addedText, patterns: textPatterns }),
    ...(isCorsOpenWithCredentials({ text: addedText }) ? ['CORS open to every origin with credentials'] : []),
    ...(isServiceRoleInClientCode({ filePath, text: addedText }) ? ['service_role key in client code'] : []),
    ...(isAuthMiddlewareRemoved({ removedText, addedText }) ? ['auth or permission check removed'] : []),
  ]
  return found.length > 0 ? explainBlock({ found }) : { isAllowed: true, reason: '' }
}

export const decideCommandControlGate = ({ command }: { command: string }) => {
  const found = findPatterns({ text: command, patterns: commandPatterns })
  return found.length > 0 ? explainBlock({ found }) : { isAllowed: true, reason: '' }
}
