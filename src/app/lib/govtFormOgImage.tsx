import { ImageResponse } from 'next/og';

import { audienceLabel, findGovtForm } from './govtFormMeta';

/**
 * Social share card for the Govt Educational Forms section.
 *
 * Draws a document/form sheet rather than the site logo, so a shared form link
 * looks like the form it points to. Everything is plain divs — no emoji and no
 * external fonts — so the image renders identically on every build.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const NAVY = '#0f2d54';
const NAVY_2 = '#2356a4';
const GOLD = '#f0b429';

/** A miniature ruled form sheet, drawn with divs. */
function FormSheet({ lines = 7 }: { lines?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 260,
        height: 340,
        background: '#ffffff',
        borderRadius: 10,
        padding: 20,
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `3px solid ${NAVY}`, paddingBottom: 10 }}>
        <div style={{ display: 'flex', width: 30, height: 30, borderRadius: 15, background: NAVY }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', width: 150, height: 8, background: NAVY, borderRadius: 2 }} />
          <div style={{ display: 'flex', width: 100, height: 6, background: '#94a3b8', borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', width: i % 3 === 0 ? 70 : 90, height: 5, background: '#cbd5e1', borderRadius: 2 }} />
            <div style={{ display: 'flex', width: i % 2 === 0 ? 220 : 180, height: 2, background: '#0f172a' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({
  badge,
  title,
  description,
  footnote,
}: {
  badge: string;
  title: string;
  description: string;
  footnote: string;
}) {
  const titleSize = title.length > 44 ? 50 : title.length > 30 ? 60 : 68;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
        padding: '56px 60px',
        alignItems: 'center',
        gap: 56,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: GOLD,
            color: NAVY,
            fontSize: 22,
            fontWeight: 700,
            padding: '8px 18px',
            borderRadius: 999,
            letterSpacing: 1,
          }}
        >
          {badge}
        </div>

        <div
          style={{
            display: 'flex',
            color: '#ffffff',
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            marginTop: 26,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            color: 'rgba(255,255,255,0.82)',
            fontSize: 26,
            lineHeight: 1.4,
            marginTop: 22,
          }}
        >
          {description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
          <div style={{ display: 'flex', width: 44, height: 4, background: GOLD }} />
          <div style={{ display: 'flex', color: '#ffffff', fontSize: 24, fontWeight: 700 }}>
            {footnote}
          </div>
        </div>
      </div>

      <FormSheet />
    </div>
  );
}

/** Share card for a single form route, e.g. '/govt-forms/no-dues-certificate'. */
export function buildOgImage(href: string) {
  const item = findGovtForm(href);
  const badge = item?.audience ? audienceLabel[item.audience].toUpperCase() : 'GOVT FORM';
  const raw = item?.shareDescription || item?.description || '';
  const description = raw.length > 130 ? `${raw.slice(0, 127)}…` : raw;

  return new ImageResponse(
    (
      <Card
        badge={badge}
        title={item?.title || 'Govt Educational Form'}
        description={description}
        footnote="Free A4 print / PDF — themastersahib.com"
      />
    ),
    ogSize,
  );
}

/** Share card for the /govt-forms landing page. */
export function buildSectionOgImage(readyCount: number) {
  return new ImageResponse(
    (
      <Card
        badge="THE MASTER SAHIB"
        title="Govt Educational Forms"
        description={`${readyCount} ready-to-print official forms for Sindh government schools — admission, no dues, bonafide, TC, leave, pension and AG Sindh payroll forms.`}
        footnote="Free A4 print / PDF — themastersahib.com/govt-forms"
      />
    ),
    ogSize,
  );
}
