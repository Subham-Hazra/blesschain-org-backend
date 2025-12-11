import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class ImageProcessor {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }
  public async processImage(
    buffer: Buffer,
    fileName: string,
    width: number,
    height: number
  ): Promise<string> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      const outputFilePath = path.join(this.outputDir, fileName);
      await sharp(buffer)
        .resize(width, height)
        .png({ compressionLevel: 9 })
        .toFile(outputFilePath);
      console.log('Image processed and saved successfully:', outputFilePath);
      return outputFilePath;
    } catch (error) {
      console.error('Error processing image:', (error as Error).message);
      throw error;
    }
  }
}
