// C:\Users\sefan\Desktop\AE1\AE1\src\pages\api\admin\dashboard-stats.js
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const hotelsCount = await getCountFromServer(collection(db, 'hotels'));
      const bookingsCount = await getCountFromServer(collection(db, 'bookings'));
      
      // Attempt to get users count, set to 0 if collection doesn't exist
      let usersCount;
      try {
        usersCount = await getCountFromServer(collection(db, 'users'));
      } catch (error) {
        console.error('Error getting users count:', error);
        usersCount = { data: () => ({ count: 0 }) };
      }

      const stats = {
        hotels: hotelsCount.data().count,
        bookings: bookingsCount.data().count,
        users: usersCount.data().count
      };

      console.log('Stats:', stats);

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}