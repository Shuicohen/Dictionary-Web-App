import React, { useState } from 'react';
import { FaBook } from 'react-icons/fa';
import ReactSwitch from 'react-switch';

const Header = ({ theme, toggleTheme, changeFont, fetchSearchHistory, searchForWord }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleFetchHistory = async () => {
    try {
      const history = await fetchSearchHistory();
      setSearchHistory(history || []);
      setIsHistoryOpen(!isHistoryOpen); // Toggle visibility
    } catch (error) {
      console.error('Error fetching search history:', error.message);
    }
  };

  const handleHistoryClick = (word) => {
    searchForWord(word);
    setIsHistoryOpen(false); // Close the history popout
  };

  const handleDeleteHistory = async (word) => {
    try {
      const response = await fetch('http://localhost:5000/api/words/delete-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
  
      if (response.ok) {
        // Update the local search history immediately
        const updatedHistory = searchHistory.filter((item) => item !== word);
        setSearchHistory(updatedHistory);
      } else {
        const error = await response.json();
        console.error('Failed to delete word from history:', error);
        alert(error.error || 'Failed to delete the word from history.');
      }
    } catch (error) {
      console.error('Error deleting word from history:', error.message);
      alert('An error occurred. Please try again.');
    }
  };
  


  return (
    <header className="header">
      <div className="left-controls">
        <FaBook
          className="book-icon"
          onClick={handleFetchHistory}
          title="View Search History"
        />
        <h1>Dictionary</h1>
      </div>
      <div className="right-controls">
        <select
          onChange={(e) => changeFont(e.target.value)}
          defaultValue={localStorage.getItem('font') || 'serif'}
        >
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans Serif</option>
          <option value="monospace">Monospace</option>
        </select>
        <ReactSwitch
          onChange={toggleTheme}
          checked={theme === 'dark'}
          checkedIcon={false}
          uncheckedIcon={false}
        />
      </div>

      {/* History Popout */}
      {isHistoryOpen && (
        <div className={`history-popout ${theme}`}>
          <div className="history-header">
            <h2>Search History</h2>
            <button className="close-button" onClick={() => setIsHistoryOpen(false)}>
              ×
            </button>
          </div>
          <ul>
            {searchHistory.length > 0 ? (
              searchHistory.map((word, index) => (
                <li key={index} className="history-item">
                  <span onClick={() => handleHistoryClick(word)}>{word}</span>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteHistory(word)}
                  >
                    ×
                  </button>
                </li>
              ))
            ) : (
              <li>No search history available.</li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
