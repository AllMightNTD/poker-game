const mysql = require('mysql2/promise');

async function dropFk() {
  const connection = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3v3UcJ5pqCJoJQE.root',
    password: 'ZUSgxMbFc57jAwDi',
    database: 'pokers',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await connection.query('ALTER TABLE blogs DROP FOREIGN KEY FK_b324119dcb71e877cee411f7929');
    console.log('Dropped FK successfully');
  } catch (err) {
    console.log('Error dropping FK:', err.message);
  }

  await connection.end();
}

dropFk();
