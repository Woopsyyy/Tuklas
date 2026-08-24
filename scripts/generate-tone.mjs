import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const DURATION_SECONDS = 0.6;
const FREQUENCY_HZ = 440;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, "../assets/audio/tone.wav");

const sampleCount = Math.round(SAMPLE_RATE * DURATION_SECONDS);
const dataBytes = sampleCount * 2;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < sampleCount; i++) {
  const fade = Math.min(1, i / 480, (sampleCount - i) / 480);
  const amplitude =
    Math.sin((2 * Math.PI * FREQUENCY_HZ * i) / SAMPLE_RATE) * fade;
  buffer.writeInt16LE(Math.round(amplitude * 32000), 44 + i * 2);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
console.log(`wrote ${outputPath}`);
