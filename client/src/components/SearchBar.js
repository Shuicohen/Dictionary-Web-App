import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ setWordData }) => {
  const [input, setInput] = useState('');

  const fetchWordData = async () => {
    if (!input.trim()) {
      alert('Please enter a word.');
      return;
    }

    try {
      const response = await axios.get(`https://dictionary-web-app-3mjz.onrender.com/api/words/${input}`);
      console.log('Fetched data:', response.data); // Log the data for debugging
      setWordData(response.data); // Update state with the full response
      setInput('');
    } catch (error) {
      if (error.response?.status === 404) {
        alert(`The word "${input}" was not found.`);
      } else {
        alert('Error fetching word data. Please try again later.');
      }
      console.error('Error fetching word data:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWordData();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for a word..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
