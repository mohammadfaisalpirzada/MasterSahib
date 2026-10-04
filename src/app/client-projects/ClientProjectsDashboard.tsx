'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineKey,
  HiOutlineClipboardCopy,
  HiOutlineExternalLink,
  HiOutlineShieldCheck,
  HiOutlinePencilAlt,
  HiOutlineCheck,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import type { ClientProject } from '@/lib/projects-view';

type Props = {
  initialProjects: ClientProject[];
};

export default function ClientProjectsDashboard({ initialProjects }: Props) {
  const [projects, setProjects] = useState<ClientProject[]>(initialProjects);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEditKey = (project: ClientProject) => {
    setEditingKeyId(project.id);
    setNewKeyValue(project.accessKey || '');
  };

  const saveKey = async (projectId: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/projects-view/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, accessKey: newKeyValue }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? data.project : p))
        );
        setEditingKeyId(null);
        showToast('Access Key updated successfully!');
      } else {
        alert(data.error || 'Failed to save access key.');
      }
    } catch {
      alert('Network error while saving key.');
    } finally {
      setIsSaving(false);
    }
  };

  const getClientLink = (project: ClientProject) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://themastersahib.com';
    return `${origin}/projects-view/${project.slug}?key=${encodeURIComponent(project.accessKey || '')}`;
  };

  const copyClientLink = async (project: ClientProject) => {
    const link = getClientLink(project);
    await navigator.clipboard.writeText(link);
    setCopiedId(project.id);
    showToast('Client Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyWhatsAppInvite = async (project: ClientProject) => {
    const link = getClientLink(project);
    const text = `Assalam-o-Alaikum,\n\nHere is your private project preview link for "${project.title}":\n\n🔗 View Pages: ${link}\n🔐 Access Key: ${project.accessKey || 'None'}\n\n(Protected Client Review Mode. Please inspect the pages and let us know your feedback.)`;
    await navigator.clipboard.writeText(text);
    showToast('WhatsApp invitation text copied!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage ? (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-fade-in flex items-center gap-2">
          <HiOutlineCheck className="w-4 h-4" /> {toastMessage}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HiOutlineShieldCheck className="w-5 h-5" />
            </span>
            Active Client Deliverables
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage PIN keys, client review links, and preview protected documents before releasing final unwatermarked PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold">
            Google Drive Space: <code className="font-mono text-[11px]">projects_view</code>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => {
          const clientLink = getClientLink(project);
          const isEditing = editingKeyId === project.id;
          const coverImage = project.pages[0]?.imageSrc || '';

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              {/* Cover Preview Thumbnail */}
              <div className="w-full md:w-56 shrink-0 bg-slate-100 dark:bg-slate-950 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative">
                {coverImage ? (
                  <div className="relative w-36 aspect-[1/1.414] rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                    <Image
                      src={coverImage}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-end p-1.5">
                      <span className="bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {project.totalPages} Pages
                      </span>
                    </div>
                  </div>
                ) : null}
                <Link
                  href={`/projects-view/${project.slug}`}
                  target="_blank"
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                >
                  Open Preview <HiOutlineExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Project Details & Link Management */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                      {project.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Folder: <code className="font-mono text-slate-600 dark:text-slate-300">{project.slug}</code>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Key & Link Management Row */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  {/* Access Key Setting */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HiOutlineKey className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Access Key / Passcode:
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                          placeholder="e.g. secret2026"
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                        <button
                          disabled={isSaving}
                          onClick={() => saveKey(project.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingKeyId(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {project.accessKey || 'No Key (Public)'}
                        </span>
                        <button
                          onClick={() => startEditKey(project)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 ml-1"
                        >
                          <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Change Key
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shareable Client Link Box */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Direct Client Review Link (Auto-unlocked with key):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={clientLink}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={() => copyClientLink(project)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                      >
                        <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                        {copiedId === project.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => copyWhatsAppInvite(project)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5" /> Copy WhatsApp Invite Text
                  </button>

                  <Link
                    href={`/projects-view/${project.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                  >
                    <HiOutlineExternalLink className="w-3.5 h-3.5" /> View as Client
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
