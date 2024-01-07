import * as fs from 'fs';
import * as path from 'path';
import {Config} from "../actions/init";

export const configPath = '.config/cloudphoto';

const ini = require('ini');

export function getConfig(): Config {
    const config = {
        ...ini.parse(fs.readFileSync(path.join(configPath, 'cloudphotorc'), 'utf-8'))?.DEFAULT,
    };

    if (
        !config.bucket
        || !config.aws_access_key_id
        || !config.aws_secret_access_key
        || !config.region
        || !config.endpoint_url
    ) {
        throw new Error('Не удалось получить конфигурацию.');
    }

    return config;
}