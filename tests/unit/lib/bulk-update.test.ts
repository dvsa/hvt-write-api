import { parsePayload } from '../../../src/lib/bulk-update';

describe('parsePayload()', () => {
  it('should parse a payload as expected', () => {
    const expected = [
      {
        id: '7a6b0cf7-7a79-43be-9e9f-bac71b22a3b5',
        update: {
          a: 1,
          b: 'c',
        },
      },
    ];
    const requestBody = JSON.stringify(expected);

    const result = parsePayload(requestBody);

    expect(result).toEqual(expected);
  });

  it('throws if payload contains invalid JSON', () => {
    const requestBody = 'asdf1234!@£$';

    const t = () => {
      parsePayload(requestBody);
    };

    expect(t).toThrow(Error);
  });

  it('throws if payload is not in the expected format', () => {
    const requestBody = JSON.stringify([
      {
        // id: 'some-id',
        update: {
          a: 'b',
        },
      },
    ]);

    const t = () => {
      parsePayload(requestBody);
    };

    expect(t).toThrow(Error);
  });
});
