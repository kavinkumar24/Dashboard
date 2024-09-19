import { useState, useEffect } from "react";
import './style.css';

const RangeSlider = ({ min, max, onRangeChange }) => {
  const [fromValue, setFromValue] = useState(min);
  const [toValue, setToValue] = useState(max);

  useEffect(() => {
    // Reset fromValue and toValue when min or max changes
    setFromValue(min);
    setToValue(max);
  }, [min, max]);

//   useEffect(() => {
//     // Call the callback whenever the range values change
//     onRangeChange(fromValue, toValue);
//   }, [fromValue, toValue, onRangeChange]);

  useEffect(() => {
    // Only call onRangeChange if values have actually changed
    if (fromValue !== min || toValue !== max) {
      onRangeChange(fromValue, toValue);
    }
  }, [fromValue, toValue, onRangeChange, min, max]); 

  const controlFromSlider = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > toValue) {
      setFromValue(toValue);
    } else {
      setFromValue(value);
    }
  };

  const controlToSlider = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value < fromValue) {
      setToValue(fromValue);
    } else {
      setToValue(value);
    }
  };

  const controlFromInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > toValue) {
      setFromValue(toValue);
    } else {
      setFromValue(value);
    }
  };

  const controlToInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value < fromValue) {
      setToValue(fromValue);
    } else {
      setToValue(value);
    }
  };

  return (
    <div className="flex flex-col w-4/5 my-5">
      <div className="relative min-h-[20px]">
        <input
          id="fromSlider"
          type="range"
          value={fromValue}
          min={min}
          max={max}
          onChange={controlFromSlider}
          className="absolute w-full appearance-none h-2 bg-gray-300 pointer-events-none"
        />
        <input
          id="toSlider"
          type="range"
          value={toValue}
          min={min}
          max={max}
          onChange={controlToSlider}
          className="absolute w-full appearance-none h-2 bg-transparent pointer-events-none"
        />
      </div>

      <div className="flex justify-between text-lg text-gray-600">
        <div className="flex flex-col items-center">
         
          <input
            type="number"
            id="fromInput"
            value={fromValue}
            min={min}
            max={max}
            onChange={controlFromInput}
            className="w-16 h-8 text-lg text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-center"
          />
        </div>
        <div className="flex flex-col items-center">
          
          <input
            type="number"
            id="toInput"
            value={toValue}
            min={min}
            max={max}
            onChange={controlToInput}
            className="w-16 h-8 text-lg text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-center"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
