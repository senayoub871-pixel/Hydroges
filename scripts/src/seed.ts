import { pbkdf2Sync, randomBytes } from "crypto";
import { db } from "@workspace/db";
import { usersTable, documentsTable } from "@workspace/db/schema";

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 32, "sha256").toString("hex");
}

async function seed() {
  console.log("Seeding database...");

  await db.delete(documentsTable);
  await db.delete(usersTable);

  const DEFAULT_PASSWORD = "Admin123!";

  const usersToInsert = [
    { name: "Ahmed Benali", email: "ahmed.benali@hydroges.dz", department: "Direction Générale", avatarInitials: "AB", loginId: "ahmed.benali", role: "Directeur Général" },
    { name: "Fatima Zohra", email: "fatima.zohra@hydroges.dz", department: "Ressources Humaines", avatarInitials: "FZ", loginId: "fatima.zohra", role: "Chef Bureau RH" },
    { name: "Karim Mansouri", email: "karim.mansouri@hydroges.dz", department: "Finance & Comptabilité", avatarInitials: "KM", loginId: "karim.mansouri", role: "Chef Service Finance" },
    { name: "Sara Hadj", email: "sara.hadj@hydroges.dz", department: "Informatique", avatarInitials: "SH", loginId: "sara.hadj", role: "Chef Bureau Informatique" },
    { name: "Hassan Boudiaf", email: "hassan.boudiaf@hydroges.dz", department: "Operations", avatarInitials: "HB", loginId: "hassan.boudiaf", role: "Chef Service Operations" },
    { name: "Nadia Belkaid", email: "nadia.belkaid@hydroges.dz", department: "Hydraulique", avatarInitials: "NB", loginId: "nadia.belkaid", role: "Directrice de l'Hydraulique" },
    { name: "Omar Kheloufi", email: "omar.kheloufi@hydroges.dz", department: "Travaux", avatarInitials: "OK", loginId: "omar.kheloufi", role: "Ingénieur Subdivisionnaire" },
    { name: "Leila Bouhali", email: "leila.bouhali@hydroges.dz", department: "Juridique", avatarInitials: "LB", loginId: "leila.bouhali", role: "Chef Service Juridique" },
  ];

  const insertValues = usersToInsert.map(u => {
    const salt = generateSalt();
    const hash = hashPassword(DEFAULT_PASSWORD, salt);
    return {
      ...u,
      companyNumber: "0125.6910.0681",
      passwordHash: hash,
      passwordSalt: salt,
    };
  });

  const [ahmed, fatima, karim, sara, hassan] = await db
    .insert(usersTable)
    .values(insertValues)
    .returning();

  await db.insert(documentsTable).values([
    {
      title: "Rapport Mensuel - Mars 2026",
      content: `RAPPORT MENSUEL\nMars 2026\n\nCe rapport présente un résumé complet des activités du mois de mars 2026.\n\n1. RÉSUMÉ EXÉCUTIF\nLes performances globales de l'entreprise ont été satisfaisantes pour ce mois. Nous avons atteint nos objectifs principaux et identifié plusieurs opportunités d'amélioration.\n\n2. INDICATEURS CLÉS\n- Chiffre d'affaires: 15,2 M DZD\n- Projets complétés: 8\n- Projets en cours: 12\n- Nouveaux clients: 3\n\n3. PROBLÈMES RENCONTRÉS\nQuelques retards ont été observés dans le département des opérations. Des mesures correctives ont été mises en place.\n\n4. PERSPECTIVES\nLe mois d'avril s'annonce prometteur avec plusieurs contrats en cours de finalisation.\n\nCordialement,\nAhmed Benali\nDirecteur Général`,
      status: "sent",
      senderId: ahmed.id,
      senderName: ahmed.name,
      recipientId: fatima.id,
      recipientName: fatima.name,
      recipientEmail: fatima.email,
      fileType: "PDF",
      fileSize: "245 KB",
      category: "Rapport",
    },
    {
      title: "Contrat de Maintenance - Équipements",
      content: `CONTRAT DE MAINTENANCE\n\nEntre les soussignés:\n\nHYDROGES S.P.A.\nSiège social: Alger, Algérie\nReprésentée par: Ahmed Benali\n\nEt:\n\nTechno Services SARL\nReprésentée par: Directeur Commercial\n\nOBJET DU CONTRAT:\nLe présent contrat a pour objet la maintenance préventive et corrective des équipements industriels de HYDROGES.\n\nDURÉE:\n12 mois à compter du 1er Avril 2026\n\nPRIX:\n500,000 DZD HT par an\n\nCONDITIONS:\n- Intervention sous 24h en cas de panne critique\n- Maintenance préventive mensuelle\n- Rapport d'intervention détaillé\n\nSigné à Alger, le 22 Mars 2026`,
      status: "sent",
      senderId: karim.id,
      senderName: karim.name,
      recipientId: ahmed.id,
      recipientName: ahmed.name,
      recipientEmail: ahmed.email,
      fileType: "DOCX",
      fileSize: "180 KB",
      category: "Contrat",
    },
    {
      title: "Note de Service - Politique de Congés 2026",
      content: `NOTE DE SERVICE\n\nDe: Direction des Ressources Humaines\nÀ: Tout le Personnel\nDate: 22 Mars 2026\nObjet: Politique de Congés 2026\n\nChers Collègues,\n\nNous vous informons des nouvelles dispositions concernant les congés annuels pour l'exercice 2026.\n\n1. DROITS AUX CONGÉS\nChaque employé dispose de 30 jours de congé annuel payé.\n\n2. PROCÉDURE DE DEMANDE\n- Les demandes doivent être soumises au minimum 15 jours avant la date souhaitée\n- Toutes les demandes doivent être validées par le responsable direct\n- Les demandes se font via le système informatique\n\nCordialement,\nFatima Zohra\nDirectrice des Ressources Humaines`,
      status: "scheduled",
      senderId: fatima.id,
      senderName: fatima.name,
      recipientId: hassan.id,
      recipientName: hassan.name,
      recipientEmail: hassan.email,
      scheduledAt: new Date("2026-04-01T09:00:00"),
      fileType: "PDF",
      fileSize: "120 KB",
      category: "Note de Service",
    },
    {
      title: "Analyse Budgétaire Q1 2026",
      content: `ANALYSE BUDGÉTAIRE\nPremier Trimestre 2026\n\nPRÉPARÉ PAR: Département Finance & Comptabilité\nDATE: Mars 2026\n\nRÉSUMÉ\nCe document présente l'analyse détaillée du budget du premier trimestre 2026.\n\nREVENUS\n- Janvier 2026: 4,8 M DZD\n- Février 2026: 5,1 M DZD\n- Mars 2026: 5,3 M DZD\n- TOTAL Q1: 15,2 M DZD\n\nDÉPENSES\n- Total: 12,0 M DZD\n\nRÉSULTAT BRUT: 3,2 M DZD`,
      status: "draft",
      senderId: karim.id,
      senderName: karim.name,
      recipientId: ahmed.id,
      recipientName: ahmed.name,
      recipientEmail: ahmed.email,
      fileType: "XLSX",
      fileSize: "320 KB",
      category: "Finance",
    },
    {
      title: "Invitation - Réunion Stratégique Q2",
      content: `INVITATION À LA RÉUNION\n\nObjet: Réunion Stratégique Q2 2026\nDate: Lundi 30 Mars 2026\nHeure: 10h00 - 12h00\nLieu: Salle de Conférence A, 3ème étage\n\nChers Collègues,\n\nJe vous invite à participer à notre réunion stratégique pour le deuxième trimestre 2026.\n\nCordialement,\nAhmed Benali\nDirecteur Général`,
      status: "sent",
      senderId: ahmed.id,
      senderName: ahmed.name,
      recipientId: hassan.id,
      recipientName: hassan.name,
      recipientEmail: hassan.email,
      fileType: "PDF",
      fileSize: "95 KB",
      category: "Communication",
    },
    {
      title: "Procédure de Sécurité Informatique",
      content: `PROCÉDURE DE SÉCURITÉ INFORMATIQUE\n\nDépartement: Informatique\nVersion: 2.1\nDate: Mars 2026\n\nOBJECTIF\nCe document définit les règles et procédures de sécurité informatique.\n\n1. POLITIQUE DES MOTS DE PASSE\n- Longueur minimale: 12 caractères\n- Renouvellement tous les 90 jours\n\n2. ACCÈS AUX SYSTÈMES\n- Chaque employé dispose d'un compte unique\n- Partage de compte formellement interdit\n\nApprouvé par: Direction Générale`,
      status: "sent",
      senderId: sara.id,
      senderName: sara.name,
      recipientId: fatima.id,
      recipientName: fatima.name,
      recipientEmail: fatima.email,
      fileType: "PDF",
      fileSize: "210 KB",
      category: "Procédure",
    },
  ]);

  console.log("Database seeded successfully!");
  console.log("Default password for all seeded accounts: Admin123!");
}

seed().catch(console.error).finally(() => process.exit(0));
