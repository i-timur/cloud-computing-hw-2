import * as fs from 'fs';
import * as path from 'path';

const templateError = `
<!doctype html>
<html>
    <head>
        <title>Фотоархив</title>
        <meta charset="utf-8">
    </head>
<body>
    <h1>Ошибка</h1>
    <p>Ошибка при доступе к фотоархиву. Вернитесь на <a href="index.html">главную страницу</a> фотоархива.</p>
</body>
</html>
`;

export function generateError() {
    return templateError;
}
