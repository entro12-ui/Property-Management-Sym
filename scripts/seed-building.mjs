/**
 * Seed the main building: Ground Floor + 8 floors, ~50 rental rooms.
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Rooms per floor: ground has 6, floors 1-8 have 5-6 each ≈ 50 total */
const ROOMS_PER_FLOOR: Record<number, number> = {
  0: 6,
  1: 6,
  2: 6,
  3: 6,
  4: 6,
  5: 6,
  6: 5,
  7: 5,
  8: 5,
};

const BASE_RENT = 350;

async function main() {
  const existing = await prisma.building.findFirst({ where: { name: 'Central Tower' } });
  if (existing) {
    console.log('Building "Central Tower" already exists (id: %s). Skipping seed.', existing.id);
    return;
  }

  const building = await prisma.building.create({
    data: {
      name: 'Central Tower',
      address: '123 Main Street',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      numberOfFloors: 9,
      parkingSpaces: 10,
      utilitiesInfo: 'Water and electricity included in common areas',
      notes: 'Ground floor + 8 upper floors, ~50 rental rooms',
    },
  });

  let totalRooms = 0;
  for (let floor = 0; floor <= 8; floor++) {
    const count = ROOMS_PER_FLOOR[floor] ?? 5;
    const floorPrefix = floor === 0 ? 'G' : String(floor);
    for (let i = 1; i <= count; i++) {
      const unitNumber = `${floorPrefix}${String(i).padStart(2, '0')}`;
      const rentVariation = (floor * 25) + (i * 5);
      await prisma.unit.create({
        data: {
          buildingId: building.id,
          unitNumber,
          floorNumber: floor,
          unitType: 'ROOM',
          sizeSqm: 18 + floor * 0.5,
          rentAmount: BASE_RENT + rentVariation,
          status: 'AVAILABLE',
        },
      });
      totalRooms++;
    }
  }

  console.log('Created building "%s" with %d rooms across 9 floors (ground + 8).', building.name, totalRooms);
  console.log('Building ID: %s', building.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
