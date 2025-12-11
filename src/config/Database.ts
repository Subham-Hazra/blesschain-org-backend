import mongoose, { Mongoose } from 'mongoose';

export class Database {
  private static instance: Mongoose;

  private constructor() {}

  public static async connect(uri: string): Promise<void> {
    if (!Database.instance) {
      try {
        Database.instance = await mongoose.connect(uri, {
        //   useNewUrlParser: true,
        //   useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit process if connection fails
      }
    }
  }

  public static getInstance(): Mongoose {
    if (!Database.instance) {
      throw new Error('Database connection not established');
    }
    return Database.instance;
  }
}
