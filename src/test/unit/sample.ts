// /* eslint-disable jest/expect-expect */
// describe('Example test to satisfy jest (to be removed from your app)', () => {
//   test('to be removed from your app', async () => {
//     // eslint-disable-line @typescript-eslint/no-empty-function
//   });
// });

import { expect } from 'chai';

describe('Task date formatting', () => {
  test('should correctly format future dates', () => {
    const futureDate = new Date('2025-12-31T23:59');
    const now = new Date('2025-01-01T00:00');

    const formatted = futureDate > now ? futureDate.toLocaleDateString('en-GB') : 'Overdue';

    expect(formatted).to.equal('31/12/2025');
  });

  test('should show overdue for past dates', () => {
    const pastDate = new Date('2023-12-31T23:59');
    const now = new Date('2025-01-01T00:00');

    const formatted = pastDate > now ? pastDate.toLocaleDateString('en-GB') : 'Overdue';

    expect(formatted).to.equal('Overdue');
  });
});
