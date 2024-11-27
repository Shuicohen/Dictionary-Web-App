import React, { useState } from 'react';

const WordDetails = ({
  data,
  isHistoryOpen,
  setIsHistoryOpen,
  searchHistory,
  searchForWord,
  deleteFromHistory,
  theme,
}) => {
  const wordData = data && data.length > 0 ? data[0] : {};
  const { word = 'No Word Available', phonetics = [], meanings = [], sourceUrls = [] } = wordData;

  const handleHistoryClick = (historyWord) => {
    if (historyWord) {
      searchForWord(historyWord);
      setIsHistoryOpen(false); // Hide the popout after selecting a word
    }
  };

  const handleDeleteHistory = async (historyWord) => {
    try {
      await deleteFromHistory(historyWord); // Call the backend to delete the word
    } catch (error) {
      console.error('Error deleting word from history:', error.message);
    }
  };

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  if (!data || data.length === 0) {
    return <p>No word data available. Please try searching for a word.</p>;
  }

  return (
    <div className="word-details">
      <h2>{word}</h2>

      {/* Phonetics Section */}
      {phonetics.length > 0 &&
        phonetics.map((phonetic, index) => (
          <div key={index} className="phonetic">
            {phonetic.text && <p>{phonetic.text}</p>}
            {phonetic.audio && (
              <div className="custom-audio" onClick={() => playAudio(phonetic.audio)}>
                <button className="play-button">▶</button>
              </div>
            )}
          </div>
        ))}

      {/* Meanings Section */}
      {meanings.length > 0 ? (
        meanings.map((meaning, index) => (
          <div key={index} className="meanings">
            <h3>{meaning.partOfSpeech || 'N/A'}</h3>
            <ul>
              {meaning.definitions.map((definition, idx) => (
                <li key={idx}>
                  <p>{definition.definition}</p>
                  {definition.example && <p className="example">Example: {definition.example}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No meanings available.</p>
      )}

      {/* Source Section */}
      {sourceUrls.length > 0 && (
        <p className="source">
          Source:{' '}
          <a href={sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="source-link">
            {sourceUrls[0]}
          </a>
        </p>
      )}

      {/* History Popout */}
      {isHistoryOpen && (
        <div className={`history-popout ${isHistoryOpen ? 'open' : ''} ${theme}`}>
  <div className="history-header">
    <h2>Search History</h2>
    <button className="close-button" onClick={() => setIsHistoryOpen(false)}>
      ×
    </button>
  </div>
  <ul>
    {searchHistory.length > 0 ? (
      searchHistory.map((historyWord, index) => (
        <li key={index} className="history-item">
          <span onClick={() => handleHistoryClick(historyWord)}>{historyWord}</span>
          <button onClick={() => handleDeleteHistory(historyWord)} className="delete-button">
            ×
          </button>
        </li>
      ))
    ) : (
      <li>No search history available</li>
    )}
  </ul>
</div>

      )}
    </div>
  );
};

export default WordDetails;
