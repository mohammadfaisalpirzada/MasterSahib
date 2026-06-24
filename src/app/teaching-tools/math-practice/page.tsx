'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Question = { q: string; a: number | string; hint: string; mcq?: string[] };
type SubtopicDef = { id: string; label: string };
type TopicDef = { id: string; icon: string; name: string; sub: string; subtopics: SubtopicDef[] };
type StrandDef = { id: string; label: string; icon: string; cls: string };
type StageDef = { id: number; label: string; age: string; color: string };

const STAGES: StageDef[] = [
  { id: 1, label: 'Stage 1', age: '5–6', color: '#1D9E75' },
  { id: 2, label: 'Stage 2', age: '6–7', color: '#0F6E56' },
  { id: 3, label: 'Stage 3', age: '7–8', color: '#185FA5' },
  { id: 4, label: 'Stage 4', age: '8–9', color: '#378ADD' },
  { id: 5, label: 'Stage 5', age: '9–10', color: '#BA7517' },
  { id: 6, label: 'Stage 6', age: '10–11', color: '#993C1D' },
];

const STRANDS: StrandDef[] = [
  { id: 'num', label: 'Number', icon: '🔢', cls: 'num' },
  { id: 'geo', label: 'Geometry & Measure', icon: '📐', cls: 'geo' },
  { id: 'stat', label: 'Statistics & Probability', icon: '📊', cls: 'stat' },
];

