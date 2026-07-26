// Shared bit-level tables for the generator and the technique rater. Digits
// 1..9 live in bits 0..8 of a 9-bit mask throughout.

export const ALL_DIGITS = 0x1ff;

/** Box index (0..8) for each of the 81 cells. */
export const BOX_OF = new Uint8Array(81);
for (let i = 0; i < 81; i++) {
  BOX_OF[i] = ((i / 27) | 0) * 3 + (((i % 9) / 3) | 0);
}

/** Population count for every 9-bit candidate mask. */
export const POPCOUNT = new Uint8Array(512);
for (let m = 1; m < 512; m++) {
  POPCOUNT[m] = POPCOUNT[m >> 1] + (m & 1);
}

/**
 * The 27 units as flat runs of 9 cell indices: rows 0..8, then columns 9..17,
 * then boxes 18..26. Unit `u` occupies UNITS[u * 9 .. u * 9 + 8].
 */
export const UNITS = new Uint8Array(27 * 9);
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) UNITS[r * 9 + c] = r * 9 + c;
}
for (let c = 0; c < 9; c++) {
  for (let r = 0; r < 9; r++) UNITS[(9 + c) * 9 + r] = r * 9 + c;
}
for (let b = 0; b < 9; b++) {
  const base = ((b / 3) | 0) * 27 + (b % 3) * 3;
  for (let k = 0; k < 9; k++) UNITS[(18 + b) * 9 + k] = base + ((k / 3) | 0) * 9 + (k % 3);
}

/** The 20 cells sharing a row, column or box with each cell. */
export const PEERS = new Uint8Array(81 * 20);
{
  const seen = new Uint8Array(81);
  for (let i = 0; i < 81; i++) {
    seen.fill(0);
    seen[i] = 1;
    let n = 0;
    for (const unit of [(i / 9) | 0, 9 + (i % 9), 18 + BOX_OF[i]]) {
      for (let k = 0; k < 9; k++) {
        const j = UNITS[unit * 9 + k];
        if (seen[j]) continue;
        seen[j] = 1;
        PEERS[i * 20 + n++] = j;
      }
    }
  }
}

/**
 * The 1-based index of a **one-hot** mask (bit 0 -> 1, bit 8 -> 9).
 *
 * Callers must have isolated a single bit first (`mask & -mask`, or a popcount
 * check); given several set bits this returns the highest, not the lowest.
 */
export function digitFromBit(bit: number): number {
  return 32 - Math.clz32(bit);
}
