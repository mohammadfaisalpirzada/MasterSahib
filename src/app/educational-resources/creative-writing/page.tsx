'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Adventure', 'Fantasy', 'Mystery', 'Funny', 'Sci-Fi'] as const

type Category = (typeof CATEGORIES)[number]

interface SavedStory {
  id: string
  prompt: string
  text: string
  date: string
}

const PROMPTS: Record<Category, string[]> = {
  Adventure: [
    'You find a mysterious map hidden inside an old book. Where does it lead?',
    'A spaceship crash-lands in your backyard. The door opens and a small alien waves at you.',
    'You discover a secret tunnel behind the library bookshelf. Write about what you find.',
    'While hiking, you stumble upon a hidden cave filled with glowing crystals.',
    'A dolphin swims up to you at the beach and drops a golden key in your hand.',
    'You wake up one morning and can talk to animals. What adventure begins?',
    'Your new neighbour turns out to be a famous explorer who invites you on a quest.',
  ],
  Fantasy: [
    'A dragon lands on your school rooftop and asks for your help.',
    'You discover a magical door in your bedroom wall that leads to another world.',
    'A tiny fairy flies through your window at midnight with an urgent message.',
    'Every time you sneeze, something magical happens. Describe your day.',
    'You find a wand in the park. When you pick it up, it starts glowing.',
    'A friendly giant asks you to help him find his lost pet griffin.',
    'The toys in your room come alive at night and invite you to their kingdom.',
  ],
  Mystery: [
    'Every morning, a new message appears on your mirror written in sparkly letters.',
    'The cookies you left out for Santa go missing, but it is only November!',
    'A locked chest washes up on the shore near your house. You have to find the key.',
    'Someone keeps leaving origami animals on your desk at school. Who is it?',
    'The statue in the town square winks at you when nobody else is looking.',
    'A mysterious package arrives with your name on it, but no return address.',
    'Footprints appear in the snow leading to a tree, then simply vanish.',
  ],
  Funny: [
    'Your pet suddenly starts talking, but they have a very grumpy attitude.',
    'You invent a machine that swaps people voices. Chaos follows at breakfast.',
    'A penguin shows up at your front door wearing a tiny top hat and bow tie.',
    'Your reflection starts doing different things than you in the mirror.',
    'Your teacher accidentally turns into a frog during morning maths class.',
    'A superhero moves in next door but they are really clumsy and keep breaking things.',
    'You wake up to find your hair has turned bright green overnight.',
  ],
  'Sci-Fi': [
    'A robot joins your class and you teach it how to be a friend.',
    'You build a time machine out of cardboard and a keyboard. It actually works!',
    'All the screens in your house start talking to you at once.',
    'You get a message from your future self warning you about something silly.',
    'A new planet appears in the sky overnight. You are chosen to explore it.',
    'Your backpack turns into a jetpack on the way to school.',
    'A friendly alien family moves into the house across the street and asks for a tour.',
  ],
}

function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function loadSaved(): SavedStory[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('creative-writing-stories')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function CreativeWritingPage() {
  const [category, setCategory] = useState<Category>('Adventure')
  const [prompt, setPrompt] = useState('')
  const [story, setStory] = useState('')
  const [saved, setSaved] = useState<SavedStory[]>([])

  useEffect(() => {
    setSaved(loadSaved())
  }, [])

  const generate = useCallback(() => {
    const prompts = PROMPTS[category]
    const p = prompts[Math.floor(Math.random() * prompts.length)]
    setPrompt(p)
    setStory('')
  }, [category])

  const save = () => {
    if (!story.trim()) return
    const newStory: SavedStory = {
      id: crypto.randomUUID(),
      prompt,
      text: story,
      date: formatDate(),
    }
    const updated = [newStory, ...saved]
    setSaved(updated)
    localStorage.setItem('creative-writing-stories', JSON.stringify(updated))
  }

  const remove = (id: string) => {
    const updated = saved.filter((s) => s.id !== id)
    setSaved(updated)
    localStorage.setItem('creative-writing-stories', JSON.stringify(updated))
  }

  const download = (s: SavedStory) => {
    const blob = new Blob([`Prompt: ${s.prompt}\n\n${s.text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `story-${s.id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wc = wordCount(story)

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/educational-resources"
          className="mb-6 inline-flex items-center gap-1 text-sm text-orange-700 hover:text-orange-900"
        >
          ← Back
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-orange-900">
          Creative Writing Prompts
        </h1>

        <section className="mb-6 rounded-xl bg-white p-4 shadow-md">
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            className="mb-4 rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white shadow transition-colors hover:bg-orange-600"
          >
            Generate Prompt
          </button>

          {prompt && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 italic text-orange-900">
              {prompt}
            </div>
          )}

          <div className="relative">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={prompt ? 'Write your story here...' : 'Click &quot;Generate Prompt&quot; to start!'}
              rows={10}
              className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              disabled={!prompt}
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
              {wc} {wc === 1 ? 'word' : 'words'}
            </span>
          </div>

          <button
            onClick={save}
            disabled={!story.trim()}
            className="mt-3 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save to LocalStorage
          </button>
        </section>

        {saved.length > 0 && (
          <section className="rounded-xl bg-white p-4 shadow-md">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Saved Stories ({saved.length})
            </h2>
            <div className="space-y-3">
              {saved.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <p className="mb-1 text-xs text-gray-500">{s.date}</p>
                  <p className="mb-1 text-sm font-medium text-orange-800">
                    {s.prompt}
                  </p>
                  <p className="mb-2 line-clamp-3 text-sm text-gray-700">
                    {s.text}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => download(s)}
                      className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                    >
                      Download .txt
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
