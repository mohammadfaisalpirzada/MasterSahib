import { ImageResponse } from 'next/og';

export const alt =
  'Sukkur IBA PST & JST Test Result 2008 — Congratulations to All Selected Teachers — Compiled by Master Sahib';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #06182c 0%, #0f2d54 55%, #0c4a6e 100%)',
          padding: '44px 54px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 42,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Left Celebratory & Official Information Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Top Gold Ribbon Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                background: '#f59e0b',
                color: '#06182c',
                fontSize: 19,
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: 999,
                letterSpacing: 1.2,
              }}
            >
              CONGRATULATIONS • OFFICIAL 2008 GAZETTE
            </div>
          </div>

          {/* Main Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
            <div
              style={{
                display: 'flex',
                color: '#38bdf8',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              SCHOOL EDUCATION &amp; LITERACY DEPARTMENT, SINDH
            </div>
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 1.08,
                marginTop: 8,
              }}
            >
              Sukkur IBA PST &amp; JST Test Result 2008
            </div>
            <div
              style={{
                display: 'flex',
                color: '#fde68a',
                fontSize: 25,
                fontWeight: 700,
                marginTop: 14,
              }}
            >
              Heartiest Congratulations to All Successful Teachers of Batch 2008
            </div>
            <div
              style={{
                display: 'flex',
                color: '#cbd5e1',
                fontSize: 21,
                lineHeight: 1.38,
                marginTop: 12,
              }}
            >
              Search your Name, Father Name, Seat Number, or CNIC across all 70 official Daily Kawish gazette pages, zoom clearly, and print your official record.
            </div>
          </div>

          {/* Bottom Master Sahib Credit Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.78)',
              border: '2px solid rgba(56, 189, 248, 0.45)',
              borderRadius: 16,
              padding: '14px 22px',
              marginTop: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', color: '#f8fafc', fontSize: 21, fontWeight: 800 }}>
                Compiled by Master Sahib
              </div>
              <div style={{ display: 'flex', color: '#38bdf8', fontSize: 18, fontWeight: 700 }}>
                www.themastersahib.com/iba-result-2008
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                background: '#10b981',
                color: '#052e16',
                fontSize: 18,
                fontWeight: 800,
                padding: '10px 18px',
                borderRadius: 10,
              }}
            >
              SEARCH &amp; PRINT A4
            </div>
          </div>
        </div>

        {/* Right Visual Gazette Result Sheet Preview Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 340,
            height: 530,
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
            border: '4px solid #f59e0b',
          }}
        >
          {/* Newspaper Masthead Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderBottom: '3px solid #0f172a',
              paddingBottom: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                fontWeight: 800,
                color: '#475569',
                letterSpacing: 1,
              }}
            >
              DAILY KAWISH • JULY 2008
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 900,
                color: '#0f172a',
                marginTop: 3,
              }}
            >
              SUKKUR IBA RESULT
            </div>
            <div
              style={{
                display: 'flex',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                padding: '4px 14px',
                borderRadius: 6,
                marginTop: 6,
              }}
            >
              PST &amp; JST MERIT GAZETTE
            </div>
          </div>

          {/* Simulated Gazette Rows with Highlighted PASS Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, flex: 1 }}>
            {[
              { seat: 'BDN 00488', score: '82', highlight: false },
              { seat: 'DAD 00172', score: '70', highlight: false },
              { seat: 'HYD 02207', score: '74', highlight: true },
              { seat: 'KHI 126625', score: '76', highlight: false },
              { seat: 'LRK 64323', score: '65', highlight: false },
              { seat: 'NSH 17291', score: '77', highlight: false },
              { seat: 'SGR 83038', score: '74', highlight: false },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: row.highlight ? '#fef08a' : '#f1f5f9',
                  border: row.highlight ? '2px solid #dc2626' : '1px solid #cbd5e1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 13,
                      fontWeight: 800,
                      color: row.highlight ? '#991b1b' : '#1e293b',
                    }}
                  >
                    {row.seat}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      width: 78,
                      height: 8,
                      borderRadius: 4,
                      background: row.highlight ? '#dc2626' : '#94a3b8',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {row.score}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 4,
                    }}
                  >
                    PASS
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stamp inside Sheet */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#0f172a',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span>70 Official Pages</span>
            <span style={{ color: '#38bdf8' }}>300% Zoom</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
