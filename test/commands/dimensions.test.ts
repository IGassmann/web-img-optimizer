import { test } from '@oclif/test'

jest.setTimeout(20_000)

describe('dimensions', () => {
  test.command(['dimensions', 'https://igassmann.me/']).it('exits without error when successful')

  test
    .stdout()
    .command(['dimensions', 'https://igassmann.me/'])
    .it('shows image dimensions when page contains images', (context) => {
      expect(context.stdout).toContain('───── ────── ───────')
    })

  test
    .stdout()
    .command(['dimensions', 'https://perdu.com/'])
    .it('logs that there is no image', (context) => {
      expect(context.stdout).toContain('This page contains no image.\n')
    })

  test.command(['dimensions']).exit(2).it('exits with status code 2 when no argument is passed')
})
