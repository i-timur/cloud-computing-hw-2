import {PutObjectCommand, PutBucketWebsiteCommand, ListObjectsV2Command} from "@aws-sdk/client-s3";
import {getConfig} from "../utils/get-config";
import {getS3Client} from "../clients/s3-client";
import {generateAlbum, Photo} from "../utils/generate-album";
import {generateIndex} from "../utils/generate-index";
import {generateError} from "../utils/generate-error";

interface Album {
    name: string;
    photos: Photo[];
}

async function getAlbums() {
    const config = getConfig();
    const client = getS3Client(config);

    const commandList = new ListObjectsV2Command({
        Bucket: config.bucket,
    });

    const { Contents } = await client.send(commandList);

    if (!Contents) {
        throw new Error('Не найдено ни одного объекта в бакете');
    }

    let albumNames = Contents
        .filter(item =>
            item.Key && item.Key !== 'index.html' && item.Key !== 'error.html' && !item.Key.startsWith('album')
        )
        .map(item => item.Key!.split('/')[0]);

    albumNames = albumNames.filter((item, index) => albumNames.indexOf(item) === index);

    const albums: Album[] = [];

    for (const albumName of albumNames) {
        const commandList = new ListObjectsV2Command({
            Bucket: config.bucket,
            Prefix: `${albumName}/`,
        });
        const { Contents } = await client.send(commandList);

        if (!Contents) {
            throw new Error('Не найдено ни одного объекта в бакете');
        }

        const photos = Contents
            .map(item => {
                const photoName = item.Key!.split('/')[1];
                return {
                    url: `https://storage.yandexcloud.net/${config.bucket}/${albumName}/${photoName}`,
                    name: photoName,
                };
            });

        albums.push({
            name: albumName,
            photos,
        });
    }

    return albums;
}

export async function mksite() {
    const config = getConfig();
    const client = getS3Client(config);

    const albums = await getAlbums();

    const htmlIndex = generateIndex(albums.map(album => album.name));
    const htmlError = generateError();
    const htmlAlbums = albums.map(album => generateAlbum(album.photos));

    const commandIndex = new PutObjectCommand({
        Bucket: config.bucket,
        Key: 'index.html',
        Body: htmlIndex,
        ContentType: 'text/html; charset=utf-8',
    });
    const commandError = new PutObjectCommand({
        Bucket: config.bucket,
        Key: 'error.html',
        Body: htmlError,
        ContentType: 'text/html; charset=utf-8',
    });
    const commandAlbums = htmlAlbums.map((html, index) => new PutObjectCommand({
        Bucket: config.bucket,
        Key: `album${index + 1}.html`,
        Body: html,
        ContentType: 'text/html; charset=utf-8',
    }));

    await client.send(commandIndex);
    await client.send(commandError);
    await Promise.all(commandAlbums.map(command => client.send(command)));

    const commandWebsite = new PutBucketWebsiteCommand({
        Bucket: config.bucket,
        WebsiteConfiguration: {
            ErrorDocument: {
                Key: 'error.html',
            },
            IndexDocument: {
                Suffix: 'index.html',
            },
        },
    });

    await client.send(commandWebsite);

    console.log(`Веб-сайт создан. URL: http://${config.bucket}.website.yandexcloud.net`);
}
