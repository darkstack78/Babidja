// Données factices reprises des maquettes Babydja.
import type { Room, Vehicle } from '@/types/catalog';

export const user = {
  name: 'Amadou Touré',
  email: 'a.toure@email.com',
  phone: '+225 •••• 12 34',
  address: 'Riviera 3, Cocody, Abidjan, Côte d’Ivoire',
  balance: 250000,
}

export const hotelConfig = {
  name: "L'Hôtel Babydja",
  address: "Riviera 3, Cocody, Abidjan, Côte d'Ivoire",
  phone: "+225 01 02 03 04",
  email: "contact@hotel-babydja.ci",
  description: "Un havre de paix au cœur d'Abidjan. L'Hôtel Babydja vous offre une expérience unique alliant confort moderne et charme authentique.",
  amenities: ["Wi-Fi gratuit", "Piscine extérieure", "Restaurant gastronomique", "Spa & Bien-être", "Parking sécurisé"]
}

export const rooms: Room[] = [
  {
    id: 'standard',
    name: 'Chambre Standard',
    description: 'Chambre confortable avec lit queen size, climatisation, wifi et bureau. Idéale pour les séjours d’affaires courts.',
    price: 45000,
    capacityAdults: 2,
    capacityChildren: 1,
    size: 25,
    kind: 'room',
    amenities: ['Wi-Fi', 'Climatisation', 'TV Écran Plat', 'Coffre-fort'],
  },
  {
    id: 'superieure',
    name: 'Chambre Supérieure',
    description: 'Spacieuse et lumineuse, avec lit king size, coin salon et vue sur la piscine.',
    price: 65000,
    capacityAdults: 2,
    capacityChildren: 1,
    size: 35,
    kind: 'room',
    amenities: ['Wi-Fi', 'Climatisation', 'Mini-bar', 'Vue Piscine'],
  },
  {
    id: 'suite-junior',
    name: 'Suite Junior',
    description: 'Suite élégante avec salon séparé, balcon privé et accès offert au Spa.',
    price: 90000,
    capacityAdults: 2,
    capacityChildren: 2,
    size: 50,
    kind: 'room',
    amenities: ['Wi-Fi', 'Salon séparé', 'Baignoire', 'Balcon privé', 'Accès Spa'],
  },
  {
    id: 'suite-signature',
    name: 'Suite Signature Babydja',
    description: 'Notre plus belle suite. Vue panoramique, service de majordome, jacuzzi sur la terrasse et prestations très haut de gamme.',
    price: 150000,
    capacityAdults: 2,
    capacityChildren: 2,
    size: 80,
    kind: 'pool',
    amenities: ['Jacuzzi privé', 'Service en chambre 24/7', 'Vue panoramique', 'Transfert aéroport inclus'],
  },
]

export const cars: Vehicle[] = [
  {
    id: 'suv-peugeot-3008',
    name: 'Peugeot 3008 SUV',
    description: 'SUV spacieux, parfait pour la ville et les longs trajets. Confort optimal et sécurité maximale.',
    price: 45000,
    transmission: 'Automatique',
    kind: 'car',
  },
  {
    id: 'berline-toyota-corolla',
    name: 'Toyota Corolla Berline',
    description: 'Une berline élégante et économique, idéale pour vos déplacements quotidiens ou professionnels.',
    price: 35000,
    transmission: 'Automatique',
    kind: 'car',
  },
  {
    id: 'citadine-renault-clio',
    name: 'Renault Clio',
    description: 'Petite citadine maniable, très pratique pour se faufiler en centre-ville et facile à garer.',
    price: 25000,
    transmission: 'Manuelle',
    kind: 'car',
  },
  {
    id: '4x4-toyota-prado',
    name: 'Toyota Land Cruiser Prado',
    description: 'Un 4x4 robuste et luxueux, conçu pour vous offrir un confort absolu sur tout type de route.',
    price: 80000,
    transmission: 'Automatique',
    kind: 'car',
  },
]

export const booking = {
  hotel: "L'Hôtel Babydja",
  roomName: 'Suite Junior',
  city: 'Abidjan',
  dates: '12–15 Oct 2026',
  details: '3 nuits, 1 chambre, 2 adultes',
  subtotal: 270000,
  fees: 5000,
  total: 275000,
  deposit: 82500,
  confirmation: 'BJ2026-X1Y2Z3',
}

export const paymentChoices = [
  { id: 'mtn', label: 'Mobile Money', sub: 'MTN', logo: 'mtn' },
  { id: 'orange', label: 'Orange', sub: 'Orange Money', logo: 'orange' },
  { id: 'moov', label: 'Moov', sub: 'Moov Money', logo: 'moov' },
  { id: 'wave', label: 'Wave', sub: 'Wave', logo: 'wave' },
  { id: 'mastercard', label: 'Carte bancaire', sub: 'Mastercard', logo: 'mastercard' },
  { id: 'visa', label: 'Carte bancaire', sub: 'Visa', logo: 'visa' },
]

export const savedPaymentMethods = [
  { id: 1, type: 'Mobile Money', name: 'Orange Money', number: '+225 •••• 12 34', logo: 'orange', favorite: true },
  { id: 2, type: 'Mobile Money', name: 'MTN Mobile Money', number: '+225 •••• 5678', logo: 'mtn', favorite: false },
]

export const myReservations = [
  { id: 1, type: 'hotel', name: 'Suite Junior', dates: '15–22 Déc 2026', status: 'À venir', price: 630000 },
  { id: 4, type: 'hotel', name: 'Chambre Standard', dates: '03–06 Août 2026', status: 'Annulée', price: 135000 },
]

