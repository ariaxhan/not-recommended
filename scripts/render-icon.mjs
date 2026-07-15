import {deflateSync} from "node:zlib";
import {writeFileSync} from "node:fs";

const size = 512;
const scale = size / 128;
const pixels = Buffer.alloc(size * size * 4);
const colors = {
  bone: [238, 233, 220, 255],
  ink: [23, 24, 19, 255],
  signal: [166, 51, 36, 255],
  forest: [38, 75, 60, 255],
  clear: [0, 0, 0, 0],
};

function roundedSquare(x, y) {
  const radius = 23;
  const dx = Math.max(23 - x, 0, x - 105);
  const dy = Math.max(23 - y, 0, y - 105);
  return dx * dx + dy * dy <= radius * radius;
}

function distanceToLine(x, y, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

for (let py = 0; py < size; py += 1) {
  for (let px = 0; px < size; px += 1) {
    const x = (px + 0.5) / scale;
    const y = (py + 0.5) / scale;
    let color = roundedSquare(x, y) ? colors.bone : colors.clear;
    const ring = Math.abs(Math.hypot(x - 64, y - 64) - 35);
    if (ring <= 2.5) color = colors.ink;
    if (Math.hypot(x - 64, y - 64) <= 8) color = colors.forest;
    if (distanceToLine(x, y, 22, 91, 106, 37) <= 4) color = colors.signal;
    if (distanceToLine(x, y, 25, 99, 109, 45) <= 1) color = colors.ink;
    const offset = (py * size + px) * 4;
    pixels.set(color, offset);
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header.set([8, 6, 0, 0, 0], 8);
const scanlines = Buffer.alloc(size * (1 + size * 4));
for (let row = 0; row < size; row += 1) {
  const target = row * (1 + size * 4);
  scanlines[target] = 0;
  pixels.copy(scanlines, target + 1, row * size * 4, (row + 1) * size * 4);
}

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", deflateSync(scanlines, {level: 9})),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("/private/tmp/not-recommended-icon.png", png);
