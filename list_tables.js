const { db } = require('./backend/src/db');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
