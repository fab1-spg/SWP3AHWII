const { PrismaClient } = require('@prisma/client');
const faker = require('faker');

const prisma = new PrismaClient();

async function seedDatabase() {
    await createUsers(10);
    await createSongs(30);

    const users = await prisma.user.findMany();
    await createWatchlists(users.length * 2, users);

    await fillWatchlists(100);
}

async function createUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
        const email = faker.internet.email();
        const fullName = faker.name.findName();
        users.push({
            email,
            fullName,
        });
    }
    await prisma.user.createMany({ data: users });
}

async function createSongs(count) {
    const songs = [];
    for (let i = 0; i < count; i++) {
        const genre = faker.music.genre();
        const songName = faker.music.songName();
        songs.push({
            genre,
            name: songName,
        });
    }
    await prisma.song.createMany({ data: songs });
}

async function createWatchlists(count, users) {
    const watchlists = [];
    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        watchlists.push({
            userId: user.id,
        });
    }
    await prisma.watchlist.createMany({ data: watchlists });
}

async function fillWatchlists(songCount) {
    const watchlists = await prisma.watchlist.findMany();
    const songs = await prisma.song.findMany();
    const watchlistItems = [];
    for (const watchlist of watchlists) {
        for (let i = 0; i < songCount; i++) {
            const song = songs[Math.floor(Math.random() * songs.length)];
            watchlistItems.push({
                watchlistId: watchlist.id,
                songId: song.id,
            });
        }
    }
    await prisma.watchlistItem.createMany({ data: watchlistItems });
}

seedDatabase()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
