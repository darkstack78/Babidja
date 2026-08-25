import { PrismaClient, TenantType } from '@prisma/client';

const prisma = new PrismaClient();

// Reprend exactement les données factices de apps/web/src/data/mock.ts (mêmes id,
// noms, prix, descriptions) pour que le passage du frontend du mock au vrai
// backend soit invisible à l'écran tant que le contenu réel n'est pas saisi.

const HOTEL_TENANT_ID = 'hotel-babydja';
const CAR_TENANT_ID = 'babydja-auto';

const rooms = [
  {
    id: 'standard',
    name: 'Chambre Standard',
    description:
      'Chambre confortable avec lit queen size, climatisation, wifi et bureau. Idéale pour les séjours d’affaires courts.',
    basePrice: 45000,
    capacityAdults: 2,
    capacityChildren: 1,
    sizeSqm: 25,
    kind: 'room',
    amenities: ['Wi-Fi', 'Climatisation', 'TV Écran Plat', 'Coffre-fort'],
  },
  {
    id: 'superieure',
    name: 'Chambre Supérieure',
    description: 'Spacieuse et lumineuse, avec lit king size, coin salon et vue sur la piscine.',
    basePrice: 65000,
    capacityAdults: 2,
    capacityChildren: 1,
    sizeSqm: 35,
    kind: 'room',
    amenities: ['Wi-Fi', 'Climatisation', 'Mini-bar', 'Vue Piscine'],
  },
  {
    id: 'suite-junior',
    name: 'Suite Junior',
    description: 'Suite élégante avec salon séparé, balcon privé et accès offert au Spa.',
    basePrice: 90000,
    capacityAdults: 2,
    capacityChildren: 2,
    sizeSqm: 50,
    kind: 'room',
    amenities: ['Wi-Fi', 'Salon séparé', 'Baignoire', 'Balcon privé', 'Accès Spa'],
  },
  {
    id: 'suite-signature',
    name: 'Suite Signature Babydja',
    description:
      'Notre plus belle suite. Vue panoramique, service de majordome, jacuzzi sur la terrasse et prestations très haut de gamme.',
    basePrice: 150000,
    capacityAdults: 2,
    capacityChildren: 2,
    sizeSqm: 80,
    kind: 'pool',
    amenities: ['Jacuzzi privé', 'Service en chambre 24/7', 'Vue panoramique', 'Transfert aéroport inclus'],
  },
];

const vehicles = [
  {
    id: 'suv-peugeot-3008',
    brand: 'Peugeot',
    model: '3008 SUV',
    description:
      'SUV spacieux, parfait pour la ville et les longs trajets. Confort optimal et sécurité maximale.',
    category: 'SUV',
    pricePerDay: 45000,
    transmission: 'Automatique',
  },
  {
    id: 'berline-toyota-corolla',
    brand: 'Toyota',
    model: 'Corolla Berline',
    description: 'Une berline élégante et économique, idéale pour vos déplacements quotidiens ou professionnels.',
    category: 'Berline',
    pricePerDay: 35000,
    transmission: 'Automatique',
  },
  {
    id: 'citadine-renault-clio',
    brand: 'Renault',
    model: 'Clio',
    description: 'Petite citadine maniable, très pratique pour se faufiler en centre-ville et facile à garer.',
    category: 'Citadine',
    pricePerDay: 25000,
    transmission: 'Manuelle',
  },
  {
    id: '4x4-toyota-prado',
    brand: 'Toyota',
    model: 'Land Cruiser Prado',
    description: 'Un 4x4 robuste et luxueux, conçu pour vous offrir un confort absolu sur tout type de route.',
    category: '4x4',
    pricePerDay: 80000,
    transmission: 'Automatique',
  },
];

async function main() {
  const hotel = await prisma.tenant.upsert({
    where: { id: HOTEL_TENANT_ID },
    update: {},
    create: {
      id: HOTEL_TENANT_ID,
      name: "L'Hôtel Babydja",
      type: TenantType.HOTEL,
      description:
        "Un havre de paix au cœur d'Abidjan. L'Hôtel Babydja vous offre une expérience unique alliant confort moderne et charme authentique.",
      address: 'Riviera 3, Cocody, Abidjan',
      city: 'Abidjan',
    },
  });

  for (const room of rooms) {
    const data = { ...room, maxGuests: room.capacityAdults + room.capacityChildren, tenantId: hotel.id };
    await prisma.room.upsert({
      where: { id: room.id },
      update: data,
      create: data,
    });
  }

  const carAgency = await prisma.tenant.upsert({
    where: { id: CAR_TENANT_ID },
    update: {},
    create: {
      id: CAR_TENANT_ID,
      name: 'Babydja Auto',
      type: TenantType.CAR_RENTAL,
      description: 'Louez les meilleurs véhicules pour vos déplacements en ville ou vos voyages à travers le pays.',
      address: 'Boulevard VGE, Marcory, Abidjan',
      city: 'Abidjan',
    },
  });

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: { ...vehicle, seats: 5, tenantId: carAgency.id },
      create: { ...vehicle, seats: 5, tenantId: carAgency.id },
    });
  }

  console.log(`Seed OK : ${rooms.length} chambres (${hotel.name}), ${vehicles.length} véhicules (${carAgency.name})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
