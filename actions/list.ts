import {getConfig} from "../utils/get-config";
import {getS3Client} from "../clients/s3-client";
import {ListObjectsV2Command} from "@aws-sdk/client-s3";

export interface Album {
    name: string;
    files: string[];
}

export async function list(album?: string): Promise<Album | Album[]> {
    const config = getConfig();
    const client = getS3Client(config);

    const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: album ? `${album}/` : '',
    });

    const {Contents: imagesMetadata} = await client.send(command);

    if (!imagesMetadata || (imagesMetadata && imagesMetadata.length === 0)) {
        throw new Error(`Фотографий не найдено`);
    }

    const albums: Album[] = [];

    for (const image of imagesMetadata) {
        if (!image.Key) {
            console.log(`Не удалось загрузить файл "${image.Key}"`);
            continue;
        }

        const albumName = image.Key.split('/')[0];
        const album = albums.find(album => album.name === albumName);

        if (album) {
            album.files.push(image.Key.replace(`${albumName}/`, ''));
        } else {
            albums.push({
                name: albumName,
                files: [image.Key.replace(`${albumName}/`, '')],
            });
        }
    }

    return album ? albums[0] : albums;
}
