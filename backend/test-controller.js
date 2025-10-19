// Test if controller loads correctly
const liveClassController = require('./src/controllers/liveClassController');

console.log('Testing controller functions...\n');

const functions = [
  'createClass',
  'getClass',
  'getClassByClassId',
  'getActiveClasses',
  'getUpcomingClasses',
  'getTeacherClasses',
  'getStudentClasses',
  'searchClasses',
  'startClass',
  'endClass',
  'cancelClass',
  'getClassStatistics',
  'deleteClass'
];

let allOk = true;
functions.forEach(fn => {
  const exists = typeof liveClassController[fn] === 'function';
  console.log(`${exists ? '✅' : '❌'} ${fn}: ${exists ? 'OK' : 'MISSING'}`);
  if (!exists) allOk = false;
});

console.log(`\n${allOk ? '✅ All functions exist!' : '❌ Some functions are missing!'}`);
process.exit(allOk ? 0 : 1);
