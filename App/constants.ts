
import { ParkingLocation } from './types';

export const LOCATIONS: ParkingLocation[] = [
  // Hotels & Restaurants - 2 Levels: L1(100 Bikes), L2(100 Cars)
  ...['Taj Hotel', 'Regency Hotel', 'Aryan Family Delight', 'Ramada', 'Jagat Niwas', 'Badami Fort', 'Hotel Teej'].map((name, i) => ({
    id: `hotel-${i}`,
    name,
    type: 'hotel' as const,
    levels: [
      { levelNumber: 1, type: 'two-wheeler' as const, capacity: 100, occupied: Math.floor(Math.random() * 80) },
      { levelNumber: 2, type: 'four-wheeler' as const, capacity: 100, occupied: Math.floor(Math.random() * 80) }
    ],
    latitude: 26.842 + (i * 0.004) - (i % 2 === 0 ? 0.001 : -0.001),
    longitude: 80.950 + (i * 0.005) - (i % 2 === 0 ? -0.002 : 0.002)
  })),
  // Shopping Malls - 3 Levels: L1(150 Bikes), L2(200 Cars), L3(200 Cars)
  ...['Phoenix Pallasio', 'Pheonix sMart', 'Lulu Mall', 'Z-square', 'Rave Moti'].map((name, i) => ({
    id: `mall-${i}`,
    name,
    type: 'mall' as const,
    levels: [
      { levelNumber: 1, type: 'two-wheeler' as const, capacity: 150, occupied: Math.floor(Math.random() * 120) },
      { levelNumber: 2, type: 'four-wheeler' as const, capacity: 200, occupied: Math.floor(Math.random() * 180) },
      { levelNumber: 3, type: 'four-wheeler' as const, capacity: 200, occupied: Math.floor(Math.random() * 150) }
    ],
    latitude: 26.804 + (i * 0.005) + (i % 2 === 0 ? 0.003 : -0.003),
    longitude: 81.012 + (i * 0.003) + (i % 2 === 0 ? -0.004 : 0.004)
  })),
  // Centralized Parking - 3 Levels: L1(400 Bikes), L2(400 Cars), L3(400 Cars)
  ...['Downtown Parking', 'Central Parking', 'OuterCity Parking'].map((name, i) => ({
    id: `central-${i}`,
    name,
    type: 'central' as const,
    levels: [
      { levelNumber: 1, type: 'two-wheeler' as const, capacity: 400, occupied: Math.floor(Math.random() * 300) },
      { levelNumber: 2, type: 'four-wheeler' as const, capacity: 400, occupied: Math.floor(Math.random() * 350) },
      { levelNumber: 3, type: 'four-wheeler' as const, capacity: 400, occupied: Math.floor(Math.random() * 200) }
    ],
    latitude: 26.852 + (i * 0.006) - (i % 2 === 0 ? 0.002 : -0.002),
    longitude: 80.910 + (i * 0.004) + (i % 2 === 0 ? -0.003 : 0.003)
  }))
];
