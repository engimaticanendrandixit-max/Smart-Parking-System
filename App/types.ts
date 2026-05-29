
export type View = 'login' | 'signup' | 'dashboard' | 'reserve' | 'success';

export interface User {
  fullName: string;
  email: string;
  phone: string;
  vehicleNo: string;
  fastagId: string;
  walletBalance: number;
}

export interface ParkingLocation {
  id: string;
  name: string;
  type: 'hotel' | 'mall' | 'central';
  levels: ParkingLevel[];
  latitude?: number;
  longitude?: number;
}

export interface ParkingLevel {
  levelNumber: number;
  type: 'two-wheeler' | 'four-wheeler';
  capacity: number;
  occupied: number;
}

export interface Reservation {
  locationName: string;
  level: number;
  slotId: string;
  vehicleType: 'two-wheeler' | 'four-wheeler';
  otp?: string;
}
