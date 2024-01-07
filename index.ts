import {Command} from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import inquirer from 'inquirer';
import {init} from './actions/init';

const program = new Command();

program
    .name('cloudphoto')
    .description('Приложение командной строки (CLI) для управления альбомами, фотографиями в облачном хранилище Yandex Object Storage, для формирования и публикации веб-страниц фотоархива.')
    .version('0.1.0');

program.command('upload')
    .description('Отправка фотографий в облачное хранилище.')
    .requiredOption('--album <album>', 'Альбом, в который будут загружены фотографии.')
    .option('--path <path>', 'Путь к папке с фотографиями.', '.')
    .action(options => {
        const directory = path.resolve(process.cwd(), options.path);

        const files = fs.readdirSync(directory, {withFileTypes: true})
            .filter(file => file.isFile() && (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')))
            .map(file => file.name);

        const images = [];

        for (const file of files) {
            const image = fs.readFileSync(path.join(directory, file));
            images.push(image);
        }
    });

program.command('init')
    .description('Формирования файла настроек и создания бакета')
    .action(async () => {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'bucket',
                message: 'Укажите название бакета',
            },
            {
                type: 'input',
                name: 'aws_access_key_id',
                message: 'Введите AWS_ACCESS_KEY_ID',
            },
            {
                type: 'input',
                name: 'aws_secret_access_key',
                message: 'Введите AWS_SECRET_ACCESS_KEY',
            },
        ]);

        const config = {
            bucket: answers.bucket,
            aws_access_key_id: answers.aws_access_key_id,
            aws_secret_access_key: answers.aws_secret_access_key,
            region: 'ru-central1',
            endpoint_url: 'https://storage.yandexcloud.net',
        };
        await init(config);
        console.log('Cloudphoto успешно инициализирован.');
    });

program.parse(process.argv);
