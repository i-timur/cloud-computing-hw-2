import {GetObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import {getS3Client} from "../clients/s3-client";
import {getConfig} from "../utils/get-config";
import {File} from "./upload";

export async function download(album: string): Promise<File[]> {
    const config = getConfig();
    const client = getS3Client(config);

    const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: `${album}/`,
    });
    const {Contents: imagesMetadata} = await client.send(command);

    if (!imagesMetadata || (imagesMetadata && imagesMetadata.length === 0)) {
        throw new Error(`Фотографий в альбоме "${album}" не найдено`);
    }

    const images: File[] = []

    for (const image of imagesMetadata) {
        if (!image.Key) {
            throw new Error(`Не удалось загрузить файл "${image.Key}"`);
        }

        try {
            const command = new GetObjectCommand({
                Bucket: config.bucket,
                Key: image.Key,
            });
            const {Body: data } = await client.send(command);

            if (!data) {
                throw new Error(`Не удалось загрузить файл "${image.Key}"`);
            }

            const array = await data.transformToByteArray();

            images.push({
                name: image.Key.replace(`${album}/`, ''),
                data: array,
            });
        } catch (e) {
            console.error(`Не удалось загрузить файл "${image.Key}"`);
        }
    }

    return images;
}
