var cron = require('node-cron');
 
cron.schedule('1-3 * * * * *', () => {
  console.log('running a task every minute');
});