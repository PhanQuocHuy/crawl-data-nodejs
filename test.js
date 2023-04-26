const currentDate = new Date();
const numberOfDaysToAdd = 7;

const newDate = new Date(currentDate);
newDate.setDate(currentDate.getDate() + numberOfDaysToAdd);

console.log(`Current date: ${currentDate}`);
console.log(`New date: ${newDate}`);
