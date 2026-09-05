const fs = require('fs');
let path = 'backend/src/notification_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("request(app).post('/api/appointments')", "request(app).post('/api/appointments/book')");

fs.writeFileSync(path, code);
