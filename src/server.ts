import dotenv from 'dotenv';
import "tsconfig-paths/register"
dotenv.config();
import { App } from '@/App';
const port = (process.env.PORT || 3091) as number;
const mongoUri = process.env.MONGODB_URL as string
if (!mongoUri) {
    throw new Error('MONGODB_URL is not defined in the environment variables');
  }
  
const app = new App();
try {
    app.start(port, mongoUri);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }

process.on('SIGINT', () => {
    app.stop();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    app.stop();
    process.exit(0);
  });
