'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineDeviceMobile,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineDownload,
  HiOutlineShieldCheck,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClipboardCopy,
  HiOutlinePlus,
} from 'react-icons/hi';

interface VideoClip {
  id: string;
  name: string;
  url: string;
  file?: File;
  duration: number;
  trimStart: number;
  trimEnd: number;
  speed: number;
  thumbnail?: string;
}

export default function VideoEditorSoftwarePage() {
  // Video Clips & Timeline State
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [outputQuality, setOutputQuality] = useState<'1080p' | '720p'>('1080p');
  const [exportFileName, setExportFileName] = useState<string>('MasterSahib_Final_Video');

  // Export / Merging Progress State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
  const [mergedVideoExt, setMergedVideoExt] = useState<'webm' | 'mp4'>('webm');

  // Social Studio Copywriting State
  const [activePlatform, setActivePlatform] = useState<'youtube' | 'reels' | 'tiktok' | 'facebook'>('youtube');
  const [socialTitle, setSocialTitle] = useState<string>('');
  const [socialDescription, setSocialDescription] = useState<string>('');
  const [socialHashtags, setSocialHashtags] = useState<string>('');
  const [socialTags, setSocialTags] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // AI Director Modal State
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiLanguage, setAiLanguage] = useState<'English' | 'Urdu'>('English');
  const [aiResult, setAiResult] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Refs for Video & Canvas Engine
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep the latest clips / merged URL in refs so the unmount cleanup below can
  // see them without having to list them as effect dependencies.
  const clipsRef = useRef<VideoClip[]>([]);
  const mergedVideoUrlRef = useRef<string | null>(null);
  useEffect(() => {
    clipsRef.current = clips;
  }, [clips]);
  useEffect(() => {
    mergedVideoUrlRef.current = mergedVideoUrl;
  }, [mergedVideoUrl]);

  // Cleanup Object URLs on unmount ONLY.
  //
  // This used to depend on [clips, mergedVideoUrl], which meant React ran the
  // cleanup before every re-render where those changed — i.e. every time a clip
  // was added, trimmed, reordered, or its duration was filled in. Each of those
  // runs revoked the blob: URL of every existing clip, so previously imported
  // videos stopped playing the moment a second clip was added or metadata
  // resolved. Revoking now happens per-clip in removeClip / "Clear Timeline",
  // and for everything still live here on unmount.
  useEffect(() => {
    return () => {
      clipsRef.current.forEach((clip) => {
        if (clip.url.startsWith('blob:')) {
          URL.revokeObjectURL(clip.url);
        }
      });
      if (mergedVideoUrlRef.current) {
        URL.revokeObjectURL(mergedVideoUrlRef.current);
      }
    };
  }, []);

  // Handle Video File Upload
  //
  // Previously a clip was only added to the timeline once the hidden
  // <video>'s `onloadedmetadata` event fired. On several real devices/
  // browsers (large files, HEVC/.mov clips exported by phone cameras,
  // some Android WebViews) that event never fires and there was no
  // `onerror`/timeout fallback either — so the clip silently never
  // appeared in the timeline with zero feedback to the user. That is
  // exactly the "video attach nahi ho rahi" symptom. Fix: add the clip
  // to the timeline immediately (so it always shows up), then fill in
  // the real duration in the background — with an onerror handler and a
  // timeout fallback so it always settles even if metadata never loads.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('video/')) {
        alert(`"${file.name}" ek video file nahi hai, is liye skip kar di gayi.`);
        return;
      }

      const url = URL.createObjectURL(file);
      const clipId = 'clip_' + Math.random().toString(36).substring(2, 9);
      const fallbackDuration = 10;

      setClips((prev) => [
        ...prev,
        {
          id: clipId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          file,
          duration: fallbackDuration,
          trimStart: 0,
          trimEnd: fallbackDuration,
          speed: 1.0,
        },
      ]);

      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.src = url;

      let settled = false;
      const finalizeDuration = (rawDuration: number) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        const safeDuration = Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : fallbackDuration;
        setClips((prev) =>
          prev.map((clip) =>
            clip.id === clipId ? { ...clip, duration: safeDuration, trimEnd: safeDuration } : clip
          )
        );
      };

      tempVideo.onloadedmetadata = () => finalizeDuration(tempVideo.duration);
      tempVideo.onerror = () => finalizeDuration(fallbackDuration);
      // Belt-and-suspenders: some formats/devices never fire loadedmetadata
      // at all, so the clip's real duration is filled in after a short wait
      // instead of being stuck on the fallback forever.
      const timeoutId = window.setTimeout(() => finalizeDuration(tempVideo.duration || fallbackDuration), 4000);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reorder Clips
  const moveClip = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === clips.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...clips];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setClips(updated);
  };

  // Remove Clip
  const removeClip = (index: number) => {
    const updated = [...clips];
    const removed = updated.splice(index, 1)[0];
    if (removed && removed.url.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }
    setClips(updated);
    if (activeClipIndex >= updated.length) {
      setActiveClipIndex(Math.max(0, updated.length - 1));
    }
  };

  // "Play All" Sequence Player Engine
  const startPlayAll = () => {
    if (clips.length === 0) return;
    setIsPlayingSequence(true);
    playClipAtIndex(0);
  };

  const playClipAtIndex = (index: number) => {
    if (index >= clips.length) {
      setIsPlayingSequence(false);
      setActiveClipIndex(0);
      return;
    }

    setActiveClipIndex(index);
    const clip = clips[index];
    const video = videoPlayerRef.current;
    if (!video) return;

    video.src = clip.url;
    video.playbackRate = clip.speed;

    video.onloadeddata = () => {
      // Seek only once the media is actually loaded — setting currentTime
      // before metadata is ready is silently ignored, which made the preview
      // player start every trimmed clip from 0 instead of from trimStart.
      try {
        video.currentTime = clip.trimStart;
      } catch {
        /* not seekable yet — playback still starts, just from 0 */
      }
      video.play().catch(() => {});
    };

    video.ontimeupdate = () => {
      if (video.currentTime >= clip.trimEnd) {
        video.pause();
        playClipAtIndex(index + 1);
      }
    };
  };

  const pauseSequence = () => {
    const video = videoPlayerRef.current;
    if (video) {
      video.pause();
    }
    setIsPlayingSequence(false);
  };

  // Generate Social Media Metadata
  const generateSocialCopy = (titleName: string, totalDur: number) => {
    const cleanTitle = titleName || 'MasterSahib Exclusive Masterclass';
    const tagList = ['MasterSahib', 'AItools', 'VideoEditing', 'ViralVideo', 'CreativeStudio', 'ContentCreator', 'Trending'];

    // 1. YouTube
    setSocialTitle(`🎬 ${cleanTitle} | Full HD Official Video`);
    setSocialDescription(
      `Welcome to MasterSahib Official! 🚀 In this video, we explore ${cleanTitle}.\n\n` +
        `⏱️ VIDEO CHAPTERS & TIMESTAMPS:\n` +
        `00:00 - Introduction & Overview\n` +
        `00:15 - Core Highlights\n` +
        `01:00 - Key Takeaways & Summary\n\n` +
        `🔔 Don't forget to Like, Share, and Subscribe for more high-tech tutorials and software updates!\n` +
        `🌐 Visit our official hub: https://themastersahib.com\n\n` +
        `#${tagList.slice(0, 5).join(' #')}`
    );

    // 2. Hashtags & Tags
    setSocialHashtags(tagList.map((t) => `#${t}`).join(' '));
    setSocialTags(tagList.join(', '));
  };

  // In-Browser Video Rendering & Export (MediaRecorder + Canvas Engine)
  const renderAndExportVideo = async () => {
    if (clips.length === 0) {
      alert('Please add at least 1 video clip to the timeline first!');
      return;
    }

    setIsExporting(true);
    setExportProgress(5);
    setExportStatusText('Initializing HD Canvas Rendering Engine...');

    const canvas = document.createElement('canvas');
    let width = 1920;
    let height = 1080;

    if (aspectRatio === '9:16') {
      width = outputQuality === '1080p' ? 1080 : 720;
      height = outputQuality === '1080p' ? 1920 : 1280;
    } else if (aspectRatio === '1:1') {
      width = outputQuality === '1080p' ? 1080 : 720;
      height = outputQuality === '1080p' ? 1080 : 720;
    } else {
      width = outputQuality === '1080p' ? 1920 : 1280;
      height = outputQuality === '1080p' ? 1080 : 720;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const stream = canvas.captureStream(30);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioDestination = audioContext.createMediaStreamDestination();

    if (audioDestination.stream.getAudioTracks().length > 0) {
      stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
    }

    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: outputQuality === '1080p' ? 6000000 : 3500000,
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: selectedMime });
      const finalUrl = URL.createObjectURL(finalBlob);
      // Release the previous export before replacing it so repeated exports
      // don't leak blob: URLs.
      if (mergedVideoUrlRef.current) {
        URL.revokeObjectURL(mergedVideoUrlRef.current);
      }
      setMergedVideoExt(selectedMime.startsWith('video/mp4') ? 'mp4' : 'webm');
      setMergedVideoUrl(finalUrl);
      setIsExporting(false);
      setExportProgress(100);
      setExportStatusText('Rendering Completed Successfully! 🎉');

      // Trigger automatic social metadata generation
      const totalDur = clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0);
      generateSocialCopy(exportFileName, totalDur);
    };

    mediaRecorder.start();

    // Process each clip in timeline sequentially
    const videoElem = document.createElement('video');
    videoElem.muted = false;
    videoElem.crossOrigin = 'anonymous';

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      setExportStatusText(`Rendering Clip ${i + 1} of ${clips.length}: "${clip.name}"...`);
      setExportProgress(Math.round(((i) / clips.length) * 90) + 10);

      await new Promise<void>((resolve) => {
        videoElem.src = clip.url;
        videoElem.playbackRate = clip.speed;

        videoElem.onloadeddata = () => {
          // Seek after load — currentTime set before metadata is ready is
          // ignored, which would render trimmed clips from their real start.
          try {
            videoElem.currentTime = clip.trimStart;
          } catch {
            /* not seekable yet */
          }

          const drawFrame = () => {
            if (videoElem.ended || videoElem.currentTime >= clip.trimEnd) {
              resolve();
              return;
            }

            // Draw Background Letterbox
            ctx.fillStyle = '#0a0d14';
            ctx.fillRect(0, 0, width, height);

            // Compute Aspect Fit
            const vWidth = videoElem.videoWidth || width;
            const vHeight = videoElem.videoHeight || height;
            const scale = Math.min(width / vWidth, height / vHeight);
            const drawW = vWidth * scale;
            const drawH = vHeight * scale;
            const drawX = (width - drawW) / 2;
            const drawY = (height - drawH) / 2;

            ctx.drawImage(videoElem, drawX, drawY, drawW, drawH);

            requestAnimationFrame(drawFrame);
          };

          // Start drawing only once playback has actually begun. Calling
          // drawFrame() synchronously after play() used to see videoElem.paused
          // still true (play() resolves asynchronously) and resolve the promise
          // immediately, so clips were silently dropped from the exported video.
          videoElem
            .play()
            .then(() => drawFrame())
            .catch(() => resolve());
        };

        videoElem.onerror = () => {
          resolve();
        };
      });
    }

    setExportStatusText('Finalizing video stream...');
    setExportProgress(95);
    setTimeout(() => {
      mediaRecorder.stop();
    }, 500);
  };

  // Copy Field Helper
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Gemini AI Director Generator
  const generateAiStoryboard = () => {
    if (!aiTopic.trim()) {
      alert('Please enter a video topic or prompt first!');
      return;
    }

    setIsGeneratingAi(true);
    setTimeout(() => {
      if (aiLanguage === 'Urdu') {
        setAiResult(
          `🎬 **ویڈیو ڈائریکٹر اسکرپٹ برائے: ${aiTopic}**\n\n` +
            `🔹 **منظر 1 (Hook - 0 سے 5 سیکنڈ):**\n` +
            `کیمرہ زوم ان۔ پرجوش انداز میں تعارف: "آج ہم سیکھیں گے ${aiTopic} کا سب سے آسان اور تیز ترین طریقہ!"\n\n` +
            `🔹 **منظر 2 (Main Demonstration - 5 سے 20 سیکنڈ):**\n` +
            `اسکرین ریکارڈنگ اور واضح اشارے۔ بنیادی مراحل ایک ایک کر کے دکھائے جائیں۔\n\n` +
            `🔹 **منظر 3 (Call to Action - 20 سے 30 سیکنڈ):**\n` +
            `ماسٹر صاحب کا لوگو۔ "مزید بہترین ٹولز کے لیے MasterSahib.com وزٹ کریں اور سبسکرائب کریں!"`
        );
      } else {
        setAiResult(
          `🎬 **AI Director Storyboard for: ${aiTopic}**\n\n` +
            `🔹 **Scene 1 (High-Energy Hook - 0-5s):**\n` +
            `Dynamic fast-cut opener. Voiceover: "Stop doing it the old way! Here is how to master ${aiTopic} in 3 easy steps."\n\n` +
            `🔹 **Scene 2 (Step-by-Step Breakdown - 5-25s):**\n` +
            `Cinematic screen share highlighting key features and practical implementation.\n\n` +
            `🔹 **Scene 3 (Call-to-Action & Outro - 25-30s):**\n` +
            `MasterSahib signature closing card. "Visit themastersahib.com for full tools and tutorials!"`
        );
      }
      setIsGeneratingAi(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#0d111a] pb-24 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0f1422]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/softwares"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              Softwares Hub
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-black tracking-wide text-white sm:text-base">
                MasterSahib Video Studio <span className="text-indigo-400">v3.0</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/downloads/MasterSahib_Video_Editor.apk"
              download="MasterSahib_Video_Editor.apk"
              className="hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 sm:inline-flex"
            >
              <HiOutlineDownload className="h-4 w-4" />
              <span>Download APK</span>
            </a>
            <span className="rounded-full bg-indigo-900/60 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-700/50">
              ⚡ 100% In-Browser Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Video Preview Player & Sequencer */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Player Screen */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-2xl">
              <div
                className={`relative flex items-center justify-center bg-black ${
                  aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[550px] mx-auto' : aspectRatio === '1:1' ? 'aspect-square max-h-[480px] mx-auto' : 'aspect-video'
                }`}
              >
                {clips.length > 0 ? (
                  <video
                    ref={videoPlayerRef}
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <HiOutlineVideoCamera className="h-16 w-16 text-slate-700 animate-bounce" />
                    <p className="mt-3 text-sm font-bold text-slate-400">No Video Clips Loaded Yet</p>
                    <p className="mt-1 text-xs text-slate-600 max-w-xs">
                      Drop video files below or click &quot;Import Videos&quot; to begin sequencing!
                    </p>
                  </div>
                )}

                {/* Active Clip Badge */}
                {clips.length > 0 && (
                  <div className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md border border-slate-700">
                    Clip {activeClipIndex + 1} of {clips.length}: {clips[activeClipIndex]?.name}
                  </div>
                )}
              </div>

              {/* Player Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-[#121724] p-3.5">
                <div className="flex items-center gap-2">
                  {!isPlayingSequence ? (
                    <button
                      onClick={startPlayAll}
                      disabled={clips.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
                    >
                      <HiOutlinePlay className="h-4 w-4" />
                      <span>▶ Play All Sequence</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseSequence}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-amber-500"
                    >
                      <HiOutlinePause className="h-4 w-4" />
                      <span>Pause Sequence</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (clips.length > 0) playClipAtIndex(activeClipIndex);
                    }}
                    disabled={clips.length === 0}
                    className="rounded-xl border border-slate-700 bg-slate-800/60 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
                    title="Restart Current Clip"
                  >
                    <HiOutlineRefresh className="h-4 w-4" />
                  </button>
                </div>

                {/* Aspect Ratio Selector Chips */}
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      aspectRatio === '16:9' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    16:9 (YouTube)
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      aspectRatio === '9:16' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    9:16 (Shorts/Reels)
                  </button>
                  <button
                    onClick={() => setAspectRatio('1:1')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      aspectRatio === '1:1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1:1 (Square)
                  </button>
                </div>
              </div>
            </div>

            {/* Video Clips Timeline List */}
            <div className="rounded-3xl border border-slate-800 bg-[#121724] p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎞️</span>
                  <h3 className="text-sm font-bold text-white">
                    Timeline Sequence ({clips.length} {clips.length === 1 ? 'Clip' : 'Clips'})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600/90 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500 shadow"
                  >
                    <HiOutlinePlus className="h-4 w-4" />
                    <span>Import Videos</span>
                  </button>

                  {clips.length > 0 && (
                    <button
                      onClick={() => {
                        clips.forEach((clip) => {
                          if (clip.url.startsWith('blob:')) URL.revokeObjectURL(clip.url);
                        });
                        setClips([]);
                        setActiveClipIndex(0);
                      }}
                      className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-1.5 text-rose-400 transition hover:bg-rose-900/50"
                      title="Clear Timeline"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Clip Cards */}
              <div className="mt-3 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {clips.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-[#0d111a] py-8 text-center transition hover:border-indigo-500/60 hover:bg-slate-900/60"
                  >
                    <span className="text-3xl">📂</span>
                    <p className="mt-2 text-xs font-bold text-slate-300">
                      Tap or Drop Videos from Gallery / PC
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">Supports MP4, WebM, MOV, AVI (Any format)</p>
                  </div>
                ) : (
                  clips.map((clip, idx) => (
                    <div
                      key={clip.id}
                      className={`flex flex-col gap-2 rounded-2xl border p-3 transition ${
                        activeClipIndex === idx
                          ? 'border-indigo-500/80 bg-indigo-950/20 shadow-md'
                          : 'border-slate-800 bg-[#0e121e] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                            {idx + 1}
                          </span>
                          <span className="truncate text-xs font-bold text-slate-200">{clip.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveClip(idx, 'left')}
                            disabled={idx === 0}
                            className="rounded-lg bg-slate-800 p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Move Left"
                          >
                            <HiOutlineChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveClip(idx, 'right')}
                            disabled={idx === clips.length - 1}
                            className="rounded-lg bg-slate-800 p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Move Right"
                          >
                            <HiOutlineChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => playClipAtIndex(idx)}
                            className="rounded-lg bg-indigo-600/30 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/50"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => removeClip(idx)}
                            className="rounded-lg bg-rose-950/40 p-1 text-rose-400 hover:text-rose-300"
                            title="Delete Clip"
                          >
                            <HiOutlineTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Trim & Speed Controls */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>Trim Start:</span>
                          <input
                            type="number"
                            min="0"
                            max={clip.trimEnd - 1}
                            value={clip.trimStart}
                            onChange={(e) => {
                              const raw = Math.max(0, Number(e.target.value) || 0);
                              const val = Math.min(raw, clip.trimEnd - 1);
                              setClips((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, trimStart: val } : c))
                              );
                            }}
                            className="w-12 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-center text-white"
                          />
                          <span>s</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span>Trim End:</span>
                          <input
                            type="number"
                            min={clip.trimStart + 1}
                            max={clip.duration}
                            value={clip.trimEnd}
                            onChange={(e) => {
                              const raw = Math.min(clip.duration, Number(e.target.value) || 0);
                              const val = Math.max(raw, clip.trimStart + 1);
                              setClips((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, trimEnd: val } : c))
                              );
                            }}
                            className="w-12 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-center text-white"
                          />
                          <span>s</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span>Speed:</span>
                          <select
                            value={clip.speed}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setClips((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, speed: val } : c))
                              );
                            }}
                            className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-xs text-white"
                          >
                            <option value="0.5">0.5x</option>
                            <option value="1.0">1.0x (Normal)</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2.0">2.0x (Fast)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Export & Social Media Studio Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Export & Render Action Card */}
            <div className="rounded-3xl border border-slate-800 bg-[#121724] p-5 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Render & Export Studio
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Project / File Name</label>
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="Enter output name..."
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0d111a] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
                    <div className="mt-1 rounded-xl border border-slate-700 bg-[#0d111a] p-2 text-xs font-bold text-indigo-400">
                      {aspectRatio}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Quality</label>
                    <select
                      value={outputQuality}
                      onChange={(e) => setOutputQuality(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0d111a] p-2 text-xs text-white"
                    >
                      <option value="1080p">1080p FHD (Ultra)</option>
                      <option value="720p">720p HD (Fast)</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar (during export) */}
                {isExporting && (
                  <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/40 p-3">
                    <div className="flex justify-between text-xs font-bold text-indigo-300">
                      <span>{exportStatusText}</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <button
                  onClick={renderAndExportVideo}
                  disabled={isExporting || clips.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950 transition hover:shadow-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50"
                >
                  <HiOutlineLightningBolt className="h-5 w-5" />
                  <span>{isExporting ? 'Rendering HD Video...' : '⚡ Merge & Export Video'}</span>
                </button>

                {/* Download Link when Ready */}
                {mergedVideoUrl && (
                  <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-3.5 text-center">
                    <p className="text-xs font-bold text-emerald-400">✨ Video Ready for Download!</p>
                    <a
                      href={mergedVideoUrl}
                      download={`${exportFileName || 'MasterSahib_Video'}.${mergedVideoExt}`}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                    >
                      <HiOutlineDownload className="h-4 w-4" />
                      <span>Download Final Video</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Autonomous Social Media Studio */}
            <div className="rounded-3xl border border-slate-800 bg-[#121724] p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Auto Social SEO Studio
                  </h3>
                </div>
                <button
                  onClick={() => generateSocialCopy(exportFileName, 60)}
                  className="rounded-lg bg-indigo-600/30 px-2.5 py-1 text-xs font-bold text-indigo-300 transition hover:bg-indigo-600/50"
                >
                  Regenerate
                </button>
              </div>

              {/* Platform Selector Chips */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['youtube', 'reels', 'tiktok', 'facebook'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(p)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition ${
                      activePlatform === p
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Social Content Cards */}
              <div className="mt-3 space-y-3">
                {/* Title */}
                <div className="rounded-2xl border border-slate-800 bg-[#0d111a] p-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Title</span>
                    <button
                      onClick={() => copyToClipboard(socialTitle || `${exportFileName} Official Video`, 'title')}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedField === 'title' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-200">
                    {socialTitle || `🎬 ${exportFileName || 'MasterSahib Video'} | Official HD Release`}
                  </p>
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-slate-800 bg-[#0d111a] p-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Description & Chapters</span>
                    <button
                      onClick={() => copyToClipboard(socialDescription, 'desc')}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedField === 'desc' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-slate-300">
                    {socialDescription ||
                      `Welcome to MasterSahib! 🚀 Check out our latest video created with MasterSahib Video Studio.\n\n⏱️ Chapters:\n00:00 - Introduction\n01:00 - Key Highlights\n\n#MasterSahib #VideoEditor #Viral`}
                  </pre>
                </div>

                {/* Hashtags & Tags */}
                <div className="rounded-2xl border border-slate-800 bg-[#0d111a] p-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Hashtags & Tags</span>
                    <button
                      onClick={() => copyToClipboard(socialHashtags, 'tags')}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedField === 'tags' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-indigo-300">
                    {socialHashtags || '#MasterSahib #AItools #VideoEditing #ViralVideo #Trending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Director Assistant Section */}
        <section className="mt-8 rounded-3xl border border-indigo-900/50 bg-[#121724] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👑</span>
              <div>
                <h2 className="text-base font-black text-white sm:text-lg">
                  Gemini AI Video Director (Storyboard & Concepts)
                </h2>
                <p className="text-xs text-slate-400">
                  Generate instant scene breakdowns, spoken hooks, and call-to-actions in English & Urdu!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value as any)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-indigo-300"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu (اردو)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="E.g., How to learn AI in 2026, or School Annual Function highlights..."
              className="flex-1 rounded-2xl border border-slate-700 bg-[#0d111a] px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-none sm:text-sm"
            />
            <button
              onClick={generateAiStoryboard}
              disabled={isGeneratingAi}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <HiOutlineSparkles className="h-4 w-4" />
              <span>{isGeneratingAi ? 'Writing Storyboard...' : 'Generate Script'}</span>
            </button>
          </div>

          {aiResult && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-[#0d111a] p-4 text-xs leading-relaxed text-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-bold text-indigo-400">AI Director Output</span>
                <button
                  onClick={() => copyToClipboard(aiResult, 'ai')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  {copiedField === 'ai' ? 'Copied! ✓' : 'Copy Storyboard'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans">{aiResult}</pre>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
