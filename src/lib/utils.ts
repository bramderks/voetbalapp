// src/lib/utils.ts
import { prisma } from '@/lib/prisma';

export async function generateActivities() {
  await prisma.activity.deleteMany();

  const today = new Date();
  const items: {
    type: 'TRAINING' | 'MATCH';
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: 'OPEN';
  }[] = [];

  for (let i = 1; i <= 6; i++) {
    items.push({
      type: 'TRAINING',
      date: new Date(today.getTime() + i * 86400000).toISOString(),
      startTime: '18:30',
      endTime: '20:00',
      location: 'Sportpark Reuver',
      status: 'OPEN',
    });
  }

  for (let i = 1; i <= 4; i++) {
    items.push({
      type: 'MATCH',
      date: new Date(today.getTime() + (i + 6) * 86400000).toISOString(),
      startTime: '14:00',
      endTime: '15:30',
      location: 'Sportpark Reuver - Veld 1',
      status: 'OPEN',
    });
  }

  await prisma.activity.createMany({ data: items });

  return items;
}
