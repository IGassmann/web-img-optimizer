import { test } from '@oclif/test'

jest.setTimeout(20_000)

describe('preload', () => {
  test.command(['preload', 'https://igassmann.me/work']).it('exits without error when successful')

  test
    .stdout()
    .command(['preload', 'https://igassmann.me/work'])
    .it('prints a preload tag when LCP is an image', (context) => {
      expect(context.stdout).toContain('\n<link rel="preload"')
    })

  test
    .stdout()
    .command(['preload', 'https://igassmann.me/'])
    .it('logs that there’s no image to preload.', (context) => {
      expect(context.stdout).toContain('No image to preload. The largest element isn’t an image.\n')
    })

  test.command(['preload']).exit(2).it('exits with status code 2 when no argument is passed')
})
