const isDaysValid = (days) => {
  const parsedDays = parseInt(days);
  return !isNaN(parsedDays) && parsedDays >= 0;
};
function excelSerialDateToDate(serial) {
  if (!serial || isNaN(serial)) {
    return null;
  }

  const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts from 1899-12-30
  const days = Math.floor(serial); // Get the whole part of the serial date
  const timeFraction = serial - days; // Get the time fraction of the day

  // Calculate the full date
  const date = new Date(excelEpoch.getTime() + days * 86400000); // Convert days to milliseconds

  // Add the time fraction (in milliseconds)
  date.setMilliseconds(date.getMilliseconds() + timeFraction * 86400000); // 86400000 ms in a day

  return date;
}

function formatDateForMySQL(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { formatDateForMySQL, excelSerialDateToDate, isDaysValid };
