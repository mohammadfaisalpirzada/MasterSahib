'use client';

import { useState } from 'react';
import { HiCheck } from 'react-icons/hi';
import type { ChapterBlock } from '../_lib/parseBlocks';
import { smartCase, hasUrdu } from '../_lib/text';
import { SpeakButton, SpeakableText, sentenceItems, type SpeakItem } from './Speech';
import css from '../reader.module.css';

type Props = {
  blocks: ChapterBlock[];
  urduChapter: boolean;
  practice: boolean;
};

const dirFor = (isUrdu: boolean) => (isUrdu ? 'rtl' : 'ltr');

/** A table cell / vocab word with its 🔊 in front. */
function Cell({ id, text, strong = false }: { id: string; text: string; strong?: boolean }) {
  if (!text) return <span className="text-[var(--ink-faint)]">—</span>;
  const urdu = hasUrdu(text);
  return (
    <span className={`inline-flex items-start gap-2 ${urdu ? css.urdu : ''}`} dir={dirFor(urdu)}>
      <SpeakButton id={id} text={text} className="mt-[0.2em]" />
      <span className={strong ? 'font-bold' : ''}>{text}</span>
    </span>
  );
}

function Answer({ id, text, isUrdu, practice }: { id: string; text: string; isUrdu: boolean; practice: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const covered = practice && !revealed;
  return (
    <div
      className={`rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 ${covered ? css.cover : ''}`}
      dir={dirFor(isUrdu)}
    >
      <p className="mb-1 flex items-center gap-1.5 text-[13px] font-bold text-[var(--accent-strong)]">
        <HiCheck className="h-4 w-4" aria-hidden /> Answer
      </p>
      <div className={covered ? css.coverContent : ''} aria-hidden={covered}>
        <p className={isUrdu ? css.urdu : ''}>
          <SpeakableText id={id} text={text} />
        </p>
      </div>
      {covered && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center rounded-2xl text-sm font-bold text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          <span className="rounded-full border border-[var(--accent)] bg-[var(--page)] px-4 py-1.5 shadow-sm">
            Tap to see the answer
          </span>
        </button>
      )}
    </div>
  );
}

