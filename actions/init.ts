import * as fs from 'node:fs'
import * as path from 'node:path'
import {configPath} from '../utils/get-config';
import {CreateBucketCommand, ListBucketsCommand, S3Client} from '@aws-sdk/client-s3';

const ini = require('ini');

const template = `
[DEFAULT]
bucket = INPUT_BUCKET_NAME
aws_access_key_id = INPUT_AWS_ACCESS_KEY_ID
aws_secret_access_key = INPUT_AWS_SECRET_ACCESS_KEY
region = ru-central1
endpoint_url = https://storage.yandexcloud.net
`;

export interface Config {
    bucket: string;
    aws_access_key_id: string;
    aws_secret_access_key: string;
    region: string;
    endpoint_url: string;
}

export async function init(config: Config) {
    fs.mkdirSync(configPath, {recursive: true});

    const configTemplate = ini.parse(template);

    configTemplate.DEFAULT = { ...config };
    fs.writeFileSync(path.join(configPath, 'cloudphotorc'), ini.stringify(configTemplate));

    const client = new S3Client({
        region: config.region,
        credentials: {
            accessKeyId: config.aws_access_key_id,
            secretAccessKey: config.aws_secret_access_key,
        },
        endpoint: config.endpoint_url,
    });

    const commandList = new ListBucketsCommand({});
    const response = await client.send(commandList);
    const buckets = response.Buckets;

    if (buckets) {
        const bucket = buckets.find(bucket => bucket.Name === config.bucket);

        if (!bucket) {
            const commandCreate = new CreateBucketCommand({
                Bucket: config.bucket,
                ACL: 'public-read',
            });
            await client.send(commandCreate);
        }
    } else {
        throw new Error('Не удалось получить список бакетов.');
    }
}