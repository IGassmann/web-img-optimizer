import { test } from '@oclif/test';

jest.setTimeout(10_000);

describe('optimize', () => {
  test.command(['optimize', 'https://igassmann.me/']).it('exits without error when successful');

  test
    .stdout()
    .command(['optimize', 'https://igassmann.me/'])
    .it('prints the location of optimized images', (context) => {
      expect(context.stdout).toContain('Optimized images available at:');
    });

  test
    .stdout()
    .command(['optimize', 'https://perdu.com//'])
    .it('logs that there’s no image to optimize.', (context) => {
      expect(context.stdout).toBe('This page contains no image.\n');
    });

  test.command(['optimize']).exit(2).it('exits with status code 2 when no argument is passed');
});
