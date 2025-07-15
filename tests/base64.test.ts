import { describe, it, expect } from 'vitest';
import { arrayBufferToBase64 } from '../services/base64';

function createLargeBuffer(size: number): ArrayBuffer {
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    view[i] = i % 256;
  }
  return buffer;
}

describe('arrayBufferToBase64', () => {
  it('handles large buffers', () => {
    const buffer = createLargeBuffer(200000);
    const expected = Buffer.from(new Uint8Array(buffer)).toString('base64');
    const actual = arrayBufferToBase64(buffer);
    expect(actual).toBe(expected);
  });
});
