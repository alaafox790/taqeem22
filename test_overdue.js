const academicYear = "2026/2027";
const monthNumber = 7;
const count = 4;
const index = 0;

const [year1, year2] = academicYear.split('/').map(Number);
const yearForMonth = monthNumber >= 8 ? year1 : year2;

console.log("yearForMonth", yearForMonth);
const daysInMonth = new Date(yearForMonth, monthNumber, 0).getDate();
console.log("daysInMonth", daysInMonth);
const periodLength = daysInMonth / count;
const dueDateDay = Math.round(periodLength * (index + 1));
console.log("dueDateDay", dueDateDay);

