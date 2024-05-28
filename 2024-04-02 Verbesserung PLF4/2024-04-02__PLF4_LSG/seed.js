const { fakerDE } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userCountTarget = 10;
const trackCountTarget = 50;
const watchlistCountTarget = 25;
const watchlistFillTarget = 15;

async function seed() {
    try {
        
        const userCountActual = await prisma.benutzer.count();
        const usersToCreate = userCountTarget - userCountActual;
        if (usersToCreate > 0) {
            const userPromises = Array.from({ length: usersToCreate }).map(() =>
                prisma.benutzer.create({
                    data: {
                        fullname: fakerDE.person.fullName(),
                        email: fakerDE.internet.email(),
                    },
                })
            );
            await Promise.all(userPromises);
            console.log(`Created ${usersToCreate} Benutzer, now there are ${await prisma.benutzer.count()} Benutzer in DB`);
        }

        
        const trackCountActual = await prisma.track.count();
        const tracksToCreate = trackCountTarget - trackCountActual;
        if (tracksToCreate > 0) {
            const trackPromises = Array.from({ length: tracksToCreate }).map(() =>
                prisma.track.create({
                    data: {
                        name: fakerDE.music.songName(),
                        duration: Math.floor(Math.random() * 300),
                        genre: fakerDE.music.genre(),
                        artist: fakerDE.person.fullName(),
                    },
                })
            );
            await Promise.all(trackPromises);
            console.log(`Created ${tracksToCreate} tracks, now there are ${await prisma.track.count()} Tracks in DB`);
        }

       
        const userIds = (await prisma.benutzer.findMany({ select: { id: true } })).map((user) => user.id);
        const watchlistCountActual = await prisma.watchlist.count();
        const watchlistsToCreate = watchlistCountTarget - watchlistCountActual;
        if (watchlistsToCreate > 0) {
            const watchlistPromises = Array.from({ length: watchlistsToCreate }).map(() =>
                prisma.watchlist.create({
                    data: {
                        name: fakerDE.word.noun(),
                        createdAt: fakerDE.date.recent(),
                        benutzer: {
                            connect: {
                                id: userIds[Math.floor(Math.random() * userIds.length)],
                            },
                        },
                    },
                })
            );
            await Promise.all(watchlistPromises);
            console.log(`Created ${watchlistsToCreate} watchlists, now there are ${await prisma.watchlist.count()} Watchlists in DB`);
        }

        
        const watchlistIds = (await prisma.watchlist.findMany({ select: { id: true } })).map((wl) => wl.id);
        const allTracks = await prisma.track.findMany({ select: { id: true } });
        for (let watchListCuid of watchlistIds) {
            const trackCountInWatchlistI = await prisma.track.count({
                where: {
                    watchLists: { some: { id: watchListCuid } },
                },
            });
            console.log(`${trackCountInWatchlistI} tracks in Watchlist ${watchListCuid}`);
            if (trackCountInWatchlistI >= watchlistFillTarget) {
                console.log('continuing ..');
                continue;
            }
            const createCount = Math.floor(Math.random() * watchlistFillTarget) - trackCountInWatchlistI;
            if (createCount <= 0) {
                continue;
            }
            const rndTracklist = Array.from({ length: createCount }).map(
                () => allTracks[Math.floor(Math.random() * allTracks.length)]
            ); 
            await prisma.watchlist.update({
                where: {
                    id: watchListCuid,
                },
                data: {
                    tracks: { connect: rndTracklist },
                },
            });
            console.log(`Created ${createCount} tracks in watchlist ${watchListCuid}`);
        }
    } catch (e) {
        console.error(`FEHLER: ${e.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

seed()
    .then(() => console.log('Done seeding'))
    .catch((e) => console.error(`Unexpected error: ${e.message}`));
