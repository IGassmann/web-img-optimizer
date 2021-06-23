import {expect, test} from '@oclif/test'

describe('dimensions', () => {
  test
  .command(['dimensions'])
  .exit(22)
  .it('exits with status 22 when no argument is passed')
})
