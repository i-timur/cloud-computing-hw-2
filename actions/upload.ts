import { PutObjectCommand } from "@aws-sdk/client-s3";
import {getS3Client} from "../clients/s3-client";
import {getConfig} from "../utils/get-config";

export interface File {
    name: string;
    data: Buffer;
}

export async function upload(album: string, files: File[]) {
    const config = getConfig();
    const client = getS3Client(config);

    for (const file of files) {
        try {
            const command = new PutObjectCommand({
                Bucket: config.bucket,
                Key: `${album}/${file.name}`,
                Body: file.data,
                ACL: 'public-read',
            });
            await client.send(command);
        } catch (e) {
            console.error(`Не удалось загрузить файл "${file.name}"`);
        }
    }
}
