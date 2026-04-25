import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

const s3Client = new S3Client({
    region:"auto",
    endpoint:process.env.CLOUD_ENDPOINT!,
    credentials:{
        accessKeyId: process.env.CLOUD_ACCESS_KEY!,
        secretAccessKey:process.env.CLOUD_SECRET_KEY!
    },
});

export const uploadImageToCloud = async(imageBuffer:Buffer,mimetype:string):Promise<string> =>{
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}`;
    const extension = mimetype === 'image/png' ? '.png' : mimetype === 'image/webp' ? '.webp' : '.jpg';
    const finalFileName = `reports/${uniqueFileName}${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.CLOUD_BUCKET_NAME!,
        Key:finalFileName,
        Body:imageBuffer,
        ContentType:mimetype,
    });

    await s3Client.send(command);

   return `${process.env.CLOUD_PUBLIC_URL}/${finalFileName}`;
};

