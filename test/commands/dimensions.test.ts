import { test } from '@oclif/test';

describe('dimensions', () => {
  test.command(['dimensions', 'https://igassmann.me/']).it('Exits without error when successful');

  test.command(['dimensions']).exit(2).it('Exits with status code 2 when no argument is passed');
});
