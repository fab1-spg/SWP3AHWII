const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

if (process.argv.length !== 3) {
    console.error('No user provided, exiting');
    process.exit(1);
}

const userName = process.argv[2].trim();
if (!userName) {
    console.error('Empty username provided, exiting');
    process.exit(1);
}

console.log(`Finding watchlist names for ${userName}`);

async function getWatchlistNamesForUser(userName) {
    try {
        return await prisma.watchlist.findMany({
            select: {
                id: true,
                name: true,
            },
            where: {
                benutzer: {
                    fullname: userName,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching watchlist names:', error);
        process.exit(1);
    }
}

async function tracksFromWatchlist(id) {
    try {
        return await prisma.track.findMany({
            where: {
                watchLists: {
                    some: { id },
                },
            },
        });
    } catch (error) {
        console.error(`Error fetching tracks for watchlist ${id}:`, error);
        return [];
    }
}

async function main() {
    const lists = await getWatchlistNamesForUser(userName);

    if (lists.length === 0) {
        console.log(`${userName} has no watchlists`);
        return;
    }

    const promises = lists.map(async (wl) => {
        const tracks = await tracksFromWatchlist(wl.id);
        console.log(
            `${userName}'s Watchlist "${wl.name}" ... ${tracks.length} tracks`
        );
        tracks.forEach((t) => {
            console.log(`    ${t.name} by ${t.artist} (${t.duration} secs)`);
        });
    });

    await Promise.all(promises);
}

main()
    .catch((error) => {
        console.error('An unexpected error occurred:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
