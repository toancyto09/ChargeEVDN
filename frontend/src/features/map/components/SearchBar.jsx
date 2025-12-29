import { Search, SlidersHorizontal, X } from 'lucide-react';

export function SearchBar({ onSearch, onFilterToggle, showFilters }) {
  const handleChange = (e) => {
    const value = e.target.value;
    onSearch(value); // Real-time search!
  };

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 flex items-center gap-2 px-4 py-3">
      <Search className="text-gray-400 flex-shrink-0" size={20} />

      <input
        type="text"
        onChange={handleChange}
        placeholder="Tìm trạm sạc theo tên, địa chỉ..."
        className="flex-1 outline-none text-gray-900 placeholder-gray-400"
      />

      <button
        type="button"
        onClick={onFilterToggle}
        className={`flex-shrink-0 p-2 rounded-lg transition-all ${
          showFilters
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <SlidersHorizontal size={20} />
      </button>
    </div>
  );
}