function r(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function gcd(a: number, b: number): number { while (b) { let t = b; b = a % b; a = t; } return a; }
function pick<T>(arr: T[]): T { return arr[r(0, arr.length - 1)]; }
function lcm(a: number, b: number) { return (a * b) / gcd(a, b); }

function genQ(stage: number, topic: string, sub: string, diff: Difficulty): Question {
  const D: Record<Difficulty, [number, number]> = { easy: [1, 10], medium: [10, 50], hard: [50, 200] };
  const [lo, hi] = D[diff];

  if (topic === 'count' || topic === 'count2' || topic === 'count3') {
    if (sub === 'skip2' || sub === 'c2') { const s = r(0, 15) * 2; return { q: `${s}, ${s + 2}, ${s + 4}, ___ ?`, a: s + 6, hint: 'Har baar 2 add karo', mcq: [`${s + 6}`, `${s + 8}`, `${s + 4}`] }; }
    if (sub === 'skip10') { const s = r(0, 5) * 10; return { q: `${s}, ${s + 10}, ${s + 20}, ___ ?`, a: s + 30, hint: '10 add karo har bar', mcq: [`${s + 30}`, `${s + 40}`, `${s + 20}`] }; }
    if (sub === 'skip5') { const s = r(0, 10) * 5; return { q: `${s}, ${s + 5}, ${s + 10}, ___ ?`, a: s + 15, hint: '5 add karo har bar', mcq: [`${s + 15}`, `${s + 20}`, `${s + 10}`] }; }
    if (sub === 'bwd') { const s = r(5, 20); return { q: `${s}, ${s - 1}, ${s - 2}, ___ ?`, a: s - 3, hint: 'Minus 1 karo', mcq: [`${s - 3}`, `${s - 4}`, `${s - 2}`] }; }
    if (sub === 'c3' || sub === 'ordinal') { const s = r(5, 20); return { q: `Even ya Odd: ${s}?`, a: s % 2 === 0 ? 'even' : 'odd', hint: '2 se divide ho to even', mcq: ['even', 'odd'] }; }
    if (sub === 'c4') { return { q: 'Count in fractions: 0, ½, 1, 1½, ___ ?', a: '2', hint: '½ add karo har bar', mcq: ['2', '2½', '3'] }; }
    if (sub === 'fwd' || sub === 'cfwd') { const s = r(1, 15); return { q: `${s}, ${s + 1}, ${s + 2}, ___ ?`, a: s + 3, hint: 'Agla number 1 zyada' }; }
    const s = r(1, 95); return { q: `${s}, ${s + 1}, ${s + 2}, ___ ?`, a: s + 3, hint: 'Agle number main 1 jodo' };
  }

  if (topic.startsWith('place')) {
    if (sub === 'pv1' || sub === 'p1') {
      if (stage <= 2) { const t = r(1, 9), o = r(0, 9); return { q: `${t} tens + ${o} ones = ?`, a: t * 10 + o, hint: `${t}0 + ${o}` }; }
      if (stage === 3) { const h = r(1, 9), t = r(0, 9), o = r(0, 9); return { q: `${h} hundreds + ${t} tens + ${o} ones = ?`, a: h * 100 + t * 10 + o, hint: `${h * 100} + ${t * 10} + ${o}` }; }
      const th = r(1, 9), h = r(0, 9), t = r(0, 9), o = r(0, 9); return { q: `${th} thousands + ${h} hundreds + ${t} tens + ${o} ones = ?`, a: th * 1000 + h * 100 + t * 10 + o, hint: 'Har jagah ki value jodo' };
    }
    if (sub === 'pv2' || sub === 'p2') { const a = r(lo, hi), b = r(lo, hi); return { q: `${a} > ${b} — True ya False?`, a: a > b ? 'true' : 'false', hint: 'Bada number aage', mcq: ['True', 'False'] }; }
    if (sub === 'pv3' || sub === 'p3') { const s = r(1, 90); return { q: `Round ${s} to nearest 10?`, a: Math.round(s / 10) * 10, hint: '5+ upar, warna neeche' }; }
    if (sub === 'p3' && stage >= 4) { const s = r(100, 900); return { q: `Round ${s} to nearest 100?`, a: Math.round(s / 100) * 100, hint: '50+ upar' }; }
    if (sub === 'p4' && stage === 4) { return { q: 'Roman numeral XIV = ?', a: 14, hint: 'X=10, IV=4', mcq: ['14', '16', '19', '4'] }; }
    if (sub === 'p1' && stage >= 5) { const n = r(10000, 999999); return { q: `${n.toLocaleString()} — kitni thousands?`, a: Math.floor(n / 1000), hint: `÷ 1000 karo` }; }
    const a = r(lo, hi), b = r(lo, hi); return { q: `${a} ya ${b} — kaunsa bada?`, a: Math.max(a, b), hint: 'Jo bada wo jawab' };
  }

  if (topic.startsWith('add')) {
    if (stage >= 5 && (sub === 'dc1' || sub === 'a1' || sub === 'a2')) { const a = (r(10, 99) / 10).toFixed(1), b = (r(10, 99) / 10).toFixed(1); return { q: `${a} + ${b}`, a: +(+a + +b).toFixed(1), hint: 'Decimal point align karo' }; }
    if (sub === 'a5' && stage <= 2) { const a = r(1, 10); return { q: `___ + ${a} = 20`, a: 20 - a, hint: `20 − ${a}` }; }
    if (stage === 2 && (sub === 'a2' || sub === 'a1')) { const a = r(10, 30), b = r(10, 20); return { q: `${a} + ${b}`, a: a + b, hint: 'Tens alag, ones alag' }; }
    if (stage === 3 && (sub === 'a1' || sub === 'a2')) { const a = r(100, 400), b = r(100, 400); return { q: `${a} + ${b}`, a: a + b, hint: 'Column method' }; }
    if (stage >= 4 && (sub === 'a1' || sub === 'a2' || sub === 'a4')) { const a = r(1000, 5000), b = r(1000, 5000); return { q: `${a.toLocaleString()} + ${b.toLocaleString()}`, a: a + b, hint: 'Column method' }; }
    if (sub === 'a3' && stage === 3) { const a = r(100, 300), b = r(100, 300), c = r(100, 300); return { q: `${a} + ${b} + ${c}`, a: a + b + c, hint: 'Teeno ko jodo' }; }
    if (sub === 'a4' && stage === 3) { const a = r(110, 190), b = r(110, 190); return { q: `Estimate: ${a} + ${b} ≈ ? (nearest 10)`, a: Math.round(a / 10) * 10 + Math.round(b / 10) * 10, hint: 'Round then add' }; }
    if (stage <= 1) { const a = r(1, 5), b = r(1, 6 - a); return { q: `${a} + ${b}`, a: a + b, hint: 'Count on fingers' }; }
    if (sub === 'a3' && stage >= 4) { const total = r(20, 100), given = r(5, total - 1); return { q: `Word: ${given} + ___ = ${total}`, a: total - given, hint: `${total} − ${given}` }; }
    const a = r(lo, hi), b = r(lo, hi); return { q: `${a} + ${b}`, a: a + b, hint: 'Bada number pehle lo, chota add karo' };
  }

  if (topic.startsWith('sub')) {
    if (stage >= 5 && (sub === 'dc2' || sub === 's2')) { let a = (r(20, 99) / 10).toFixed(1), b = (r(1, +a * 10 - 1) / 10).toFixed(1); const big = +a > +b ? a : b, small = +a > +b ? b : a; return { q: `${big} − ${small}`, a: +Math.abs(+a - +b).toFixed(1), hint: 'Line up decimals' }; }
    if (sub === 's3' && stage >= 5) { const a = r(-10, 10), b = r(-10, 10); return { q: `Difference of ${a} and ${b}?`, a: Math.abs(a - b), hint: 'Bada − chota' }; }
    if (stage >= 4) { const a = r(2000, 9000), b = r(100, Math.floor(a / 2)); return { q: `${a.toLocaleString()} − ${b.toLocaleString()}`, a: a - b, hint: 'Column subtraction, borrow' }; }
    if (stage <= 1) { const b = r(1, 5), a = b + r(0, 4); return { q: `${a} − ${b}`, a: a - b, hint: `${a} se ${b} hatao` }; }
    if (sub === 's4' && stage >= 3) { const a = r(300, 800), b = r(100, a - 1); const ans = a - b; return { q: `${a} − ${b} = ${ans}. Check: ${ans} + ${b} = ?`, a, hint: 'Inverse operation' }; }
    let a = r(Math.max(lo + 5, 10), hi + 10), b = r(1, a - 1); return { q: `${a} − ${b}`, a: a - b, hint: 'Borrow na bhoolain' };
  }

  if (topic.startsWith('mul')) {
    const tables: Record<string, number> = { m1: 1, m2: 2, m3: 3, m4: 4, m5: 5, m6: 6, m7: 7, m8: 8, m9: 9, m10: 10, t1: 1, t2: 2, t3: 3, t4: 4, t5: 5 };
    if (tables[sub] !== undefined) { const t = tables[sub], x = r(1, 12); return { q: `${t} × ${x}`, a: t * x, hint: `Table of ${t}` }; }
    if (sub === 'm2' && stage >= 4) { const a = r(11, 50), b = r(11, 30); return { q: `${a} × ${b}`, a: a * b, hint: 'Grid method: (tens+ones) × (tens+ones)' }; }
    if (sub === 'm1' && stage >= 6) { const a = r(100, 500), b = r(10, 30); return { q: `${a} × ${b}`, a: a * b, hint: 'Pehle × ones, phir × tens' }; }
    if (sub === 'm3' && stage >= 5) { const a = (r(2, 9) / 10).toFixed(1), b = r(2, 9); return { q: `${a} × ${b}`, a: +(+a * b).toFixed(1), hint: 'Normal × phir decimal' }; }
    if (sub === 'm4' && stage >= 5) { return { q: '(3 + 4) × 2 = ?', a: 14, hint: 'Brackets pehle', mcq: ['10', '14', '13', '11'] }; }
    if (sub === 'm4' && stage >= 6) { const b = r(2, 9); return { q: `${b}² = ?`, a: b * b, hint: `${b} × ${b}` }; }
    if (sub === 'm5' && stage >= 6) { return { q: '2 + 3 × 4 = ?', a: 14, hint: 'BODMAS: multiply pehle', mcq: ['20', '14', '24', '9'] }; }
    const a = r(2, diff === 'easy' ? 9 : 12), b = r(2, diff === 'easy' ? 9 : 12); return { q: `${a} × ${b}`, a: a * b, hint: `Table of ${a}` };
  }

  if (topic.startsWith('div')) {
    if (sub === 'd3' || sub === 'drem' || sub === 'drp') { const d = r(2, 9), q = r(2, 8), rem = r(1, d - 1), a = d * q + rem; return { q: `${a} ÷ ${d} = ? (remainder?)`, a: q, hint: `Quotient ${q}, remainder ${rem}` }; }
    if (sub === 'd4' && stage >= 4) { return { q: 'Check: 144 ÷ 4 = ?', a: 36, hint: '144 ÷ 4', mcq: ['34', '36', '38', '32'] }; }
    if (sub === 'd2' && stage >= 5) { const d = r(2, 9), a = r(10, 25), n = d * a; return { q: `${n} ÷ ${d}`, a, hint: 'Divide, multiply, subtract, bring down' }; }
    if (sub === 'd4' && stage >= 5) { const nums = [r(5, 20), r(5, 20), r(5, 20), r(5, 20)]; const avg = Math.round(nums.reduce((s, x) => s + x, 0) / nums.length); return { q: `Mean of ${nums.join(', ')}?`, a: avg, hint: 'Sum ÷ count' }; }
    if ((sub === 'd3' || sub === 'd2') && stage >= 5) { const a = (r(10, 50) / 10).toFixed(1), b = r(2, 5); return { q: `${a} ÷ ${b}`, a: +(+a / b).toFixed(1), hint: 'Normal ÷ phir decimal' }; }
    if (sub === 'd5' && stage >= 6) { const total = r(12, 60), kids = r(2, 6); return { q: `Share ${total} toys among ${kids} kids equally. Each gets?`, a: Math.floor(total / kids), hint: `${total} ÷ ${kids}` }; }
    const d = r(2, stage <= 2 ? 5 : 9), a = r(1, 10), n = d * a; return { q: `${n} ÷ ${d}`, a, hint: `Kaunsa number × ${d} = ${n}?` };
  }

  if (topic.startsWith('frac')) {
    if (sub === 'f1' && stage <= 1) { return { q: 'Half of 8?', a: 4, hint: '8 ÷ 2', mcq: ['2', '4', '6', '8'] }; }
    if (sub === 'f2' && stage <= 1) { return { q: 'Quarter of 8?', a: 2, hint: '8 ÷ 4', mcq: ['2', '4', '1', '8'] }; }
    if (sub === 'f3' && stage <= 2) { const n = r(1, 5) * 2; return { q: `Half of ${n}?`, a: n / 2, hint: `${n} ÷ 2` }; }
    if (sub === 'f1' && stage === 3) { const d = r(2, 8), n = r(1, d - 1); return { q: `${n}/${d} ka numerator?`, a: n, hint: 'Upar wala numerator', mcq: [`${n}`, `${d}`, `${n + d}`] }; }
    if (sub === 'f1' && stage >= 5) { const d1 = r(2, 6), n1 = r(1, d1 - 1), d2 = r(2, 6), n2 = r(1, d2 - 1); const l = lcm(d1, d2); return { q: `${n1}/${d1} + ${n2}/${d2} = ? / ${l}`, a: n1 * (l / d1) + n2 * (l / d2), hint: `LCD = ${l}` }; }
    if (sub === 'f1' && stage >= 6) { const n1 = r(1, 4), d1 = r(2, 5), n2 = r(1, 4), d2 = r(2, 5); return { q: `${n1}/${d1} × ${n2}/${d2} = ?`, a: +(n1 * n2 / (d1 * d2)).toFixed(2), hint: 'Num × num, den × den' }; }
    if (sub === 'f3' && stage >= 4) { const d = r(2, 8), n = r(1, d - 1), g = gcd(n, d); return { q: `Simplify ${n}/${d}?`, a: `${n / g}/${d / g}`, hint: `Divide by ${g}` }; }
    if (sub === 'f4' && stage >= 4) { const d = r(2, 5), n = r(1, d - 1), whole = r(1, 5) * d; return { q: `${n}/${d} of ${whole}?`, a: Math.floor(n * whole / d), hint: `${whole} ÷ ${d} × ${n}` }; }
    if (sub === 'f2' && stage >= 5) { const d1 = r(2, 6), n1 = r(2, d1 - 1), d2 = r(2, 6), n2 = r(1, n1 - 1); const l = lcm(d1, d2); if (n2 < 1) return genQ(stage, topic, sub, diff); return { q: `${n1}/${d1} − ${n2}/${d2} = ? / ${l}`, a: n1 * (l / d1) - n2 * (l / d2), hint: `LCD = ${l}` }; }
    if ((sub === 'f3' || sub === 'f4') && stage >= 5) { const w1 = r(1, 2), w2 = r(1, 2), d = r(2, 4); let n1 = r(1, d - 1), n2 = r(1, d - 1); return { q: `${w1} ${n1}/${d} + ${w2} ${n2}/${d} = ?`, a: `${w1 + w2 + Math.floor((n1 + n2) / d)} ${(n1 + n2) % d}/${d}`, hint: 'Whole + fraction alag karo' }; }
    if (sub === 'f2' && stage >= 6) { const n1 = r(1, 4), d1 = r(2, 5), n2 = r(1, 4), d2 = r(2, 5); return { q: `${n1}/${d1} ÷ ${n2}/${d2} = ?`, a: +(n1 * d2 / (d1 * n2)).toFixed(2), hint: 'Flip second, multiply' }; }
    const d = r(2, 6), n = r(1, d - 1); return { q: `${n}/${d} of ${d * r(1, 5)}?`, a: n * r(1, 5), hint: '÷ denom × numerator' };
  }

  if (topic.startsWith('dec')) {
    if (sub === 'dc1') { const a = (r(1, 9) / 10).toFixed(1); return { q: `${a} = ? tenths`, a: Math.round(+a * 10), hint: 'Decimal ke baad wala digit' }; }
    if (sub === 'dc2' || sub === 'dc1' && stage >= 4) { const a = (r(10, 99) / 100).toFixed(2); return { q: `${a} = ? hundredths`, a: Math.round(+a * 100), hint: '2 digits baad decimal' }; }
    if (sub === 'dc3') { const a = (r(1, 99) / 10).toFixed(1), b = (r(1, 99) / 10).toFixed(1); return { q: `${a} ya ${b} — kaunsa bada?`, a: +a > +b ? a : b, hint: 'Integer part pehle', mcq: [a, b, 'equal'] }; }
    if (sub === 'dc4') { const a = (r(10, 99) / 10).toFixed(1), b = (r(10, 99) / 10).toFixed(1); return { q: `${a} + ${b}`, a: +(+a + +b).toFixed(1), hint: 'Align decimals' }; }
    if (sub === 'dc2' && stage >= 5) { const a = (r(1, 9) / 10).toFixed(1); return { q: `${a} × 100 = ?`, a: +a * 100, hint: 'Decimal 2 jagah shift' }; }
    const a = (r(10, 99) / 10).toFixed(1), b = (r(10, 99) / 10).toFixed(1); return { q: `${a} + ${b}`, a: +(+a + +b).toFixed(1), hint: 'Align decimals' };
  }

  if (topic.startsWith('perc') || topic.startsWith('ratio')) {
    if (sub === 'pct1') { const p = r(1, 9) * 10; return { q: `${p}% of 100?`, a: p, hint: '100 ka % = wohi' }; }
    if (sub === 'pct2') { return { q: '½ = ___%?', a: '50', hint: '½ = 50%', mcq: ['25%', '50%', '75%', '100%'] }; }
    if (sub === 'pct3') { const p = r(1, 9) * 10, n = r(1, 10) * 10; return { q: `${p}% of ${n}?`, a: p * n / 100, hint: `÷100 × ${p}` }; }
    if (sub === 'pct1' && stage >= 6) { const n = r(50, 200), p = pick([5, 10, 15, 20, 25, 30, 50]); return { q: `${p}% of ${n}?`, a: n * p / 100, hint: `${n} × ${p}/100` }; }
    if (sub === 'pct2' && stage >= 6) { const n = r(80, 200), p = pick([10, 15, 20, 25, 30, 40, 50]); return { q: `${n} + ${p}% of ${n} = ?`, a: n + n * p / 100, hint: `${p}% add karo` }; }
    if (sub === 'r1') { const a = r(1, 5), b = r(1, 5); return { q: `Simplify ${a * 2}:${b * 2}`, a: `${a}:${b}`, hint: 'GCF se divide', mcq: [`${a}:${b}`, `${a + 1}:${b}`, `${a}:${b + 1}`] }; }
    if (sub === 'r2') { const a = r(2, 5), b = r(2, 5); return { q: `Recipe: ${a}c flour for ${b} people. For ${b * 2} people?`, a: a * 2, hint: '2x log, 2x flour' }; }
    if (sub === 'r3') { const rate = r(2, 5), x = r(2, 6); return { q: `1 book = $${rate}. ${x} books?`, a: rate * x, hint: `$${rate} × ${x}` }; }
    if (sub === 'r4' && stage >= 6) { const p = r(1, 5) * 10, n = r(1, 10) * 10; return { q: `${n} increased by ${p}%?`, a: n + n * p / 100, hint: `${n} + ${p}%` }; }
    return { q: '25% of 80?', a: 20, hint: '÷4 to find 25%', mcq: ['15', '20', '25', '30'] };
  }

  if (topic.startsWith('alg')) {
    if (sub === 'al1') { const n = r(1, 10); return { q: `n + 5 = ${n + 5}. n = ?`, a: n, hint: '5 hatao dono taraf' }; }
    if (sub === 'al2') { const a = r(1, 5), b = r(1, 5); return { q: `x = ${a}, find 2x + ${b}?`, a: 2 * a + b, hint: `2×${a} + ${b}` }; }
    if (sub === 'al3') { const l = r(2, 8), w = r(1, 5); return { q: `l=${l}, w=${w}. Area = l × w?`, a: l * w, hint: `${l} × ${w}` }; }
    if (sub === 'al4') { const a = r(1, 10); return { q: `3x = ${3 * a}. x = ?`, a, hint: `${3 * a} ÷ 3` }; }
    return { q: 'y + 7 = 12. y = ?', a: 5, hint: '12 − 7', mcq: ['5', '7', '12', '19'] };
  }

  if (topic.startsWith('shapes')) {
    const sq = [
      { q: 'Circle ki kitni sides?', a: '0', mcq: ['0', '1', '2', 'infinite'], hint: 'Koi straight side nahi' },
      { q: 'Triangle ki kitni sides?', a: '3', mcq: ['2', '3', '4', '5'], hint: 'Tri = 3' },
      { q: 'Square ki kitni sides?', a: '4', mcq: ['3', '4', '5', '6'], hint: '4 equal sides' },
      { q: 'Hexagon ki kitni sides?', a: '6', mcq: ['5', '6', '7', '8'], hint: 'Hexa = 6' },
      { q: 'Rectangle ki kitni right angles?', a: '4', mcq: ['2', '4', '0', '8'], hint: 'Har kona right angle' },
      { q: 'Triangle angles ka sum?', a: '180', mcq: ['90', '180', '270', '360'], hint: '180°' },
      { q: 'Quadrilateral angles ka sum?', a: '360', mcq: ['180', '270', '360', '720'], hint: '360°' },
      { q: 'Right angle = ___°?', a: '90', mcq: ['45', '90', '180', '360'], hint: '90°' },
      { q: 'Straight line ka angle?', a: '180', mcq: ['90', '180', '360', '270'], hint: '180°' },
      { q: 'Cube ki kitni faces?', a: '6', mcq: ['4', '6', '8', '12'], hint: '6 square faces' },
      { q: 'Cone ki kitni faces?', a: '2', mcq: ['1', '2', '3', '0'], hint: 'Base + curved' },
    ];
    return sq[r(0, sq.length - 1)];
  }

  if (topic.startsWith('pos') || topic.startsWith('position')) {
    const cq = [
      { q: 'Point (3,5) — x coordinate?', a: '3', mcq: ['3', '5', '8', '0'], hint: 'Pehla number x' },
      { q: 'Point (0,4) — y coordinate?', a: '4', mcq: ['0', '4', '4,0', 'none'], hint: 'Doosra number y' },
      { q: 'Origin coordinates?', a: '(0,0)', mcq: ['(0,0)', '(1,1)', '(0,1)', '(1,0)'], hint: 'Center of graph' },
      { q: 'Reflection in y-axis: (3,2) → ?', a: '(-3,2)', mcq: ['(-3,2)', '(3,-2)', '(-3,-2)', '(3,2)'], hint: 'x negative hota hai' },
      { q: 'Translate (2,3) right 4: new x?', a: '6', mcq: ['6', '2', '4', '8'], hint: '2 + 4 = 6' },
      { q: 'North, South, East, West — kitne cardinal?', a: '4', mcq: ['2', '4', '6', '8'], hint: 'N S E W = 4' },
    ];
    return cq[r(0, cq.length - 1)];
  }

  if (topic.startsWith('meas') || topic.startsWith('measure')) {
    const mq = [
      { q: '1 km = ___ m?', a: '1000', mcq: ['10', '100', '1000', '10000'], hint: 'Kilo = 1000' },
      { q: '1 m = ___ cm?', a: '100', mcq: ['10', '100', '1000'], hint: '1 m = 100 cm' },
      { q: '1 kg = ___ g?', a: '1000', mcq: ['100', '1000', '10000'], hint: 'Kilo = 1000 g' },
      { q: '1 L = ___ mL?', a: '1000', mcq: ['100', '1000', '10000'], hint: '1 L = 1000 mL' },
      { q: 'Perimeter: square side 5cm?', a: '20', mcq: ['10', '15', '20', '25'], hint: '4 × 5 = 20' },
      { q: 'Area: rectangle 6×4cm?', a: '24', mcq: ['20', '24', '48', '10'], hint: '6 × 4 = 24 cm²' },
      { q: 'Volume: cuboid 3×4×5?', a: '60', mcq: ['12', '60', '120', '48'], hint: '3×4×5 = 60 cm³' },
      { q: 'Triangle area: base 10, height 6?', a: '30', mcq: ['60', '30', '16', '20'], hint: '½ × 10 × 6' },
    ];
    return mq[r(0, mq.length - 1)];
  }

  if (topic.startsWith('time')) {
    const tq = [
      { q: '1 hour = ___ minutes?', a: '60', mcq: ['30', '60', '100', '120'], hint: '1 hour = 60 min' },
      { q: '1 minute = ___ seconds?', a: '60', mcq: ['60', '100', '30', '120'], hint: '1 min = 60 sec' },
      { q: '1 day = ___ hours?', a: '24', mcq: ['12', '24', '48'], hint: '24 ghante' },
      { q: '1 week = ___ days?', a: '7', mcq: ['5', '6', '7', '8'], hint: '7 din' },
      { q: '1 year = ___ months?', a: '12', mcq: ['10', '12', '24'], hint: '12 maheeney' },
      { q: '3:00 PM = ___ in 24hr?', a: '15:00', mcq: ['03:00', '13:00', '15:00', '12:00'], hint: '+12 PM' },
      { q: '9:00 AM to 1:00 PM = ?', a: '4 hours', mcq: ['3 hours', '4 hours', '5 hours'], hint: '4 ghante' },
      { q: '2:30 mein minute hand kahaan?', a: '6', mcq: ['3', '6', '9', '12'], hint: '30 min = 6 par' },
    ];
    return tq[r(0, tq.length - 1)];
  }

  if (topic.startsWith('data') || topic.startsWith('stat')) {
    const dq = [
      { q: 'Mode of: 3, 5, 3, 7, 3, 9?', a: '3', mcq: ['3', '5', '7', '9'], hint: 'Sabse zyada baar' },
      { q: 'Median of: 2, 4, 6, 8, 10?', a: '6', mcq: ['4', '6', '8', '5'], hint: 'Beech ka number' },
      { q: 'Mean of: 4, 6, 8?', a: '6', mcq: ['6', '7', '8', '5'], hint: '(4+6+8)÷3' },
      { q: 'Range of: 5, 12, 3, 9?', a: '9', mcq: ['7', '9', '12', '4'], hint: 'Max − Min' },
      { q: 'P(Heads) on coin?', a: '½', mcq: ['½', '1', '0', '¼'], hint: '1/2 chance' },
      { q: 'Certain event probability?', a: '1', mcq: ['0', '½', '1', '¼'], hint: 'Zaroor = 1' },
      { q: 'Impossible event probability?', a: '0', mcq: ['0', '½', '1'], hint: 'Nahi ho sakta = 0' },
      { q: 'Tally IIII = ?', a: '4', mcq: ['3', '4', '5', '6'], hint: '4 lakeerain' },
      { q: 'Mean of 10, 20, 30?', a: '20', mcq: ['10', '15', '20', '25'], hint: '(10+20+30)÷3' },
      { q: 'Pie chart: ¼ of circle = ___°?', a: '90', mcq: ['45', '90', '180', '360'], hint: '360 ÷ 4' },
    ];
    return dq[r(0, dq.length - 1)];
  }

  const a = r(lo, hi), b = r(lo, hi); return { q: `${a} + ${b}`, a: a + b, hint: 'Add karo' };
}

const CURRICULUM: Record<number, Record<string, TopicDef[]>> = {
  1: {
    num: [
      { id: 'count', icon: '🔢', name: 'Counting', sub: 'Numbers 0–100', subtopics: [{ id: 'fwd', label: 'Count forward to 20' }, { id: 'bwd', label: 'Count backward from 20' }, { id: 'skip2', label: 'Skip count by 2' }, { id: 'skip10', label: 'Skip count by 10' }, { id: 'ordinal', label: 'Ordinal (1st–10th)' }] },
      { id: 'place', icon: '🏠', name: 'Place Value', sub: 'Tens & ones', subtopics: [{ id: 'pv1', label: 'Tens and ones' }, { id: 'pv2', label: 'Compare to 20' }, { id: 'pv3', label: 'Order 0–20' }, { id: 'pv4', label: 'More/less than' }] },
      { id: 'add', icon: '➕', name: 'Addition', sub: 'Up to 10', subtopics: [{ id: 'a1', label: 'Add within 5' }, { id: 'a2', label: 'Add within 10' }, { id: 'a3', label: 'Bonds to 10' }, { id: 'a4', label: 'Using objects' }] },
      { id: 'sub', icon: '➖', name: 'Subtraction', sub: 'Up to 10', subtopics: [{ id: 's1', label: 'Subtract within 5' }, { id: 's2', label: 'Subtract within 10' }, { id: 's3', label: 'Subtraction bonds' }, { id: 's4', label: 'Missing number' }] },
      { id: 'frac', icon: '½', name: 'Fractions', sub: 'Halves & quarters', subtopics: [{ id: 'f1', label: 'Half of a shape' }, { id: 'f2', label: 'Quarter of a shape' }, { id: 'f3', label: 'Half of a number' }] },
    ],
    geo: [
      { id: 'shapes2d', icon: '🔺', name: '2D Shapes', sub: 'Basic shapes', subtopics: [{ id: 'g1', label: 'Circle, square, triangle' }, { id: 'g2', label: 'Rectangle, pentagon' }, { id: 'g3', label: 'Sides and corners' }] },
      { id: 'shapes3d', icon: '📦', name: '3D Shapes', sub: 'Solid shapes', subtopics: [{ id: 'g4', label: 'Cube, sphere, cylinder' }, { id: 'g5', label: 'Cone, cuboid' }] },
      { id: 'measure', icon: '📏', name: 'Measure', sub: 'Length & mass', subtopics: [{ id: 'm1', label: 'Compare length' }, { id: 'm2', label: 'Compare mass' }, { id: 'm3', label: 'Compare capacity' }, { id: 'm4', label: 'Order by size' }] },
      { id: 'time', icon: '⏰', name: 'Time', sub: 'Days & hours', subtopics: [{ id: 't1', label: 'Days of week' }, { id: 't2', label: 'Months of year' }, { id: 't3', label: "O'clock on analogue" }] },
    ],
    stat: [
      { id: 'data', icon: '📊', name: 'Data', sub: 'Sorting & counting', subtopics: [{ id: 'd1', label: 'Sort by colour' }, { id: 'd2', label: 'Sort by shape' }, { id: 'd3', label: 'Read pictograms' }, { id: 'd4', label: 'Tally charts' }] },
    ],
  },
  2: {
    num: [
      { id: 'count2', icon: '🔢', name: 'Counting', sub: 'Numbers to 100', subtopics: [{ id: 'c1', label: 'Count to 100' }, { id: 'c2', label: 'Skip count 2,3,5,10' }, { id: 'c3', label: 'Odd and even' }, { id: 'c4', label: 'Count in fractions' }] },
      { id: 'place2', icon: '🏠', name: 'Place Value', sub: '2-digit numbers', subtopics: [{ id: 'p1', label: 'Tens/ones to 100' }, { id: 'p2', label: 'Compare 2-digit' }, { id: 'p3', label: 'Number line' }, { id: 'p4', label: 'Round to 10' }] },
      { id: 'add2', icon: '➕', name: 'Addition', sub: '2-digit, carry', subtopics: [{ id: 'a1', label: '2-digit + 1-digit' }, { id: 'a2', label: '2-digit + 2-digit' }, { id: 'a3', label: 'With carrying' }, { id: 'a4', label: 'Mental strategies' }, { id: 'a5', label: 'Bonds to 20' }] },
      { id: 'sub2', icon: '➖', name: 'Subtraction', sub: '2-digit, borrow', subtopics: [{ id: 's1', label: '2-digit − 1-digit' }, { id: 's2', label: '2-digit − 2-digit' }, { id: 's3', label: 'With borrowing' }, { id: 's4', label: 'Check with addition' }] },
      { id: 'mul2', icon: '✖️', name: 'Multiplication', sub: 'Arrays & tables', subtopics: [{ id: 't1', label: 'Arrays & groups' }, { id: 't2', label: 'Table of 2' }, { id: 't3', label: 'Table of 5' }, { id: 't4', label: 'Table of 10' }] },
      { id: 'div2', icon: '➗', name: 'Division', sub: 'Sharing equally', subtopics: [{ id: 'd1', label: 'Equal groups' }, { id: 'd2', label: 'Divide by 2' }, { id: 'd3', label: 'Divide by 5' }, { id: 'd4', label: 'Divide by 10' }] },
      { id: 'frac2', icon: '½', name: 'Fractions', sub: 'Halves, thirds, quarters', subtopics: [{ id: 'f1', label: 'Half shape/number' }, { id: 'f2', label: 'Quarter' }, { id: 'f3', label: 'Third of a number' }, { id: 'f4', label: 'Fractions on number line' }] },
    ],
    geo: [
      { id: 'shapes2d2', icon: '🔺', name: '2D Shapes', sub: 'Properties', subtopics: [{ id: 'g1', label: 'Name and describe' }, { id: 'g2', label: 'Lines of symmetry' }, { id: 'g3', label: 'Right angles' }] },
      { id: 'shapes3d2', icon: '📦', name: '3D Shapes', sub: 'Properties', subtopics: [{ id: 'g4', label: 'Faces, edges, vertices' }, { id: 'g5', label: 'Prisms & pyramids' }] },
      { id: 'measure2', icon: '📏', name: 'Measure', sub: 'cm, kg, mL', subtopics: [{ id: 'm1', label: 'Measure in cm' }, { id: 'm2', label: 'kg/g' }, { id: 'm3', label: 'Capacity mL/L' }, { id: 'm4', label: 'Read scales' }] },
      { id: 'time2', icon: '⏰', name: 'Time', sub: 'Hours & minutes', subtopics: [{ id: 't1', label: "O'clock & half past" }, { id: 't2', label: 'Quarter past/to' }, { id: 't3', label: 'Digital clock' }, { id: 't4', label: 'Duration problems' }] },
    ],
    stat: [
      { id: 'data2', icon: '📊', name: 'Data', sub: 'Charts & tables', subtopics: [{ id: 'd1', label: 'Pictograms (2/symbol)' }, { id: 'd2', label: 'Bar charts' }, { id: 'd3', label: 'Carroll diagrams' }, { id: 'd4', label: 'Venn diagrams' }] },
    ],
  },
  3: {
    num: [
      { id: 'count3', icon: '🔢', name: 'Counting', sub: '1000s', subtopics: [{ id: 'c1', label: 'Count in hundreds' }, { id: 'c2', label: 'Skip count (any step)' }, { id: 'c3', label: 'Negative intro' }] },
      { id: 'place3', icon: '🏠', name: 'Place Value', sub: '3-digit numbers', subtopics: [{ id: 'p1', label: 'Hundreds, tens, ones' }, { id: 'p2', label: 'Compare 3-digit' }, { id: 'p3', label: 'Round 10/100' }, { id: 'p4', label: 'Partition numbers' }] },
      { id: 'add3', icon: '➕', name: 'Addition', sub: '3-digit, column', subtopics: [{ id: 'a1', label: '3-digit + 3-digit' }, { id: 'a2', label: 'Column addition' }, { id: 'a3', label: 'Add 3 numbers' }, { id: 'a4', label: 'Estimate then calc' }, { id: 'a5', label: 'Mental strategies' }] },
      { id: 'sub3', icon: '➖', name: 'Subtraction', sub: '3-digit, borrow', subtopics: [{ id: 's1', label: '3-digit − 3-digit' }, { id: 's2', label: 'Column subtraction' }, { id: 's3', label: 'Decomposition' }, { id: 's4', label: 'Inverse operations' }] },
      { id: 'mul3', icon: '✖️', name: 'Multiplication', sub: 'Tables 2–10', subtopics: [{ id: 'm1', label: 'Table of 3' }, { id: 'm2', label: 'Table of 4' }, { id: 'm3', label: 'Table of 6' }, { id: 'm4', label: 'Table of 7' }, { id: 'm5', label: 'Table of 8' }, { id: 'm6', label: 'Table of 9' }, { id: 'm7', label: '2-digit × 1-digit' }] },
      { id: 'div3', icon: '➗', name: 'Division', sub: 'Tables + remainder', subtopics: [{ id: 'd1', label: 'Divide by 3 or 4' }, { id: 'd2', label: 'Divide by 6 or 9' }, { id: 'd3', label: 'With remainder' }, { id: 'd4', label: 'Missing number' }] },
      { id: 'frac3', icon: '½', name: 'Fractions', sub: 'Proper fractions', subtopics: [{ id: 'f1', label: 'Unit fractions' }, { id: 'f2', label: 'Non-unit fractions' }, { id: 'f3', label: 'Compare fractions' }, { id: 'f4', label: 'Fraction of quantity' }] },
    ],
    geo: [
      { id: 'shapes3', icon: '🔺', name: 'Shapes', sub: 'Classify', subtopics: [{ id: 'g1', label: 'Quadrilaterals' }, { id: 'g2', label: 'Triangle types' }, { id: 'g3', label: 'Symmetry' }, { id: 'g4', label: 'Right/acute/obtuse' }] },
      { id: 'position3', icon: '🗺️', name: 'Position', sub: 'Coordinates', subtopics: [{ id: 'p1', label: 'Compass N/S/E/W' }, { id: 'p2', label: 'Grid coords (1st quad)' }, { id: 'p3', label: 'Reflection' }] },
      { id: 'measure3', icon: '📏', name: 'Measure', sub: 'Perimeter & area', subtopics: [{ id: 'm1', label: 'Perimeter' }, { id: 'm2', label: 'Area count squares' }, { id: 'm3', label: 'Convert mm/cm/m' }, { id: 'm4', label: 'g/kg, mL/L' }] },
      { id: 'time3', icon: '⏰', name: 'Time', sub: '12-hour clock', subtopics: [{ id: 't1', label: 'Read 12-hour' }, { id: 't2', label: 'am/pm' }, { id: 't3', label: 'Duration' }, { id: 't4', label: 'Calendar' }] },
    ],
    stat: [
      { id: 'data3', icon: '📊', name: 'Statistics', sub: 'Frequency tables', subtopics: [{ id: 'd1', label: 'Tally & frequency' }, { id: 'd2', label: 'Bar charts 2,5,10' }, { id: 'd3', label: 'Pictograms 5/10' }, { id: 'd4', label: 'Interpret data' }] },
    ],
  },
  4: {
    num: [
      { id: 'place4', icon: '🏠', name: 'Place Value', sub: '4-digit numbers', subtopics: [{ id: 'p1', label: 'Th/H/T/O' }, { id: 'p2', label: 'Round to 1000' }, { id: 'p3', label: 'Negative numbers' }, { id: 'p4', label: 'Roman to 100' }] },
      { id: 'add4', icon: '➕', name: 'Addition', sub: '4-digit', subtopics: [{ id: 'a1', label: '4-digit + 4-digit' }, { id: 'a2', label: 'Mental strategies' }, { id: 'a3', label: 'Estimate & check' }, { id: 'a4', label: 'Word problems' }] },
      { id: 'sub4', icon: '➖', name: 'Subtraction', sub: '4-digit', subtopics: [{ id: 's1', label: '4-digit − 4-digit' }, { id: 's2', label: 'Negative diff' }, { id: 's3', label: 'Problem solving' }] },
      { id: 'mul4', icon: '✖️', name: 'Multiplication', sub: '2-digit × 2-digit', subtopics: [{ id: 'm1', label: 'All to 12×12' }, { id: 'm2', label: '2-digit × 2-digit' }, { id: 'm3', label: '3-digit × 1-digit' }, { id: 'm4', label: 'Factor pairs' }] },
      { id: 'div4', icon: '➗', name: 'Division', sub: 'Long division', subtopics: [{ id: 'd1', label: '3-digit ÷ 1-digit' }, { id: 'd2', label: 'Long division' }, { id: 'd3', label: 'Remainder' }, { id: 'd4', label: 'Divisibility rules' }] },
      { id: 'frac4', icon: '½', name: 'Fractions', sub: 'Equivalence', subtopics: [{ id: 'f1', label: 'Equivalent fractions' }, { id: 'f2', label: 'Simplify' }, { id: 'f3', label: 'Mixed numbers' }, { id: 'f4', label: 'Compare' }] },
      { id: 'dec4', icon: '.', name: 'Decimals', sub: 'Tenths/hundredths', subtopics: [{ id: 'dc1', label: 'Decimal tenths' }, { id: 'dc2', label: 'Decimal hundredths' }, { id: 'dc3', label: 'Order decimals' }, { id: 'dc4', label: 'Add/sub decimals' }] },
      { id: 'perc4', icon: '%', name: 'Percentages', sub: 'Introduction', subtopics: [{ id: 'pct1', label: '% of 100' }, { id: 'pct2', label: 'Fraction ↔ %' }, { id: 'pct3', label: '% of quantity' }] },
    ],
    geo: [
      { id: 'shapes4', icon: '🔺', name: 'Shapes', sub: 'Properties & angles', subtopics: [{ id: 'g1', label: 'Classify quads' }, { id: 'g2', label: 'Measure angles' }, { id: 'g3', label: 'Acute/obtuse/reflex' }, { id: 'g4', label: 'Perimeter rectangles' }, { id: 'g5', label: 'Area rectangles' }] },
      { id: 'pos4', icon: '🗺️', name: 'Coordinates', sub: 'First quadrant', subtopics: [{ id: 'p1', label: 'Plot coords' }, { id: 'p2', label: 'Read coords' }, { id: 'p3', label: 'Reflect shapes' }, { id: 'p4', label: 'Translation intro' }] },
      { id: 'meas4', icon: '📏', name: 'Measure', sub: 'Perimeter, area, time', subtopics: [{ id: 'm1', label: 'Perimeter compound' }, { id: 'm2', label: 'Area compound' }, { id: 'm3', label: '24-hour clock' }, { id: 'm4', label: 'Timetables' }] },
    ],
    stat: [
      { id: 'data4', icon: '📊', name: 'Statistics', sub: 'Data analysis', subtopics: [{ id: 'd1', label: 'Bar charts' }, { id: 'd2', label: 'Line graphs' }, { id: 'd3', label: 'Mode & median' }, { id: 'd4', label: 'Interpret data sets' }] },
    ],
  },
  5: {
    num: [
      { id: 'place5', icon: '🏠', name: 'Place Value', sub: 'Up to millions', subtopics: [{ id: 'p1', label: 'Numbers to 1M' }, { id: 'p2', label: 'Negatives on line' }, { id: 'p3', label: 'Powers of 10' }, { id: 'p4', label: 'Order large numbers' }] },
      { id: 'add5', icon: '➕', name: 'Addition', sub: 'Large & decimal', subtopics: [{ id: 'a1', label: 'Add large' }, { id: 'a2', label: 'Add decimals' }, { id: 'a3', label: 'Near multiples' }, { id: 'a4', label: 'Word problems' }] },
      { id: 'sub5', icon: '➖', name: 'Subtraction', sub: 'Large & decimal', subtopics: [{ id: 's1', label: 'Subtract large' }, { id: 's2', label: 'Subtract decimals' }, { id: 's3', label: 'Neg diff' }, { id: 's4', label: 'Check subtraction' }] },
      { id: 'mul5', icon: '✖️', name: 'Multiplication', sub: 'Multi-digit', subtopics: [{ id: 'm1', label: '3-digit × 2-digit' }, { id: 'm2', label: '4-digit × 1-digit' }, { id: 'm3', label: 'Decimal × whole' }, { id: 'm4', label: 'BODMAS' }] },
      { id: 'div5', icon: '➗', name: 'Division', sub: 'Long division', subtopics: [{ id: 'd1', label: '4-digit ÷ 1-digit' }, { id: 'd2', label: '3-digit ÷ 2-digit' }, { id: 'd3', label: 'Decimal quotients' }, { id: 'd4', label: 'Averages' }] },
      { id: 'frac5', icon: '½', name: 'Fractions', sub: 'All operations', subtopics: [{ id: 'f1', label: 'Add diff denom' }, { id: 'f2', label: 'Subtract diff denom' }, { id: 'f3', label: 'Multiply × whole' }, { id: 'f4', label: 'Mixed operations' }] },
      { id: 'dec5', icon: '.', name: 'Decimals', sub: '3 decimal places', subtopics: [{ id: 'dc1', label: 'Thousandths' }, { id: 'dc2', label: '×/÷ 10,100,1000' }, { id: 'dc3', label: 'Round decimals' }, { id: 'dc4', label: 'Decimal × decimal' }] },
      { id: 'ratio5', icon: '∶', name: 'Ratio & Proportion', sub: 'Intro', subtopics: [{ id: 'r1', label: 'Ratio a:b' }, { id: 'r2', label: 'Simplify ratio' }, { id: 'r3', label: 'Proportion' }, { id: 'r4', label: 'Scale factor' }] },
      { id: 'perc5', icon: '%', name: 'Percentages', sub: 'Calculate %', subtopics: [{ id: 'pct1', label: '% of quantity' }, { id: 'pct2', label: '% inc/dec' }, { id: 'pct3', label: 'Frac/dec/%' }] },
    ],
    geo: [
      { id: 'shapes5', icon: '🔺', name: 'Shapes', sub: 'Triangles & symmetry', subtopics: [{ id: 'g1', label: 'Triangle types' }, { id: 'g2', label: 'Angles = 180°' }, { id: 'g3', label: 'Straight line angles' }, { id: 'g4', label: 'Rotational symmetry' }, { id: 'g5', label: 'Perimeter/area triangle' }] },
      { id: 'pos5', icon: '🗺️', name: 'Coordinates', sub: 'All 4 quadrants', subtopics: [{ id: 'p1', label: 'All four quadrants' }, { id: 'p2', label: 'Translate' }, { id: 'p3', label: 'Reflect x/y axis' }, { id: 'p4', label: 'Describe transforms' }] },
      { id: 'meas5', icon: '📏', name: 'Measure', sub: 'Volume & time zones', subtopics: [{ id: 'm1', label: 'Volume cm³' }, { id: 'm2', label: 'Area triangles' }, { id: 'm3', label: 'Time zones' }, { id: 'm4', label: 'Compound units' }] },
    ],
    stat: [
      { id: 'data5', icon: '📊', name: 'Statistics', sub: 'Mean, median, mode', subtopics: [{ id: 'd1', label: 'Mean average' }, { id: 'd2', label: 'Mode' }, { id: 'd3', label: 'Median' }, { id: 'd4', label: 'Line graphs' }, { id: 'd5', label: 'Probability scale' }] },
    ],
  },
  6: {
    num: [
      { id: 'place6', icon: '🏠', name: 'Place Value', sub: 'Millions & beyond', subtopics: [{ id: 'p1', label: 'Beyond 1M' }, { id: 'p2', label: 'Pos/neg integers' }, { id: 'p3', label: 'Sequences any step' }] },
      { id: 'add6', icon: '➕', name: 'Addition', sub: 'Integers & decimals', subtopics: [{ id: 'a1', label: 'Add decimals' }, { id: 'a2', label: 'Add neg + pos' }, { id: 'a3', label: 'Money amounts' }, { id: 'a4', label: 'Mental methods' }] },
      { id: 'sub6', icon: '➖', name: 'Subtraction', sub: 'Integers & decimals', subtopics: [{ id: 's1', label: 'Subtract decimals' }, { id: 's2', label: 'Neg diff' }, { id: 's3', label: 'Subtract money' }] },
      { id: 'mul6', icon: '✖️', name: 'Multiplication', sub: 'Multi-digit & decimal', subtopics: [{ id: 'm1', label: '4-digit × 2-digit' }, { id: 'm2', label: 'Decimal × decimal' }, { id: 'm3', label: 'Multiply fractions' }, { id: 'm4', label: 'Square & cube' }, { id: 'm5', label: 'BODMAS' }] },
      { id: 'div6', icon: '➗', name: 'Division', sub: 'Advanced', subtopics: [{ id: 'd1', label: '3-digit ÷ 2-digit' }, { id: 'd2', label: 'Decimal ÷ whole' }, { id: 'd3', label: 'Divide fractions' }, { id: 'd4', label: 'Mean average' }, { id: 'd5', label: 'Word problems' }] },
      { id: 'frac6', icon: '½', name: 'Fractions', sub: 'All operations', subtopics: [{ id: 'f1', label: 'Frac × frac' }, { id: 'f2', label: 'Frac ÷ whole' }, { id: 'f3', label: 'Mixed × whole' }, { id: 'f4', label: 'Frac ↔ dec ↔ %' }] },
      { id: 'ratio6', icon: '∶', name: 'Ratio & Proportion', sub: 'Advanced', subtopics: [{ id: 'r1', label: 'Unequal sharing' }, { id: 'r2', label: 'Proportion recipes' }, { id: 'r3', label: 'Direct proportion' }, { id: 'r4', label: '% change' }] },
      { id: 'alg6', icon: '🔣', name: 'Algebra Intro', sub: 'Expressions', subtopics: [{ id: 'al1', label: 'Letters for unknowns' }, { id: 'al2', label: 'Simple expressions' }, { id: 'al3', label: 'Substitution' }, { id: 'al4', label: 'One-step equations' }] },
    ],
    geo: [
      { id: 'shapes6', icon: '🔺', name: 'Shapes', sub: 'Advanced properties', subtopics: [{ id: 'g1', label: 'Angles in quad = 360°' }, { id: 'g2', label: 'Interior polygons' }, { id: 'g3', label: 'Nets of 3D' }, { id: 'g4', label: 'Circle radius/diameter' }, { id: 'g5', label: 'Area parallelogram' }] },
      { id: 'pos6', icon: '🗺️', name: 'Coordinates', sub: 'All 4 quadrants', subtopics: [{ id: 'p1', label: 'Plot all 4' }, { id: 'p2', label: 'Rotation' }, { id: 'p3', label: 'Enlargement' }, { id: 'p4', label: 'Describe transforms' }] },
      { id: 'meas6', icon: '📏', name: 'Measure', sub: 'Area, volume, circles', subtopics: [{ id: 'm1', label: 'Area circle intro' }, { id: 'm2', label: 'Volume cuboids' }, { id: 'm3', label: 'Surface area' }, { id: 'm4', label: 'Unit conversion' }] },
    ],
    stat: [
      { id: 'data6', icon: '📊', name: 'Statistics', sub: 'Full enquiry', subtopics: [{ id: 'd1', label: 'Mean/median/mode/range' }, { id: 'd2', label: 'Pie charts' }, { id: 'd3', label: 'Scatter graphs' }, { id: 'd4', label: 'Probability 0–1' }, { id: 'd5', label: 'Experimental prob' }] },
    ],
  },
};

function isCorrect(val: string, ans: number | string): boolean {
  const v = val.trim().toLowerCase().replace(/\s/g, '');
  const a = String(ans).trim().toLowerCase().replace(/\s/g, '');
  if (v === a) return true;
  if (!isNaN(+v) && !isNaN(+a) && Math.abs(+v - +a) < 0.01) return true;
  return false;
}

export default function MathPracticePage() {
  const [stage, setStage] = useState(3);
  const [strand, setStrand] = useState('num');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string | null>(null);
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [q, setQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [fb, setFb] = useState('');
  const [fbt, setFbt] = useState('');
  const [hintTxt, setHintTxt] = useState('');
  const [locked, setLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const topics = (CURRICULUM[stage] || {})[strand] || [];
  const currentTopic = topics.find(t => t.id === topicId);
  const currentSub = currentTopic?.subtopics.find(s => s.id === subtopicId);
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);

  const nextQ = useCallback(() => {
    if (!topicId || !subtopicId) return;
    setQ(genQ(stage, topicId, subtopicId, diff));
    setFb('');
    setFbt('');
    setHintTxt('');
    setLocked(false);
  }, [stage, topicId, subtopicId, diff]);

  useEffect(() => { if (topicId && subtopicId) nextQ(); }, [topicId, subtopicId, nextQ]);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); });

  const handleCheck = useCallback(() => {
    if (locked || !q) return;
    const inp = inputRef.current;
    if (!inp || !inp.value.trim()) return;
    const val = inp.value;
    const correct = isCorrect(val, q.a);
    setTotal(p => p + 1);
    if (correct) { setScore(p => p + 1); setStreak(p => p + Math.random() * 0); setStreak(s => s + 1); setFb(`✅ Excellent! ${streak >= 2 ? '🔥 Streak ' + (streak + 1) + '!' : 'Sahi jawab!'}`); setFbt('correct'); }
    else { setStreak(0); setFb(`❌ Ghalat. Sahi jawab: ${q.a}`); setFbt('wrong'); }
    setLocked(true);
    setTimeout(() => nextQ(), 1600);
  }, [locked, q, streak, nextQ]);

  const handleMCQ = useCallback((opt: string) => {
    if (locked || !q) return;
    const correct = isCorrect(opt, q.a);
    setTotal(p => p + 1);
    if (correct) { setScore(p => p + 1); setStreak(s => s + 1); setFb(`✅ Correct! ${streak >= 2 ? '🔥 Streak ' + (streak + 1) + '!' : ''}`); setFbt('correct'); }
    else { setStreak(0); setFb(`❌ Wrong. Answer: ${q.a}`); setFbt('wrong'); }
    setLocked(true);
    setTimeout(() => nextQ(), 1600);
  }, [locked, q, streak, nextQ]);

  const strandColors: Record<string, string> = { num: '#1D9E75', geo: '#185FA5', stat: '#BA7517' };
  const strandBg: Record<string, string> = { num: '#E1F5EE', geo: '#E6F1FB', stat: '#F5EDD6' };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 font-sans">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-slate-800">📐 Cambridge Primary Mathematics</h1>
          <p className="mt-0.5 text-xs text-slate-500">Ages 5–11 · Stages 1–6 · All strands</p>
          <span className="mt-1 inline-block rounded-full bg-sky-50 px-3 py-0.5 text-[11px] font-medium text-[#185FA5]">Cambridge International 0096</span>
        </div>

        {/* Stage Tabs */}
        <div className="mb-3 flex gap-1.5 overflow-x-auto">
          {STAGES.map(s => (
            <button key={s.id} onClick={() => { setStage(s.id); setTopicId(null); setSubtopicId(null); setQ(null); setFb(''); setFbt(''); setScore(0); setTotal(0); setStreak(0); }}
              className={`min-w-0 flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-colors ${stage === s.id ? 'bg-[#185FA5] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#185FA5]'}`}>
              {s.label}<br /><span className="text-[10px] opacity-80">Age {s.age}</span>
            </button>
          ))}
        </div>

        {/* Strand Tabs */}
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {STRANDS.map(s => {
            const active = strand === s.id;
            return (
              <button key={s.id} onClick={() => { setStrand(s.id); setTopicId(null); setSubtopicId(null); setQ(null); setFb(''); setFbt(''); }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${active ? 'text-white' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                style={active ? { backgroundColor: strandColors[s.id] } : {}}>
                {s.icon} {s.label}
              </button>
            );
          })}
        </div>

        {/* Topic Grid */}
        {!topicId && (
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {topics.map(t => (
              <button key={t.id} onClick={() => setTopicId(t.id)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-center transition-colors hover:border-[#1D9E75]">
                <div className="text-xl">{t.icon}</div>
                <div className="mt-1 text-xs font-bold text-slate-800 leading-tight">{t.name}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{t.sub}</div>
              </button>
            ))}
          </div>
        )}

        {/* Subtopic Row */}
        {topicId && !subtopicId && currentTopic && (
          <div>
            <button onClick={() => setTopicId(null)} className="mb-2 text-xs font-semibold text-[#1D9E75] hover:underline">← Back to topics</button>
            <h2 className="mb-2 text-sm font-bold text-slate-700">{currentTopic.icon} {currentTopic.name}</h2>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {currentTopic.subtopics.map(s => (
                <button key={s.id} onClick={() => setSubtopicId(s.id)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#1D9E75] hover:text-[#1D9E75]">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        {subtopicId && (
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="text-xs text-slate-400">Level:</span>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => { setDiff(d); if (topicId && subtopicId) setQ(genQ(stage, topicId, subtopicId, d)); }}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-colors ${diff === d ? 'bg-[#378ADD] text-white' : 'border border-slate-200 bg-white text-slate-500 hover:border-[#378ADD]'}`}>
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Practice Box */}
        {!subtopicId && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="text-3xl">📚</div>
            <div className="mt-2 text-sm text-slate-400">Stage → Strand → Topic → Subtopic select karein</div>
          </div>
        )}

        {subtopicId && q && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {/* Score Bar */}
            <div className="mb-2 flex items-center justify-center gap-4 text-xs">
              <div className="text-center"><div className="text-lg font-bold text-[#1D9E75]">{score}</div><div className="text-[10px] text-slate-400">Sahi ✓</div></div>
              <div className="text-center"><div className="text-lg font-bold text-slate-700">{total}</div><div className="text-[10px] text-slate-400">Total</div></div>
              <div className="text-center"><div className="text-lg font-bold text-[#378ADD]">{pct}%</div><div className="text-[10px] text-slate-400">Score</div></div>
              <div className="text-center"><div className="text-lg font-bold text-[#BA7517]">🔥{streak}</div><div className="text-[10px] text-slate-400">Streak</div></div>
              <button onClick={() => { setScore(0); setTotal(0); setStreak(0); }} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-400 hover:border-red-200 hover:text-red-400">Reset</button>
            </div>

            {/* Progress */}
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#1D9E75' : pct >= 40 ? '#BA7517' : '#378ADD' }} />
            </div>

            {/* Stage badge */}
            <div className="mb-2 text-center text-[10px] text-slate-400">{STAGES.find(s => s.id === stage)?.label} · {STRANDS.find(s => s.id === strand)?.label}</div>

            {/* Question */}
            <div className="mb-2 text-center text-3xl font-semibold leading-snug text-slate-900 md:text-4xl">{q.q}</div>

            {/* Hint */}
            {hintTxt && <div className="mb-2 text-center text-xs text-slate-400">💡 {hintTxt}</div>}

            {/* Input or MCQ */}
            {q.mcq ? (
              <div className="mb-2 flex flex-wrap justify-center gap-2">
                {q.mcq.map((opt, i) => (
                  <button key={i} onClick={() => handleMCQ(opt)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1D9E75] hover:bg-[#E1F5EE]"
                    style={locked && isCorrect(opt, q.a) ? { borderColor: '#1D9E75', backgroundColor: '#E1F5EE', color: '#0F6E56' } : {}}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-2 flex items-center justify-center gap-2">
                <input ref={inputRef} type="text" id="ansInput" placeholder="?" onKeyDown={e => { if (e.key === 'Enter' && !locked) handleCheck(); }}
                  className="w-24 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-center text-lg font-bold text-slate-900 outline-none focus:border-[#1D9E75] disabled:opacity-50" disabled={locked} />
                <button onClick={handleCheck} disabled={locked}
                  className="rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40">✓ Check</button>
              </div>
            )}

            {/* Feedback */}
            {fb && (
              <div className={`mb-2 text-center text-sm font-bold ${fbt === 'correct' ? 'text-[#1D9E75]' : 'text-[#D85A30]'}`}>{fb}</div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-2">
              <button onClick={() => { if (q) setHintTxt(q.hint); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-[#378ADD]">💡 Hint</button>
              <button onClick={nextQ} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-[#1D9E75]">Next ▶</button>
              <button onClick={() => { setScore(0); setTotal(0); setStreak(0); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-400">🔄 Reset</button>
            </div>
          </div>
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}
