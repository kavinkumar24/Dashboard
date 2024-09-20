import { useEffect } from "react";
import { IoMdCheckbox } from "react-icons/io";
import { RiCheckboxBlankLine } from "react-icons/ri";

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
        className={`p-2 border rounded w-48 flex justify-between items-center transition-all duration-300 ease-in-out ${
          theme === "light"
            ? "bg-white text-black border-gray-300"
            : "bg-slate-900 text-gray-300 border-gray-700"
        }`}
      >
        {label}
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 z-10 w-48 max-h-52 overflow-y-auto rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
            theme === "light"
              ? "bg-white text-black border-gray-300"
              : "bg-slate-900 text-gray-300 border-gray-700"
          }`}
          style={{ backdropFilter: 'blur(10px)' }} // Adds a nice blur effect
        >
          {/* Select All / Deselect All */}
          <div className="flex justify-between p-2 border-b border-gray-300">
            <button
              onClick={handleSelectAll}
              className="p-2 text-blue-500 hover:bg-gray-200 rounded transition duration-200 ease-in-out w-1/2 text-left"
            >
              <IoMdCheckbox className="inline mr-2" />
              <span className="text-sm">Select All</span>
            </button>
            <button
              onClick={handleDeselectAll}
              className="p-2 text-red-500 hover:bg-gray-200 rounded transition duration-200 ease-in-out w-1/2 text-left"
            >
              <RiCheckboxBlankLine className="inline mr-2" />
              <span className="text-sm">Deselect All</span>
            </button>
          </div>

          {/* Options */}
          {options.map((option) => (
            <div
              key={option}
              className={`flex items-center p-2 cursor-pointer transition-colors duration-200 ease-in-out ${
                theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-600'
              } hover:text-blue-500`}
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