/** Responsive table: real table from tablets up, one card per row on phones. */
function DataTable({ id, headers, rows }: { id: string; headers: string[]; rows: string[][] }) {
  const sNo = /^(s\.?\s?no|sr\.?\s?no)\.?$/i.test(headers[0] || '');
  // Short word tables (opposites, plurals, verb forms, prefixes) stay a real table even on phones;
  // only long, sentence-filled tables turn into one card per row.
  const longest = Math.max(...rows.flat().map((c) => c.length), 0);
  const compact = headers.length <= 3 && longest <= 22;
  return (
    <div className="my-5">
      <div className={`${compact ? '' : 'hidden sm:block'} overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--page)]`}>
        <table className="w-full border-collapse text-left text-[0.95em]">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--accent-soft)]">
              {headers.map((h, c) => (
                <th
                  key={c}
                  scope="col"
                  className={`px-3 py-2.5 align-bottom text-[0.85em] font-bold text-[var(--accent-strong)] sm:px-4 sm:py-3 ${sNo && c === 0 ? 'w-14' : ''} ${hasUrdu(h) ? css.urdu : ''}`}
                  dir={dirFor(hasUrdu(h))}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-[var(--line)] last:border-0 even:bg-[var(--paper)]/60">
                {row.map((cell, c) => (
                  <td key={c} className={`px-3 py-2.5 align-top sm:px-4 sm:py-3 ${c === 0 ? 'font-semibold' : ''}`}>
                    {sNo && c === 0 ? <span className="text-[var(--ink-faint)]">{cell}</span> : <Cell id={`${id}-r${r}-c${c}`} text={cell} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol className={`space-y-2.5 sm:hidden ${compact ? 'hidden' : ''}`}>
        {rows.map((row, r) => {
          const first = sNo ? 1 : 0;
          return (
            <li key={r} className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-3.5">
              <div className="flex items-start gap-2.5">
                {sNo && (
                  <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--accent-soft)] px-1.5 text-xs font-bold text-[var(--accent-strong)]">
                    {row[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1 text-[1.02em] font-bold">
                  <Cell id={`${id}-r${r}-c${first}`} text={row[first]} />
                </div>
              </div>
              <dl className="mt-2 space-y-1.5 border-t border-[var(--line)] pt-2">
                {row.slice(first + 1).map((cell, k) => {
                  const c = first + 1 + k;
                  return (
                    <div key={c}>
                      <dt className="text-[12px] font-semibold text-[var(--ink-faint)]">{headers[c]}</dt>
                      <dd className="text-[0.97em]">
                        <Cell id={`${id}-r${r}-c${c}`} text={cell} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ChapterBlocks({ blocks, urduChapter, practice }: Props) {
  return (
    <>
      {blocks.map((block, idx) => {
        const id = `b${idx}`;
        const urdu = 'isUrdu' in block ? block.isUrdu || (urduChapter && hasUrdu((block as { text?: string; title?: string }).text || (block as { title?: string }).title || '')) : false;

        switch (block.type) {
          case 'series':
            return null; // shown as the chapter title / lessons in the header instead

          case 'divider':
            return <hr key={idx} className="my-8 border-[var(--line)]" />;

          case 'section':
            return (
              <h2
                key={idx}
                id={block.id}
                className={`${css.anchor} mt-12 mb-4 flex items-start gap-3 text-[1.35em] font-bold leading-snug text-[var(--ink)] first:mt-2`}
                dir={dirFor(urdu)}
              >
                {block.number && (
                  <span className="mt-[0.1em] flex h-[1.6em] min-w-[1.6em] items-center justify-center rounded-lg bg-[var(--accent)] px-1.5 text-[0.75em] font-bold text-white">
                    {block.number}
                  </span>
                )}
                <span className={`flex-1 ${urdu ? css.urdu : ''}`}>
                  <SpeakButton id={id} text={smartCase(block.title)} className="me-2 align-middle" />
                  {smartCase(block.title)}
                </span>
              </h2>
            );

          case 'subsection':
            return (
              <h3
                key={idx}
                id={block.id}
                className={`${css.anchor} mt-8 mb-3 border-s-4 border-[var(--accent)] ps-3 text-[1.12em] font-bold leading-snug`}
                dir={dirFor(urdu)}
              >
                <span className={urdu ? css.urdu : ''}>
                  <SpeakButton id={id} text={smartCase(block.title)} className="me-2 align-middle" />
                  {smartCase(block.title)}
                </span>
              </h3>
            );

          case 'vocab':
            return (
              <div key={idx} className="my-5">
                <div className="hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--page)] md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[var(--line)] bg-[var(--accent-soft)] text-[0.85em] text-[var(--accent-strong)]">
                        <th scope="col" className="w-[24%] px-4 py-3 font-bold">Word</th>
                        <th scope="col" className="w-[26%] px-4 py-3 text-right font-bold">
                          <span className={css.urdu}>اردو معنی</span> <span className="text-[0.9em] font-semibold">Urdu meaning</span>
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold">Use in a sentence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.items.map((it, r) => (
                        <tr key={r} className="border-b border-[var(--line)] last:border-0">
                          <td className="px-4 py-3 align-top text-[1.05em] text-[var(--ink)]">
                            <Cell id={`${id}-r${r}-w`} text={it.word} strong />
                          </td>
                          <td className="px-4 py-3 text-right align-top text-[var(--accent-strong)]">
                            <Cell id={`${id}-r${r}-m`} text={it.meaning} />
                          </td>
                          <td className="px-4 py-3 align-top text-[var(--ink-soft)]">
                            <Cell id={`${id}-r${r}-s`} text={it.sentence} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="space-y-2.5 md:hidden">
                  {block.items.map((it, r) => (
                    <li key={r} className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span className="text-[1.1em]">
                          <Cell id={`${id}-r${r}-w`} text={it.word} strong />
                        </span>
                        <span className="text-[var(--accent-strong)]">
                          <Cell id={`${id}-r${r}-m`} text={it.meaning} />
                        </span>
                      </div>
                      {it.sentence && (
                        <p className="mt-2 border-t border-[var(--line)] pt-2 text-[0.95em] text-[var(--ink-soft)]">
                          <Cell id={`${id}-r${r}-s`} text={it.sentence} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'dictation':
            return (
              <ul key={idx} className="my-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {block.items.map((it, d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--page)] px-3.5 py-2.5"
                  >
                    <Cell id={`${id}-d${d}-w`} text={it.word} strong />
                    {it.meaning && (
                      <span className="text-[var(--accent-strong)]">
                        <Cell id={`${id}-d${d}-m`} text={it.meaning} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            );

          case 'table':
            return <DataTable key={idx} id={id} headers={block.headers} rows={block.rows} />;

          case 'facts':
            return (
              <dl key={idx} className="my-5 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-6 gap-y-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                {block.items.map((f, k) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-[12px] font-semibold text-[var(--ink-faint)]">{f.label}</dt>
                    <dd className="font-semibold">
                      <Cell id={`${id}-f${k}`} text={f.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            );

          case 'question':
            return (
              <div key={idx} className="mt-7 mb-2 flex items-start gap-3" dir={dirFor(urdu)}>
                <span className="mt-[0.15em] shrink-0 rounded-lg bg-[var(--pen-soft)] px-2 py-0.5 text-[0.8em] font-bold text-[var(--pen)]">
                  {block.label}
                </span>
                <p className={`flex-1 font-bold ${urdu ? css.urdu : ''}`}>
                  <SpeakableText id={id} text={block.text} />
                </p>
              </div>
            );

          case 'answer':
            return <Answer key={idx} id={id} text={block.text} isUrdu={urdu} practice={practice} />;

          case 'solved':
            return (
              <p key={idx} className={`my-1 flex items-start gap-2 ps-1 text-[var(--accent-strong)] ${urdu ? css.urdu : ''}`} dir={dirFor(urdu)}>
                <HiCheck className="mt-[0.3em] h-4 w-4 shrink-0" aria-label="Solved" />
                <span className="flex-1">
                  <SpeakableText id={id} text={block.text} />
                </span>
              </p>
            );

          case 'numbered':
            return (
              <div key={idx} className="mt-4 flex items-start gap-3" dir={dirFor(urdu)}>
                <span className="mt-[0.15em] flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--page)] px-1 text-xs font-bold text-[var(--ink-soft)]">
                  {block.number}
                </span>
                <p className={`flex-1 ${urdu ? css.urdu : ''}`}>
                  <SpeakableText id={id} text={block.text} />
                </p>
              </div>
            );

          case 'callout':
            return (
              <aside key={idx} className="my-5 rounded-2xl bg-[var(--marker-soft)] px-4 py-3" dir={dirFor(urdu)}>
                <p className="mb-1 text-[13px] font-bold text-[var(--ink)]">{block.label}</p>
                <p className={urdu ? css.urdu : ''}>
                  <SpeakableText id={id} text={block.text} />
                </p>
              </aside>
            );

          case 'bullet':
            return (
              <div key={idx} className="my-1.5 flex items-start gap-3 ps-1" dir={dirFor(urdu)}>
                <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                <p className={`flex-1 ${urdu ? css.urdu : ''}`}>
                  <SpeakableText id={id} text={block.text} />
                </p>
              </div>
            );

          case 'heading':
            return (
              <h4 key={idx} className={`mt-6 mb-2 text-[1.05em] font-bold ${urdu ? css.urdu : ''}`} dir={dirFor(urdu)}>
                <SpeakButton id={id} text={block.text} className="me-2 align-middle" />
                {smartCase(block.text)}
              </h4>
            );

          default:
            return (
              <p key={idx} className={`my-3 ${urdu ? css.urdu : ''}`} dir={dirFor(urdu)}>
                <SpeakableText id={id} text={block.text} />
              </p>
            );
        }
      })}
    </>
  );
}

/** Everything readable, in reading order, for "Listen to this chapter" (keys match the buttons). */
export function blockSpeakItems(blocks: ChapterBlock[]): SpeakItem[] {
  const items: SpeakItem[] = [];
  blocks.forEach((b, idx) => {
    const id = `b${idx}`;
    switch (b.type) {
      case 'section':
      case 'subsection':
        items.push({ key: id, text: smartCase(b.title) });
        break;
      case 'heading':
        items.push({ key: id, text: b.text });
        break;
      case 'vocab':
        b.items.forEach((it, r) => {
          items.push({ key: `${id}-r${r}-w`, text: it.word });
          if (it.meaning) items.push({ key: `${id}-r${r}-m`, text: it.meaning });
          if (it.sentence) items.push({ key: `${id}-r${r}-s`, text: it.sentence });
        });
        break;
      case 'dictation':
        b.items.forEach((it, d) => {
          items.push({ key: `${id}-d${d}-w`, text: it.word });
          if (it.meaning) items.push({ key: `${id}-d${d}-m`, text: it.meaning });
        });
        break;
      case 'facts':
        b.items.forEach((f, k) => items.push({ key: `${id}-f${k}`, text: `${f.label}: ${f.value}` }));
        break;
      case 'table': {
        const sNo = /^(s\.?\s?no|sr\.?\s?no)\.?$/i.test(b.headers[0] || '');
        b.rows.forEach((row, r) =>
          row.forEach((cell, c) => {
            if (cell && !(sNo && c === 0)) items.push({ key: `${id}-r${r}-c${c}`, text: cell });
          })
        );
        break;
      }
      case 'question':
      case 'answer':
      case 'solved':
      case 'numbered':
      case 'callout':
      case 'bullet':
      case 'paragraph':
        items.push(...sentenceItems(id, b.text));
        break;
      default:
        break;
    }
  });
  return items;
}
