'use client';
import { useState } from 'react';

export default function JudgesSheet() {
  const [date] = useState("30-05-2025");
  const [judges, setJudges] = useState(["", "", "", ""]);
  const teams = ["Hazrat Zainab", "Hazrat Ayesha", "Hazrat Asia", "Hazrat Memoona"];
  const rounds = [
    { name: "Round 1 Mind Over Matter", questions: 20 },
    { name: "Round 2 Battle of Buzzer", questions: 20 },
    { name: "Round 3 Mystery Picks", questions: 10 }
  ];

  const [scores, setScores] = useState<number[][][]>(
    rounds.map(round => 
      Array.from({ length: round.questions }, () => [0, 0, 0, 0])
    )
  );

  const updateScore = (roundIndex: number, questionIndex: number, teamIndex: number, value: number) => {
    const newScores = [...scores];
    newScores[roundIndex][questionIndex][teamIndex] = value;
    setScores(newScores);
  };

  const calculateTotal = (roundIndex: number, teamIndex: number) => {
    return scores[roundIndex].reduce((sum, question) => sum + question[teamIndex], 0);
  };

  const calculateFinalTotal = (teamIndex: number) => {
    return rounds.reduce((sum, _, roundIndex) => sum + calculateTotal(roundIndex, teamIndex), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-0">
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-md print:shadow-none">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Peace International School</h1>
          <h2 className="text-2xl font-semibold my-4">Judges Sheet for Quiz Competition 2025</h2>
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg">Date: {date}</div>
            <div className="text-lg">
              Judge Names: 
              <div className="flex gap-4 mt-2">
                {judges.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    aria-label={`Judge name ${index + 1}`}
                    title={`Judge name ${index + 1}`}
                    onChange={(e) => {
                      const newJudges = [...judges];
                      newJudges[index] = e.target.value;
                      setJudges(newJudges);
                    }}
                    className="border-b-2 border-gray-300 focus:border-blue-500 outline-none w-32"
                  />
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100">Teams</th>
                <th className="border p-2 bg-gray-100">Sr.No</th>
                {teams.map((team, index) => (
                  <th key={index} className={`border p-2 ${
                    index === 0 ? 'bg-red-100' : 
                    index === 1 ? 'bg-blue-100' : 
                    index === 2 ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {team}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, roundIndex) => (
                <>
                  <tr key={round.name}>
                    <td className="border p-2 font-semibold bg-gray-50" colSpan={6}>
                      {round.name}
                    </td>
                  </tr>
                  {Array.from({ length: round.questions }, (_, i) => i + 1).map((num) => (
                    <tr key={`${roundIndex}-${num}`}>
                      <td className="border p-2"></td>
                      <td className="border p-2 text-center">{num}</td>
                      {teams.map((_, teamIndex) => (
                        <td key={teamIndex} className="border p-1">
                          <input
                            type="number"
                            min="0"
                            value={scores[roundIndex][num-1][teamIndex]}
                            aria-label={`${round.name} question ${num} score for ${teams[teamIndex]}`}
                            title={`${round.name} question ${num} score for ${teams[teamIndex]}`}
                            onChange={(e) => updateScore(roundIndex, num-1, teamIndex, parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-50">
                    <td className="border p-2" colSpan={2}>Total</td>
                    {teams.map((_, teamIndex) => (
                      <td key={teamIndex} className="border p-2 text-center">
                        {calculateTotal(roundIndex, teamIndex)}
                      </td>
                    ))}
                  </tr>
                  <tr className="h-4"><td colSpan={6}></td></tr>
                </>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="border p-2" colSpan={2}>Final Total</td>
                {teams.map((_, teamIndex) => (
                  <td key={teamIndex} className="border p-2 text-center">
                    {calculateFinalTotal(teamIndex)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
          >
            Print Scoresheet
          </button>
          <button 
            onClick={() => {
              const newScores = rounds.map(round => 
                Array.from({ length: round.questions }, () => [0, 0, 0, 0])
              );
              setScores(newScores);
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Reset All Scores
          </button>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          Made by @MasterSahub
        </footer>
      </div>
    </div>
  );
}