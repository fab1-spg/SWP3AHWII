const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWatchlistsByTrackName(trackName) {
  const watchlists = await prisma.watchlistItem.findMany({
      where: { song: { name: trackName } },
      include: { watchlist: { include: { user: true } } },
  });



async function getWatchlistNamesByUser(userId) {
    const user = await prisma.benutzer.findUnique({
      where: { id: userId },
      include: { watchLists: { select: { name: true } } },
    });
    return user.watchLists.map(watchlist => watchlist.name);
  }
  
  async function getTracksByWatchlist(watchlistId) {
    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      include: { tracks: true },
    });
    return watchlist.tracks;
  }

  module.exports = { getWatchlistNamesByUser, getTracksByWatchlist, getWatchlistsByTrackName};
  

