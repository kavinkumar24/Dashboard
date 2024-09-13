import { useEffect } from "react";

const CustomMultiSelect = ({
  theme,
  options,
  selectedOptions,
  setSelectedOptions,
  label,
  isOpen,
  onToggle,
  onClose,
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".custom-multi-select")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleOptionChange = (event, value) => {
    event.stopPropagation();

    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value));
    } else {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  const handleSelectAll = () => {
    setSelectedOptions(options);
  };

  const handleDeselectAll = () => {
    setSelectedOptions([]);
  };

  return (
    <div className={`relative custom-multi-select`}>
      {/* Dropdown Button */}
      <button
        onClick={onToggle}
        className={`p-2 border rounded w-40 ${
          theme === "light"
            ? "bg-white text-black border-gray-200"
            : "bg-slate-900 text-gray-400 border-gray-600"
        } flex justify-between items-center`}
      >
        {label}
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={`absolute mt-1 z-10 w-40 max-h-40 overflow-y-auto border rounded shadow-lg ${
            theme === "light"
              ? "bg-white text-black border-gray-200"
              : "bg-slate-900 text-gray-400 border-gray-600"
          }`}
        >
          {/* Select All / Deselect All */}
          <div className="flex flex-col p-2 border-b">
            <button
              onClick={handleSelectAll}
              className="p-2 text-blue-500 hover:bg-gray-100 w-full text-left"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="p-2 text-red-500 hover:bg-gray-100 w-full text-left"
            >
              Deselect All
            </button>
          </div>

          {/* Options */}
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
              onClick={(e) => handleOptionChange(e, option)}
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={(e) => handleOptionChange(e, option)}
                className="mr-2"
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelect;
