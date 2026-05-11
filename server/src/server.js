import { execSync } from 'child_process';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Running seed...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Setup error:', error.message);
}

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
