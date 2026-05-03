'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FB_PAGE_URL = 'https://www.facebook.com/nishtarroadschool';
const FB_EMBED_SRC = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FB_PAGE_URL)}&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;

type NoticeItem = {
  id: number;
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
};

type FacultyItem = {
  name: string;
  designation: string;
  subject: string;
  initials: string;
  bg: string;
  picture?: string;
};

const fallbackSlides = ['/images/nishtarroad_hero_section_image.jpg'];

const eligibility = [
  { icon: '📋', title: 'Admission Classes',      desc: 'Admissions are open from ECE to IX only. School runs from ECE to X.' },
  { icon: '📄', title: 'Required Documents',  desc: 'B-Form / CNIC copy, last class result card, vaccination certificate, 2 passport photos.' },
  { icon: '🏫', title: 'Admission Process',   desc: 'Visit the school office on any working day. Office hours: 8:00 AM - 1:00 PM.' },
  { icon: '✅', title: 'Eligibility',          desc: 'Only female students. Residence in Karachi preferred. Priority to local area residents.' },
];

const navLinks = [
  { label: 'Home',         href: '#hero' },
  { label: 'Notices',      href: '#notices' },
  { label: 'Admissions',   href: '#admissions' },
  { label: 'Faculty',      href: '#faculty' },
  { label: 'Contact',      href: '#contact' },
  { label: 'Facebook',     href: '#facebook' },
];

export default function GgssNishtarRoadLandingPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [slides, setSlides] = useState<string[]>(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  const tickerItems = notices.slice(0, 5).map((item) => `${item.tag}: ${item.title}`);
  const facultyMidpoint = Math.ceil(faculty.length / 2);
  const facultyRowOne = faculty.slice(0, facultyMidpoint);
  const facultyRowTwo = faculty.slice(facultyMidpoint);
  const facultyRowTwoResolved = facultyRowTwo.length > 0 ? facultyRowTwo : facultyRowOne;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name darj karein';
    if (!form.phone.trim()) errs.phone = 'Phone number darj karein';
    else if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) errs.phone = 'Durust phone number darj karein (e.g. 03001234567)';
    if (!form.message.trim()) errs.message = 'Message darj karein';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
    setForm({ name: '', phone: '', message: '' });
  };

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await fetch('/api/ggss-site-data?type=announcements', { cache: 'no-store' });
        const payload = (await response.json()) as { success?: boolean; items?: NoticeItem[] };
        if (payload.success && Array.isArray(payload.items)) {
          setNotices(payload.items);
        }
      } catch {
        // leave empty on failure
      } finally {
        setNoticesLoading(false);
      }
    };

    const loadTeachers = async () => {
      try {
        const response = await fetch('/api/ggss-site-data?type=teachers', { cache: 'no-store' });
        const payload = (await response.json()) as { success?: boolean; items?: FacultyItem[] };
        if (payload.success && Array.isArray(payload.items)) {
          setFaculty(payload.items);
        } else {
          setFaculty([]);
        }
      } catch {
        setFaculty([]);
      } finally {
        setFacultyLoading(false);
      }
    };

    const loadGalleryImages = async () => {
      try {
        const response = await fetch('/api/ggss-gallery', { cache: 'no-store' });
        const payload = (await response.json()) as { success?: boolean; images?: string[] };
        if (payload.success && Array.isArray(payload.images) && payload.images.length > 0) {
          setSlides(payload.images);
          setActiveSlide(0);
        }
      } catch {
        // Keep fallback slide on failure.
      }
    };

    void loadAnnouncements();
    void loadTeachers();
    void loadGalleryImages();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [slides]);

  return (
    <main className="min-h-screen" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f0f4f8' }}>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { display: flex; gap: 60px; animation: ticker 35s linear infinite; white-space: nowrap; }
        @keyframes facultyMarqueeLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes facultyMarqueeRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .faculty-marquee { overflow: hidden; }
        .faculty-track { display: flex; gap: 12px; width: max-content; padding: 6px 0; }
        .faculty-track-left { animation: facultyMarqueeLeft 30s linear infinite; }
        .faculty-track-right { animation: facultyMarqueeRight 34s linear infinite; }
        .faculty-marquee:hover .faculty-track { animation-play-state: paused; }
        @media (max-width: 640px) {
          .faculty-track-left { animation-duration: 22s; }
          .faculty-track-right { animation-duration: 26s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .faculty-track-left, .faculty-track-right { animation: none; }
        }
      `}</style>

      {/* TOP HEADER BAR */}
      <div style={{ backgroundColor: '#1a3a6b', borderBottom: '3px solid #c8a96e' }} className="px-4 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p style={{ color: '#c8a96e', fontSize: '11px', letterSpacing: '0.05em' }} className="font-semibold uppercase hidden sm:block">
            Government of Sindh · Education Department
          </p>
          <p style={{ color: '#c8a96e', fontSize: '11px' }} className="font-semibold sm:hidden">
            Govt of Sindh · Education Dept
          </p>
          <Link href="/ggss-nishtar-road/staff-portal" style={{ background: 'linear-gradient(135deg, #c8a96e, #e8c98e)', color: '#1a3a6b', fontWeight: 700, borderRadius: '8px', padding: '5px 14px', fontSize: '12px', whiteSpace: 'nowrap' }} className="transition hover:opacity-90">
            Staff Portal
          </Link>
        </div>
      </div>

      {/* STICKY NAVBAR */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #dce3ec', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <Image src="/images/ggssnishtar_mastersahib.png" alt="GGSS Logo" width={38} height={38} className="object-contain" style={{ width: '38px', height: '38px' }} />
            <div>
              <p style={{ color: '#1a3a6b', fontWeight: 800, fontSize: '13px', lineHeight: '1.2' }}>GGSS Nishtar Road</p>
              <p style={{ color: '#64748b', fontSize: '10px' }}>Karachi, Sindh</p>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} style={{ color: '#1a3a6b', fontWeight: 600, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }} className="hover:bg-blue-50 transition">
                {l.label}
              </a>
            ))}
          </div>
          <button className="md:hidden p-2 flex flex-col gap-1.5" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#1a3a6b', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#1a3a6b', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#1a3a6b', borderRadius: '2px' }} />
          </button>
        </div>
        {menuOpen && (
          <div style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0' }} className="md:hidden px-4 pb-3">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', color: '#1a3a6b', fontWeight: 600, fontSize: '14px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" style={{ background: 'linear-gradient(135deg, #0f2447 0%, #1a3a6b 40%, #2356a4 70%, #1a3a6b 100%)', position: 'relative', overflow: 'hidden' }} className="px-4 py-10 sm:py-14">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(200,169,110,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="mx-auto max-w-5xl relative">
          {/* Mobile: logos top row, text below */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-4 px-2">
              <Image src="/images/ggssnishtar_mastersahib.png" alt="GGSS Logo" width={72} height={72} className="object-contain" style={{ width: '64px', height: '64px' }} priority />
              <Image src="/images/Logo_Government_of_Sindh_Pakistan.png" alt="Sindh Logo" width={64} height={64} className="object-contain" style={{ width: '56px', height: '56px' }} />
            </div>
          </div>

          {/* Desktop: text between logos */}
          <div className="hidden sm:flex items-center gap-8">
            <Image src="/images/ggssnishtar_mastersahib.png" alt="GGSS Logo" width={115} height={115} className="object-contain shrink-0" style={{ width: '110px', height: '110px' }} priority />
            <div className="text-center flex-1">
            <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.25em', fontWeight: 600 }} className="uppercase mb-3">
              Government Girls Secondary School
            </p>
            <h1 style={{ color: '#ffffff', fontWeight: 900, lineHeight: '1.05' }} className="text-5xl lg:text-6xl mb-3">
              GGSS Nishtar Road
            </h1>
            <p style={{ color: '#a8c4e0', fontSize: '16px' }} className="mb-5">
              Nishtar Road, Karachi - Sindh, Pakistan - Est. 1960s
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-5">
              {[
                { val: '500+', label: 'Students' },
                { val: '30+',  label: 'Teachers' },
                { val: 'ECE-X', label: 'Classes'  },
                { val: 'Free', label: 'Education' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center', minWidth: '80px' }}>
                  <p style={{ color: '#c8a96e', fontWeight: 800, fontSize: '20px' }}>{s.val}</p>
                  <p style={{ color: '#a8c4e0', fontSize: '12px' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#admissions" style={{ background: 'linear-gradient(135deg, #c8a96e, #e8c98e)', color: '#1a3a6b', fontWeight: 800, borderRadius: '14px', padding: '12px 22px', fontSize: '14px', display: 'inline-block', boxShadow: '0 6px 20px rgba(200,169,110,0.4)' }} className="transition hover:opacity-90 hover:-translate-y-1">
                Apply Now for Admission
              </a>
              <a href="#notices" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, borderRadius: '14px', padding: '12px 22px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-block' }} className="transition hover:bg-white/20">
                Latest Notices
              </a>
            </div>
            </div>
            <Image src="/images/Logo_Government_of_Sindh_Pakistan.png" alt="Sindh Logo" width={105} height={105} className="object-contain shrink-0" style={{ width: '100px', height: '100px' }} />
          </div>

          {/* Mobile text block */}
          <div className="sm:hidden text-center">
            <p style={{ color: '#c8a96e', fontSize: '11px', letterSpacing: '0.18em', fontWeight: 600 }} className="uppercase mb-2">
              Government Girls Secondary School
            </p>
            <h1 style={{ color: '#ffffff', fontWeight: 900, lineHeight: '1.1' }} className="text-4xl mb-2">
              GGSS Nishtar Road
            </h1>
            <p style={{ color: '#a8c4e0', fontSize: '14px' }} className="mb-4">
              Nishtar Road, Karachi - Sindh, Pakistan - Est. 1960s
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[
                { val: '500+', label: 'Students' },
                { val: '30+',  label: 'Teachers' },
                { val: 'ECE-X', label: 'Classes'  },
                { val: 'Free', label: 'Education' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: '10px', padding: '8px 12px', textAlign: 'center', minWidth: '72px' }}>
                  <p style={{ color: '#c8a96e', fontWeight: 800, fontSize: '16px' }}>{s.val}</p>
                  <p style={{ color: '#a8c4e0', fontSize: '10px' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#admissions" style={{ background: 'linear-gradient(135deg, #c8a96e, #e8c98e)', color: '#1a3a6b', fontWeight: 800, borderRadius: '12px', padding: '10px 16px', fontSize: '13px', display: 'inline-block' }}>
                Apply Now
              </a>
              <a href="#notices" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, borderRadius: '12px', padding: '10px 16px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-block' }}>
                Notices
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS TICKER */}
      <div style={{ backgroundColor: '#c8a96e', overflow: 'hidden', padding: '8px 0' }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ADMISSION BANNER IMAGE */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div style={{ backgroundColor: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #dce3ec', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'relative' }}>
            <Image
              src={slides[activeSlide] || fallbackSlides[0]}
              alt="GGSS Nishtar Road slideshow image"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
            {slides.length > 1 && (
              <div style={{ position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)', display: 'flex', gap: '8px', background: 'rgba(15,36,71,0.5)', borderRadius: '999px', padding: '6px 10px' }}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: 'none',
                      background: index === activeSlide ? '#ffffff' : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NOTICE BOARD */}
      <section id="notices" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }} className="uppercase mb-2">Stay Updated</p>
            <h2 style={{ color: '#1a3a6b', fontWeight: 900, fontSize: '28px' }}>Notice Board</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Latest announcements, exam schedules, and school news</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {noticesLoading ? (
              <div className="col-span-full rounded-2xl border p-6 text-center" style={{ borderColor: '#dce3ec', background: '#fff', color: '#64748b' }}>
                Loading notices...
              </div>
            ) : notices.length === 0 ? (
              <div className="col-span-full rounded-2xl border p-6 text-center" style={{ borderColor: '#dce3ec', background: '#fff', color: '#64748b' }}>
                No notices found in Google Sheet.
              </div>
            ) : (
            notices.map((n) => (
              <div key={n.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #dce3ec', borderLeft: '4px solid #1a3a6b', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} className="transition hover:shadow-md hover:-translate-y-0.5">
                <div className="mb-3 flex items-center gap-2">
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }} className={n.tagColor}>{n.tag}</span>
                  <span style={{ color: '#334155', fontSize: '11px', fontWeight: 500 }}>{n.date}</span>
                </div>
                <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{n.title}</p>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{n.desc}</p>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* ADMISSIONS */}
      <section id="admissions" style={{ backgroundColor: '#1a3a6b' }} className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }} className="uppercase mb-2">Enroll Today</p>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '28px' }}>Admissions Information</h2>
            <p style={{ color: '#a8c4e0', fontSize: '14px', marginTop: '8px' }}>No admission fee, no tuition fee, and no exam fee - Session 2026-27</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {eligibility.map((e) => (
              <div key={e.title} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: '14px', padding: '22px' }}>
                <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>{e.icon}</span>
                <p style={{ color: '#c8a96e', fontWeight: 700, fontSize: '14px', marginBottom: '7px' }}>{e.title}</p>
                <p style={{ color: '#a8c4e0', fontSize: '12px', lineHeight: '1.7' }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACULTY */}
      <section id="faculty" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }} className="uppercase mb-2">Our Team</p>
            <h2 style={{ color: '#1a3a6b', fontWeight: 900, fontSize: '28px' }}>Faculty Directory</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Dedicated and qualified teaching staff</p>
          </div>
          <div>
            {facultyLoading ? (
              <div className="rounded-2xl border p-6 text-center" style={{ borderColor: '#dce3ec', background: '#fff', color: '#64748b' }}>
                Loading faculty directory...
              </div>
            ) : faculty.length === 0 ? (
              <div className="rounded-2xl border p-6 text-center" style={{ borderColor: '#dce3ec', background: '#fff', color: '#64748b' }}>
                No faculty data found in Google Sheet.
              </div>
            ) : (
              <div className="faculty-marquee space-y-3">
                <div className="faculty-track faculty-track-left">
                  {[...facultyRowOne, ...facultyRowOne].map((f, idx) => (
                    <div key={`${f.name}-r1-${idx}`} style={{ width: '188px', minWidth: '188px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #dce3ec', padding: '14px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} className="transition hover:shadow-md hover:-translate-y-0.5">
                      {f.picture ? (
                        <div style={{ width: '58px', height: '58px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid #e2e8f0' }}>
                          <img
                            src={f.picture.startsWith('data:') ? f.picture : `data:image/jpeg;base64,${f.picture}`}
                            alt={f.name}
                            width={58}
                            height={58}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div style={{ width: '58px', height: '58px', borderRadius: '50%', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: f.initials.length <= 2 ? '20px' : f.initials.length === 3 ? '16px' : '12px', letterSpacing: '1px' }}>{f.initials}</span>
                        </div>
                      )}
                      <p style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '12px', marginBottom: '3px', lineHeight: '1.25' }}>{f.name}</p>
                      <p style={{ color: '#c8a96e', fontSize: '10px', fontWeight: 600, marginBottom: '3px' }}>{f.designation}</p>
                      <p style={{ color: '#64748b', fontSize: '10px' }}>{f.subject}</p>
                    </div>
                  ))}
                </div>
                <div className="faculty-track faculty-track-right">
                  {[...facultyRowTwoResolved, ...facultyRowTwoResolved].map((f, idx) => (
                    <div key={`${f.name}-r2-${idx}`} style={{ width: '188px', minWidth: '188px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #dce3ec', padding: '14px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} className="transition hover:shadow-md hover:-translate-y-0.5">
                      {f.picture ? (
                        <div style={{ width: '58px', height: '58px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid #e2e8f0' }}>
                          <img
                            src={f.picture.startsWith('data:') ? f.picture : `data:image/jpeg;base64,${f.picture}`}
                            alt={f.name}
                            width={58}
                            height={58}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div style={{ width: '58px', height: '58px', borderRadius: '50%', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: f.initials.length <= 2 ? '20px' : f.initials.length === 3 ? '16px' : '12px', letterSpacing: '1px' }}>{f.initials}</span>
                        </div>
                      )}
                      <p style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '12px', marginBottom: '3px', lineHeight: '1.25' }}>{f.name}</p>
                      <p style={{ color: '#c8a96e', fontSize: '10px', fontWeight: 600, marginBottom: '3px' }}>{f.designation}</p>
                      <p style={{ color: '#64748b', fontSize: '10px' }}>{f.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT + FACEBOOK */}
      <section style={{ backgroundColor: '#f8fafc' }} className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_440px]">

            {/* Contact Form */}
            <div id="contact">
              <div className="mb-8">
                <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }} className="uppercase mb-2">Get In Touch</p>
                <h2 style={{ color: '#1a3a6b', fontWeight: 900, fontSize: '28px' }}>Contact Us</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>We are here to help. Send us a message and we will respond promptly.</p>
              </div>
              {submitted ? (
                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                  <span style={{ fontSize: '52px', display: 'block', marginBottom: '12px' }}>✅</span>
                  <p style={{ color: '#166534', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>Message Sent Successfully!</p>
                  <p style={{ color: '#16a34a', fontSize: '14px' }}>We will get back to you shortly.</p>
                  <button onClick={() => setSubmitted(false)} style={{ marginTop: '16px', color: '#166534', fontWeight: 600, fontSize: '13px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #dce3ec', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} noValidate>
                  <div className="mb-5">
                    <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Apna naam likhein"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
                    />
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errors.name}</p>}
                  </div>
                  <div className="mb-5">
                    <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', border: errors.phone ? '2px solid #ef4444' : '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
                    />
                    {errors.phone && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errors.phone}</p>}
                  </div>
                  <div className="mb-6">
                    <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Message *</label>
                    <textarea
                      placeholder="Apna sawal ya message likhein..."
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', border: errors.message ? '2px solid #ef4444' : '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#1e293b' }}
                    />
                    {errors.message && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errors.message}</p>}
                  </div>
                  <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #1a3a6b, #2356a4)', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,58,107,0.3)' }} className="transition hover:opacity-90">
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Facebook */}
            <div id="facebook">
              <div className="mb-8">
                <p style={{ color: '#c8a96e', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }} className="uppercase mb-2">Follow Us</p>
                <h2 style={{ color: '#1a3a6b', fontWeight: 900, fontSize: '28px' }}>School Facebook</h2>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #dce3ec', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #1877f2, #4299e1)', padding: '12px 16px' }} className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>GGSS Nishtar Road</span>
                  <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                    Follow
                  </a>
                </div>
                <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
                  <div style={{ height: '700px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <iframe
                      src={FB_EMBED_SRC}
                      width="500"
                      height="700"
                      style={{ border: 'none', overflow: 'hidden', display: 'block', width: '100%' }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      title="GGSS Nishtar Road Facebook Page"
                    />
                  </div>
                  <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', inset: 0, zIndex: 10 }} aria-label="Open GGSS Facebook page" />
                </div>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #dce3ec', textAlign: 'center' }}>
                  <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontSize: '12px', fontWeight: 600 }}>
                    View full page on Facebook
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'linear-gradient(135deg, #0f2447, #1a3a6b)', borderTop: '3px solid #c8a96e' }} className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3 mb-8">

            {/* School Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/ggssnishtar_mastersahib.png" alt="GGSS Logo" width={48} height={48} className="object-contain" style={{ width: '48px', height: '48px' }} />
                <div>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>GGSS Nishtar Road</p>
                  <p style={{ color: '#c8a96e', fontSize: '11px' }}>Est. 1960s</p>
                </div>
              </div>
              <p style={{ color: '#a8c4e0', fontSize: '12px', lineHeight: '1.8' }}>
                Government Girls Secondary School providing free quality education to girls of Karachi since the 1960s under Sindh Education Department.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <p style={{ color: '#c8a96e', fontWeight: 700, fontSize: '13px', marginBottom: '16px', letterSpacing: '0.08em' }}>CONTACT INFO</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span style={{ color: '#c8a96e', fontSize: '15px', marginTop: '1px' }}>📍</span>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '12px', lineHeight: '1.7' }}>Nishtar Road, Karachi<br />Sindh, Pakistan</p>
                    <a href="https://maps.google.com/?q=GGSS+Nishtar+Road+Karachi" target="_blank" rel="noopener noreferrer" style={{ color: '#c8a96e', fontSize: '11px', fontWeight: 600 }}>
                      View on Google Maps
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: '#c8a96e', fontSize: '15px' }}>📞</span>
                  <p style={{ color: '#a8c4e0', fontSize: '12px' }}>021-XXXXXXXX</p>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: '#c8a96e', fontSize: '15px' }}>🏫</span>
                  <p style={{ color: '#a8c4e0', fontSize: '12px' }}>SEMIS Code: 408070227</p>
                </div>
              </div>
            </div>

            {/* Quick Links + Social */}
            <div>
              <p style={{ color: '#c8a96e', fontWeight: 700, fontSize: '13px', marginBottom: '16px', letterSpacing: '0.08em' }}>QUICK LINKS</p>
              <div className="space-y-2 mb-6">
                {[
                  { label: 'Notice Board',  href: '#notices' },
                  { label: 'Admissions',    href: '#admissions' },
                  { label: 'Faculty',       href: '#faculty' },
                  { label: 'Stipend Portal', href: '/ggss-nishtar-road/stipend' },
                  // { label: 'Staff Portal',  href: '/ggss-nishtar-road/admin' },
                ].map((l) => (
                  <a key={l.label} href={l.href} style={{ display: 'block', color: '#a8c4e0', fontSize: '12px' }} className="hover:text-white transition">
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="flex gap-3">
                <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#1877f2', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-80 transition" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#4a6fa5', fontSize: '11px' }}>2026 GGSS Nishtar Road - All rights reserved</p>
            <p style={{ color: '#4a6fa5', fontSize: '11px' }}>Powered by <span style={{ color: '#c8a96e' }}>TheMasterSahib</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
