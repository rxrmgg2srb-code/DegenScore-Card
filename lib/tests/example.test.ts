import { add } from '../lib/example';

describe('add', () => {
  it('suma correctamente dos números', () => {
    expect(add(2, 3)).toBe(5);
  });
});
