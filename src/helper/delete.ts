import { promises as fs } from 'fs';

class FileManager {
  // Method to delete a file
  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log('File deleted successfully',filePath);
    } catch (error) {
      console.log('Error deleting file:', (error as Error).message);
    }
  }
}

export { FileManager };