// --- Données spécifiques à l'Hôtel ---

export const hotelKpis = [
  { id: 'day', label: 'Arrivées du jour', value: '12', color: 'primary', icon: 'bed' },
  { id: 'occupancy', label: 'Taux d’occupation', value: '85%', color: 'secondary', icon: 'percent' },
  { id: 'revenue', label: 'Revenu du mois', value: '12 450 000 FCFA', color: 'primary', icon: 'coins' },
  { id: 'pending', label: 'Réservations en attente', value: '5', color: 'danger', icon: 'help' },
]

export const hotelChart = Array.from({ length: 11 }, (_, i) => {
  const day = i * 3
  const reservations = [10, 28, 55, 90, 70, 60, 95, 80, 110, 100, 130][i]
  const revenus = [5, 20, 35, 50, 60, 55, 70, 85, 80, 105, 138][i]
  return { day, reservations, revenus }
})

export const hotelReservations = [
  { id: 1, client: 'Namo Kouassi', email: 'n.kouassi@email.com', date: '18/11/2026', service: 'Chambre Standard', amount: 45000, status: 'En attente' },
  { id: 2, client: 'Mamo Bamba', email: 'm.bamba@email.com', date: '12/11/2026', service: 'Chambre Supérieure', amount: 65000, status: 'Confirmée' },
  { id: 5, client: 'Awa Traoré', email: 'a.traore@email.com', date: '21/11/2026', service: 'Suite Junior', amount: 180000, status: 'En attente' },
]

export const hotelEmployees = [
  { id: 1, name: 'Namo Kouassi', handle: '@namo.k', role: 'Permissions complètes', status: 'Actif', added: '05/02/2026' },
  { id: 2, name: 'Mario Coron', handle: '@mario.c', role: 'Réceptionniste', status: 'Actif', added: '25/02/2026' },
]

// --- Données spécifiques à la Location de Voiture ---

export const carConfig = {
  name: "Babydja Auto",
  address: "Boulevard VGE, Marcory, Abidjan, Côte d'Ivoire",
  phone: "+225 05 06 07 08",
  email: "contact@auto-babydja.ci",
  description: "Louez les meilleurs véhicules pour vos déplacements en ville ou vos voyages à travers le pays.",
  amenities: ["Climatisation", "Kilométrage illimité", "Assurance tous risques", "Chauffeur en option"]
}

export const carKpis = [
  { id: 'day', label: 'Départs du jour', value: '8', color: 'primary', icon: 'car' },
  { id: 'occupancy', label: 'Véhicules loués', value: '65%', color: 'secondary', icon: 'percent' },
  { id: 'revenue', label: 'Revenu du mois', value: '4 850 000 FCFA', color: 'primary', icon: 'coins' },
  { id: 'pending', label: 'Réservations en attente', value: '3', color: 'danger', icon: 'help' },
]

export const carChart = Array.from({ length: 11 }, (_, i) => {
  const day = i * 3
  const reservations = [5, 12, 20, 35, 30, 25, 45, 40, 55, 50, 60][i]
  const revenus = [2, 8, 12, 18, 15, 12, 22, 20, 28, 25, 30][i]
  return { day, reservations, revenus }
})

export const carReservations = [
  { id: 101, client: 'Koffi Jean', email: 'k.jean@email.com', date: '19/11/2026', service: 'Peugeot 3008 SUV', amount: 45000, status: 'En attente' },
  { id: 102, client: 'Sylvie N\'Guessan', email: 's.nguessan@email.com', date: '14/11/2026', service: 'Toyota Corolla Berline', amount: 105000, status: 'Confirmée' },
]

export const carEmployees = [
  { id: 3, name: 'Ali Diarra', handle: '@ali.d', role: 'Gérant de parc', status: 'Actif', added: '10/01/2026' },
  { id: 4, name: 'Fatou Sylla', handle: '@fatou.s', role: 'Agent d\'accueil', status: 'Actif', added: '15/03/2026' },
]

// --- Données spécifiques Super Admin ---

export const adminKpis = [
  { id: 'etablissements', label: 'Établissements actifs', value: '142', color: 'primary', icon: 'network' },
  { id: 'commission', label: 'Commissions mensuelles', value: '8 500 000 FCFA', color: 'secondary', icon: 'coins' },
  { id: 'users', label: 'Nouveaux utilisateurs', value: '+1 250', color: 'primary', icon: 'users' },
  { id: 'litiges', label: 'Litiges en cours', value: '14', color: 'danger', icon: 'help' },
]

export const adminTransactions = [
  { id: 201, client: 'Hôtel Babydja', email: 'contact@hotel-babydja.ci', date: '25/11/2026', service: 'Commission mensuelle', amount: 250000, status: 'Confirmée' },
  { id: 202, client: 'Babydja Auto', email: 'contact@auto-babydja.ci', date: '26/11/2026', service: 'Frais d\'inscription', amount: 50000, status: 'Confirmée' },
  { id: 203, client: 'Résidence Palmeraie', email: 'info@palmeraie.ci', date: '27/11/2026', service: 'Commission mensuelle', amount: 120000, status: 'En attente' },
]

export const employeePermissions = [
  { id: 'view', label: 'Voir réservations', default: true },
  { id: 'rates', label: 'Modifier tarifs', default: true },
  { id: 'validate', label: 'Valider réservations', default: true },
  { id: 'catalog', label: 'Gérer chambres/véhicules', default: false },
]

