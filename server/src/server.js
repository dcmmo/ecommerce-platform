import dotenv from 'dotenv';
import app from './app.js';
import { prisma } from './utils/prisma.js';

dotenv.config();

const port = process.env.PORT || 5001;

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    await prisma.$connect();
    console.log('Database connection OK');
  } catch (error) {
    console.error('Database connection FAILED:', error.message);
  }
});
