import {S3Client} from "@aws-sdk/client-s3";
import {Config} from "../actions/init";

export const getS3Client = (config: Config) => new S3Client({
    region: config.region,
    credentials: {
        accessKeyId: config.aws_access_key_id,
        secretAccessKey: config.aws_secret_access_key,
    },
    endpoint: config.endpoint_url,
});
