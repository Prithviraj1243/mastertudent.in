import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

// Configure postgres without SSL (since we added ?sslmode=disable to DATABASE_URL)
const sql = postgres(connectionString, {
  ssl: false, // Disabled to avoid SSL certificate issues
  connection: {
    application_name: 'masterstudent_app'
  },
  transform: {
    undefined: null,
  },
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export default sql;
