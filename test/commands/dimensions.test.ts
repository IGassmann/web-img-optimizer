import { test } from '@oclif/test';

describe('dimensions', () => {
  test.command(['dimensions']).exit(2).it('exits with status 2 when no argument is passed');
});
