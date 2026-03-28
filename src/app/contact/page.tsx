"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const ContactPage = () => {
  const WHATSAPP_NUMBER = '923458340669';
  const router = useRouter();
  const redirectTimerRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseTone, setResponseTone] = useState<'success' | 'error'>('success');

  const handleInputChange = (key: 'name' | 'phone' | 'email' | 'message', value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const redirectToPreviousPage = () => {
    if (typeof window === 'undefined') {
      router.push('/');
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    try {
      const referrer = document.referrer;
      if (referrer) {
        const refUrl = new URL(referrer);
        if (refUrl.origin === window.location.origin) {
          const targetPath = `${refUrl.pathname}${refUrl.search}${refUrl.hash}`;
          if (targetPath && targetPath !== currentPath) {
            router.push(targetPath);
            return;
          }
        }
      }
    } catch {
      // Ignore malformed referrer and fallback below.
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const buildWhatsAppUrl = () => {
    const lines = [
      'Hello',
      `Name: ${form.name || '-'}`,
      `Phone: ${form.phone || '-'}`,
      `Email: ${form.email || '-'}`,
      `Message: ${form.message || '-'}`,
    ];
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSending(true);
      setResponseMessage('');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send message.');
      }

      setResponseTone('success');
      setResponseMessage('Submitted successfully. Redirecting...');
      setForm({ name: '', phone: '', email: '', message: '' });

      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = window.setTimeout(() => {
        setResponseMessage('');
        redirectToPreviousPage();
      }, 1300);
    } catch (error) {
      setResponseTone('error');
      setResponseMessage(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">Contact Us</h1>
        <p className="text-lg text-gray-600">Get in touch with our team</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Contact Information Card */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-indigo-900">Contact Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold">
                  👤
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-medium">MR MUHAMMAD FAISAL PEERZADA</p>
                </div>
              </div>

              {/* Phone */}
              <a 
                href="tel:03458340669" 
                className="flex items-center space-x-4 hover:bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold">
                  📞
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-lg font-medium">03458340669</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 hover:bg-emerald-50 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-emerald-700 font-bold">
                  🟢
                </div>
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="text-lg font-medium">03458340669</p>
                </div>
              </a>

              {/* Email */}
              <a 
                href="mailto:mohammadfaisalpirzada@gmail.com" 
                className="flex items-center space-x-4 hover:bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold">
                  ✉️
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-medium">mohammadfaisalpirzada@gmail.com</p>
                </div>
              </a>

              {/* Address */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Sadar+karachi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-4 hover:bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold">
                  📍
                </div>
                <div>
                  <p className="text-sm text-gray-500">Postal Address</p>
                  <p className="text-lg font-medium">Sadar karachi</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Map Section with Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-indigo-900">Location Map</h2>
          </div>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Sadar+karachi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block relative"
          >
            <div className="aspect-video bg-indigo-50 flex flex-col items-center justify-center p-4">
              <div className="mb-3 text-6xl">📍</div>
              <div className="text-center">
                <p className="text-lg font-medium text-indigo-900 mb-1">Sadar, Karachi</p>
                <p className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                  Click to view on Google Maps →
                </p>
              </div>
            </div>
          </a>
        </div>

        {/* Message Form */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-indigo-900">Send Us a Message</h2>
            <p className="mt-1 text-sm text-gray-500">Your message will be saved directly in records.</p>
          </div>

          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="contact-phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                  placeholder="03xx xxxxxxx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                placeholder="Write your message here..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Send on WhatsApp
              </a>
              {responseMessage ? (
                <p className={`text-sm font-medium ${responseTone === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {responseMessage}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;