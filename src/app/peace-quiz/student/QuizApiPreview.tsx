'use client';

import { useEffect, useState } from 'react';
import {
  QUIZ_PROGRAM_NAME_UPDATED_EVENT,
  getQuizProgramName,
} from '../../lib/quizBranding';

type QuizApiResponse = {
  success: boolean;
  totalRows?: number;
  headers?: string[];
  items?: Record<string, string>[];
  message?: string;
};

export default function QuizApiPreview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuizApiResponse | null>(null);
  const [programName, setProgramName] = useState('');

  const loadQuiz = async (nextProgramName: string) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (nextProgramName.trim()) {
        params.set('programName', nextProgramName.trim());
      }

      const query = params.toString();
      const endpoint = query ? `/api/peace-quiz/questions?${query}` : '/api/peace-quiz/questions';

      const response = await fetch(endpoint, { cache: 'no-store' });
      const payload = (await response.json()) as QuizApiResponse;
      setData(payload);
    } catch {
      setData({ success: false, message: 'API request failed. Please check server logs.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncProgramName = () => {
      const currentProgramName = getQuizProgramName();
      setProgramName(currentProgramName);
      loadQuiz(currentProgramName);
    };

    syncProgramName();
    window.addEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);

    return () => {
      window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
    };
  }, []);

  return (
    <section id="quiz-preview" className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Google Sheet Quiz Preview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Quiz sheet is loaded securely from the server-side school mapping for <span className="font-semibold">{programName || 'this school'}</span>.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Loading quiz data from Google Sheet...</p>
      ) : null}

      {!loading && !data?.success ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {data?.message || 'Could not load quiz data.'}
          <p className="mt-2">
            Ensure this school is mapped in src/app/lib/quizSheets.ts and the sheet is shared with your service account email.
          </p>
        </div>
      ) : null}

      {data?.success ? (
      <>
      <p className="mt-1 text-sm text-slate-700">Total rows fetched: {data.totalRows ?? 0}</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {(data.headers ?? []).slice(0, 4).map((header) => (
                <th key={header} className="px-3 py-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.items ?? []).slice(0, 5).map((item, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100">
                {(data.headers ?? []).slice(0, 4).map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-3 py-2 text-slate-700">
                    {item[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      ) : null}
    </section>
  );
}
