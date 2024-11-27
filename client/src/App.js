import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import WordDetails from './components/WordDetails';
import './styles/App.css';

const App = () => {
  const [wordData, setWordData] = useState(null);
  const [searchedWords, setSearchedWords] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [font, setFont] = useState(localStorage.getItem('font') || 'serif');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const changeFont = (font) => {
    setFont(font);
    localStorage.setItem('font', font);
  };

  // Save the searched word to the backend
  const saveWordToHistory = async (word) => {
    try {
      const response = await fetch('https://dictionary-web-app-3mjz.onrender.com/api/words/store-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchedWords: [word] }), // Send single word to backend
      });

      if (!response.ok) {
        console.error('Failed to save word to history:', await response.json());
      }
    } catch (error) {
      console.error('Error saving word to history:', error.message);
    }
  };

  // Fetch search history from the backend
  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('https://dictionary-web-app-3mjz.onrender.com/api/words/history');
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      const history = await response.json();
      return history;
    } catch (error) {
      console.error('Error fetching search history:', error.message);
      alert('Failed to load search history. Please try again later.');
      return [];
    }
  };

  // Search for a word and update the word data
  const searchForWord = async (word) => {
    try {
      const response = await fetch(`https://dictionary-web-app-3mjz.onrender.com/api/words/${word}`);
      if (response.ok) {
        const data = await response.json();
        setWordData(data);
        const searchedWord = data[0]?.word;
        if (searchedWord) {
          setSearchedWords((prev) => [...new Set([...prev, searchedWord])]); // Avoid duplicates in state
          saveWordToHistory(searchedWord); // Save to backend
        }
      } else {
        console.error('Failed to fetch word data.');
        alert('Failed to search for the word. Please try again.');
      }
    } catch (error) {
      console.error('Error searching for word:', error.message);
    }
  };

  return (
    <div className={`app ${theme} ${font}`}>
  <Header
    theme={theme}
    toggleTheme={toggleTheme}
    changeFont={changeFont}
    fetchSearchHistory={fetchSearchHistory}
    searchForWord={searchForWord}
  />
  <SearchBar
    setWordData={(data) => {
      setWordData(data);
      const searchedWord = data[0]?.word;
      if (searchedWord) {
        setSearchedWords((prev) => [...new Set([...prev, searchedWord])]);
        saveWordToHistory(searchedWord); // Automatically save word
      }
    }}
  />
  {wordData && (
    <WordDetails
      data={wordData}
      fetchSearchHistory={fetchSearchHistory}
      searchForWord={searchForWord}
      theme={theme}
    />
  )}
</div>
  );
};

export default App;
