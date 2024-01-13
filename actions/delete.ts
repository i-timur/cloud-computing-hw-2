import {getConfig} from "../utils/get-config";
import {getS3Client} from "../clients/s3-client";
import {DeleteObjectsCommand, ListObjectsV2Command} from "@aws-sdk/client-s3";

export async function deleteAlbum(album: string, photo = '') {
    const config = getConfig();
    const client = getS3Client(config);

    const objects = [];

    const commandList = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: `${album}/`,
    });
    const {Contents: imagesMetadata} = await client.send(commandList);

    if (!imagesMetadata || (imagesMetadata && imagesMetadata.length === 0)) {
        throw new Error(`Фотографий в альбоме "${album}" не найдено`);
    }

    if (photo && !imagesMetadata.find(image => image.Key === `${album}/${photo}`)) {
        throw new Error(`Фотография "${photo}" в альбоме "${album}" не найдена`);
    }

    for (const image of imagesMetadata) {
        if (!image.Key) {
            console.log(`Не удалось загрузить файл "${image.Key}"`);
            continue;
        }

        objects.push({
            Key: image.Key,
        });
    }

    const command = new DeleteObjectsCommand({
        Bucket: config.bucket,
        Delete: {
            Objects: objects,
        },
    });
    await client.send(command);
}