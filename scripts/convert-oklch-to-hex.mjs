#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function oklchToSRGBHex(l, c, hDeg, alpha = 1) {
  // Convert OKLCH to OKLab
  const h = (hDeg || 0) * (Math.PI / 180);
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  // OKLab to LMS (non-linear)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  // Cubed to linear LMS
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  // LMS to linear sRGB
  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b2 = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // Clamp linear
  r = Math.min(1, Math.max(0, r));
  g = Math.min(1, Math.max(0, g));
  b2 = Math.min(1, Math.max(0, b2));

  // Linear to sRGB
  const compand = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

  const R = Math.round(Math.min(1, Math.max(0, compand(r))) * 255);
  const G = Math.round(Math.min(1, Math.max(0, compand(g))) * 255);
  const B = Math.round(Math.min(1, Math.max(0, compand(b2))) * 255);

  const toHex2 = (n) => n.toString(16).padStart(2, '0');

  let hex = `#${toHex2(R)}${toHex2(G)}${toHex2(B)}`;
  if (alpha !== undefined && alpha !== null && alpha < 1) {
    const A = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
    hex += toHex2(A);
  }
  return hex.toUpperCase();
}

function parseAlpha(raw) {
  if (raw == null) return 1;
  const s = raw.trim();
  if (s.endsWith('%')) {
    const v = parseFloat(s.slice(0, -1));
    return isNaN(v) ? 1 : v / 100;
  }
  const v = parseFloat(s);
  return isNaN(v) ? 1 : v;
}

function convertContent(content) {
  // Regex for oklch(L C H [/ A]?) allowing spaces, decimals, and percentages for A
  // Examples matched:
  // oklch(1 0 0)
  // oklch(0.577 0.245 27.325)
  // oklch(1 0 0 / 10%)
  // oklch(1 0 0/0.5)
  const re = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/gi;

  return content.replace(re, (_match, l, c, h, a) => {
    const L = parseFloat(l);
    const C = parseFloat(c);
    const H = parseFloat(h);
    const A = parseAlpha(a);
    try {
      return oklchToSRGBHex(L, C, H, A);
    } catch {
      return _match; // fallback on any error
    }
  });
}

function main() {
  const file = process.argv[2] || path.join('src', 'app', 'globals.css');
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
  const css = fs.readFileSync(file, 'utf8');
  const out = convertContent(css);
  const backup = `${file}.bak`;
  fs.writeFileSync(backup, css, 'utf8');
  fs.writeFileSync(file, out, 'utf8');
  console.log(`Converted OKLCH to hex in ${file}. Backup created at ${backup}`);
}

main();
