const templateAlbum = `
<!doctype html>
<html>
    <head>
        <title>Фотоархив</title>
        <meta charset="utf-8">
    </head>
<body>
    <h1>Фотоархив</h1>
    <ul>
        {INSERT_ALBUMS}
    </ul>
</body>
`;

export function generateIndex(albumNames: string[]) {
    const albums = [];

    for (let i = 0; i < albumNames.length; i++) {
        albums.push(`<li><a href="album${i + 1}.html">${albumNames[i]}</li>`);
    }

    return templateAlbum.replace('{INSERT_ALBUMS}', albums.join('\n'));
}
