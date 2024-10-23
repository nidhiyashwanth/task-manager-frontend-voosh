import React from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  onSort: (option: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onSort }) => {
  return (
    <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <label htmlFor="search" className="mr-2 text-gray-700">
          Search:
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="border text-black rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="sort" className="mr-2 text-gray-700">
          Sort By:
        </label>
        <select
          id="sort"
          onChange={(e) => onSort(e.target.value)}
          className="border rounded text-black px-2 py-1 te focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
