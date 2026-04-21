import { buffer } from "node:stream/consumers";
import sharp from "sharp"

const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  format: 'jpeg' as const,  
} as const;

export const optimizeImage = async (inputBuffer:Buffer) => {
    const image = sharp(inputBuffer).rotate();

    const metadata = await image.metadata();

    const processed = await image
        .resize({
            width: IMAGE_CONFIG.maxWidth,
            height: IMAGE_CONFIG.maxHeight,
            fit:"inside",
            withoutEnlargement:true
        })
        .toFormat(IMAGE_CONFIG.format, {quality:IMAGE_CONFIG.quality})
        .withMetadata({})
        .toBuffer()
    
    return{
        buffer:processed,
            metadata: {
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            originalFormat: metadata.format,
            originalSize: inputBuffer.length,
            optimizedSize: processed.length,
        },
    }
}