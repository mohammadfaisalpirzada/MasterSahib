'use client';

import { useState, useEffect } from 'react';

export default function LiveScore() {
  // Team configurations
  const teamConfig = {
    girls: [
      { id: 1, name: 'Hazrat Zainab', score: 0, color: 'bg-red-500' },
      { id: 2, name: 'Hazrat Ayesha', score: 0, color: 'bg-blue-500' },
      { id: 3, name: 'Hazrat Asia', score: 0, color: 'bg-green-500' },
      { id: 4, name: 'Hazrat Memoona', score: 0, color: 'bg-yellow-500' },
    ],
    boys: [
      { id: 1, name: 'Hazrat Omar', score: 0, color: 'bg-red-500' },
      { id: 2, name: 'Hazrat Ali', score: 0, color: 'bg-blue-500' },
      { id: 3, name: 'Hazrat Abu Bakar', score: 0, color: 'bg-green-500' },
      { id: 4, name: 'Hazrat Usman', score: 0, color: 'bg-yellow-500' },
    ]
  };

  // Round configurations
  const roundConfig = [
    "Round 1: Mind Over Matter",
    "Round 2: Battle of Buzzer", 
    "Round 3: Mystery Picks"
  ];

  // Main app state
  const [state, setState] = useState({
    isGirls: true,
    teams: [...teamConfig.girls],
    currentRound: {
      name: roundConfig[0],
      number: 1,
      scores: [0, 0, 0, 0]
    },
    showTotals: false
  });

  // Hide navigation when component mounts
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';

    // Warn before page refresh - with proper TypeScript typing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const confirmationMessage = 'Are you sure you want to leave? All scores will be reset!';
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (nav) nav.style.display = 'block';
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ... rest of your component code remains the same ...
  // Team toggle
  const toggleTeams = () => {
    const newIsGirls = !state.isGirls;
    setState({
      ...state,
      isGirls: newIsGirls,
      teams: [...(newIsGirls ? teamConfig.girls : teamConfig.boys)],
      currentRound: {
        ...state.currentRound,
        scores: [0, 0, 0, 0]
      },
      showTotals: false
    });
  };
  // Score update
  const updateScore = (id: number, change: number) => {
    const teamIndex = state.teams.findIndex(t => t.id === id);
    if (teamIndex === -1) return;

    const newTeams = state.teams.map(t => 
      t.id === id ? { ...t, score: t.score + change } : t
    );

    const newRoundScores = [...state.currentRound.scores];
    newRoundScores[teamIndex] += change;

    setState({
      ...state,
      teams: newTeams,
      currentRound: {
        ...state.currentRound,
        scores: newRoundScores
      }
    });
  };

  // Round advancement
  const advanceRound = () => {
    const nextRound = state.currentRound.number;
    if (nextRound >= roundConfig.length) return;

    setState({
      ...state,
      currentRound: {
        name: roundConfig[nextRound],
        number: nextRound + 1,
        scores: [0, 0, 0, 0]
      },
      showTotals: false
    });
  };

  // Reset all scores with double confirmation
  const resetScores = () => {
    if (!window.confirm('Are you sure you want to reset all scores?')) return;
    if (!window.confirm('This will erase ALL scores. Are you absolutely sure?')) return;
    
    setState({
      ...state,
      teams: state.teams.map(t => ({ ...t, score: 0 })),
      currentRound: {
        ...state.currentRound,
        scores: [0, 0, 0, 0]
      },
      showTotals: false
    });
  };

  // Toggle totals display
  const toggleTotals = () => {
    setState({
      ...state,
      showTotals: !state.showTotals
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header - Centered */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Peace International School</h1>
        <div className="bg-gradient-to-r from-red-500 via-blue-500 to-green-500 p-2 rounded-lg mx-auto max-w-md">
          <h2 className="text-2xl font-bold text-white">Quiz Live Score</h2>
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg">{state.currentRound.name}</h3>
          <p>Current Round: {state.currentRound.number}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleTeams}
            className={`px-3 py-1 rounded-md ${state.isGirls ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
          >
            {state.isGirls ? 'Girls Teams' : 'Boys Teams'}
          </button>
          <button 
            onClick={advanceRound}
            className="bg-purple-600 text-white px-3 py-1 rounded-md"
            disabled={state.currentRound.number >= roundConfig.length}
          >
            Next Round
          </button>
          <button
            onClick={resetScores}
            className="bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700"
          >
            Reset All
          </button>
          <button
            onClick={toggleTotals}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          >
            {state.showTotals ? 'Hide Totals' : 'Show Totals'}
          </button>
        </div>
      </div>

      {/* Score Display - Centered Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.teams.map((team, index) => (
          <div key={team.id} className={`${team.color} p-6 rounded-xl shadow-lg text-white flex flex-col items-center`}>
            {/* Team Name - Centered */}
            <h3 className="text-2xl font-bold mb-4 text-center">{team.name}</h3>
            
            {/* Current Round Score - Always Visible and Centered */}
            <div className="mb-6 w-full text-center">
              <div className="text-sm uppercase tracking-wider mb-1">Current Round</div>
              <div className="text-5xl font-extrabold">{state.currentRound.scores[index]}</div>
            </div>
            
            {/* Total Score - Conditionally Rendered and Centered */}
            {state.showTotals && (
              <div className="mb-6 w-full text-center">
                <div className="text-sm uppercase tracking-wider mb-1">Total Score</div>
                <div className="text-5xl font-extrabold">{team.score}</div>
              </div>
            )}
            
            {/* Score Controls - Reorganized as requested */}
            <div className="w-full space-y-2">
              {/* -5 and +5 buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateScore(team.id, -5)}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded font-bold"
                >
                  -5
                </button>
                <button 
                  onClick={() => updateScore(team.id, 5)}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded font-bold"
                >
                  +5
                </button>
              </div>
              
              {/* -1 and +1 buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateScore(team.id, -1)}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => updateScore(team.id, 1)}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded font-bold"
                >
                  +1
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}