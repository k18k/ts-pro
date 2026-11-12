import { expect, test } from 'claude-code/testing'

// Run by `claude plugin test .`, not by node --test: the band draws through the engine.
const band = {
  plugin: 'ts-pro',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 10 },
  },
} as const

test('a press writes the setting and redraws the band', async ($, on) => {
  const written: { key: string; value: unknown }[] = []
  on('config.set', (_, e) => {
    written.push({ key: e.key, value: e.value })
    return { value: e.value }
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...band, surface })
    await ui.press({ key: 'git-commit' })
    await ui.press({ key: 'write-tests' })

    expect(written.splice(0)).toEqual([
      { key: 'ts-pro.git_level', value: 'commit' },
      { key: 'ts-pro.write_tests', value: false },
    ])
    expect((await ui.find({ key: 'write-tests' }))?.text).toBe('tests off')

    await ui.press({ key: 'write-tests' })
    await ui.press({ key: 'git-changes' })
    written.splice(0)
    await ui.unmount()
  }
})

test('a refused setting leaves the band as it was', async ($, on) => {
  on('config.set', () => ({ deny: 'locked by policy' }))
  on('ui.toast', () => ({ value: undefined }))

  const ui = await $.ui.mount({ ...band, surface: 'terminal' })
  await ui.press({ key: 'pause-staging' })

  expect((await ui.find({ key: 'pause-staging' }))?.text).toBe('pause staging')
  await ui.unmount()
})

test('the band is not drawn when it is switched off', { options: { band: false } }, async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...band, surface: 'terminal' })

  expect(await ui.find({ key: 'git-commit' })).toBeUndefined()
  await ui.unmount()
})
