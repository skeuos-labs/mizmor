import type { FormatId } from './registry.js';

function containsAscii(bytes: Uint8Array, needle: string): boolean {
  const target = new TextEncoder().encode(needle);
  if (bytes.byteLength < target.byteLength) return false;

  // Search first 64KB
  const headLimit = Math.min(bytes.byteLength, 65536);
  for (let i = 0; i <= headLimit - target.byteLength; i++) {
    let match = true;
    for (let j = 0; j < target.byteLength; j++) {
      if (bytes[i + j] !== target[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  // Search tail 64KB (central directory)
  if (bytes.byteLength > 65536) {
    const start = Math.max(0, bytes.byteLength - 65536);
    for (let i = start; i <= bytes.byteLength - target.byteLength; i++) {
      let match = true;
      for (let j = 0; j < target.byteLength; j++) {
        if (bytes[i + j] !== target[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  return false;
}

/**
 * Detects format of an input presentation file by filename extension
 * or magic byte sniffing.
 */
export function detectFormat(
  fileName: string,
  bytes: Uint8Array
): FormatId | undefined {
  // 1. Checks file extension first (case-insensitive)
  if (fileName) {
    const extMatch = /\.([a-z0-9]+)$/i.exec(fileName.trim());
    if (extMatch) {
      const ext = extMatch[1]!.toLowerCase();
      switch (ext) {
        case 'pro':
          return 'pro';
        case 'pro6':
          return 'pro6';
        case 'vpc':
          return 'vpc';
        case 'json':
          return 'json';
        case 'show':
          return 'freeshow';
        case 'txt':
          return 'txt';
        case 'pptx':
          return 'pptx';
      }
    }
  }

  // 2. Sniffs magic bytes
  const isBytes = bytes instanceof Uint8Array || ArrayBuffer.isView(bytes);
  if (!bytes || !isBytes || bytes.byteLength === 0) {
    return undefined;
  }
  const rawView = bytes as unknown as ArrayBufferView;
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(rawView.buffer, rawView.byteOffset, rawView.byteLength);

  // 0x0a: .pro (Protobuf tag 1)
  if (u8[0] === 0x0a) {
    return 'pro';
  }

  // 0x50, 0x4b ('PK'): ZIP file
  if (u8[0] === 0x50 && u8[1] === 0x4b) {
    if (
      containsAscii(u8, '[Content_Types].xml') ||
      containsAscii(u8, 'ppt/')
    ) {
      return 'pptx';
    }
    if (containsAscii(u8, 'show.json')) {
      return 'freeshow';
    }
    // Fallback for ZIP archive (VideoPsalm VPC archive)
    return 'vpc';
  }

  // First non-whitespace '{' or '[': .json or .show
  let firstNonWs: number | undefined;
  let firstIdx = -1;
  const scanLimit = Math.min(u8.byteLength, 1024);
  for (let i = 0; i < scanLimit; i++) {
    const b = u8[i]!;
    if (b !== 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) {
      firstNonWs = b;
      firstIdx = i;
      break;
    }
  }

  if (firstNonWs === 0x7b /* { */ || firstNonWs === 0x5b /* [ */) {
    const sample = new TextDecoder('utf-8', { fatal: false }).decode(
      u8.subarray(firstIdx, Math.min(u8.byteLength, firstIdx + 2048))
    );
    if (
      sample.includes('"presentations"') ||
      sample.includes('"groups"') ||
      sample.includes('"category"') ||
      sample.includes('"layouts"') ||
      sample.includes('"activeLayout"')
    ) {
      return 'freeshow';
    }
    return 'json';
  }

  // ProPresenter 6 XML sniffing
  if (containsAscii(u8, 'RVPresentationDocument')) {
    return 'pro6';
  }

  return undefined;
}
