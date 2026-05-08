/**
 * Writes scripts/locale-patches/legal/fr.json (PrivacyPage, TermsPage, AboutAchievements).
 * Run: node scripts/gen-legal-fr.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PrivacyPage = {
  topCards: [
    {
      title: "Sécurité",
      desc: "Transactions chiffrées et prestataires de confiance.",
    },
    {
      title: "Transparence",
      desc: "Explication claire de la collecte et de l’usage des données.",
    },
    {
      title: "Contrôle",
      desc: "Accès, mise à jour et demande de suppression de vos données.",
    },
  ],
  sections: [
    {
      title: "1. Introduction",
      content:
        "Bienvenue sur TravelTourUp. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles lorsque vous utilisez nos services de voyage et de réservation.",
    },
    {
      title: "2. Informations collectées",
      points: [
        "Informations personnelles telles que nom, e-mail et téléphone",
        "Données de réservation : destination, dates et informations voyageurs",
        "Informations de paiement traitées en toute sécurité via nos prestataires",
        "Données d’appareil et d’usage pour améliorer performances et fiabilité",
        "Données de localisation pour des suggestions de voyage personnalisées",
        "Historique des échanges pour améliorer le service client",
      ],
    },
    {
      title: "3. Utilisation de vos informations",
      content:
        "Nous utilisons vos données pour traiter les réservations, améliorer nos produits, personnaliser votre expérience, envoyer les notifications essentielles au voyage et fournir une assistance lorsque nécessaire.",
    },
    {
      title: "4. Base juridique du traitement",
      points: [
        "Pour remplir les obligations contractuelles (réservations et services)",
        "Pour respecter les obligations légales et réglementaires",
        "Sur la base de votre consentement pour le marketing et services facultatifs",
        "Pour des intérêts légitimes tels que l’amélioration du service",
      ],
    },
    {
      title: "5. Partage de vos données",
      content:
        "Nous ne partageons des informations avec nos partenaires (compagnies aériennes, hôtels, processeurs de paiement) que lorsque c’est nécessaire pour honorer votre réservation.",
    },
    {
      title: "6. Prestataires tiers",
      points: [
        "Compagnies aériennes et transporteurs",
        "Partenaires hôteliers et hébergement",
        "Passerelles de paiement et institutions financières",
        "Outils d’analyse et de surveillance des performances",
      ],
    },
    {
      title: "7. Transferts internationaux",
      content:
        "Vos données peuvent être transférées et traitées hors de votre pays de résidence pour finaliser les réservations et fournir les services dans le monde entier.",
    },
    {
      title: "8. Sécurité des données",
      points: [
        "Chiffrement SSL pour toutes les transactions",
        "Passerelles de paiement sécurisées",
        "Surveillance régulière des systèmes",
        "Accès interne aux données limité",
        "Protection contre l’accès non autorisé et les violations",
      ],
    },
    {
      title: "9. Cookies et technologies similaires",
      content:
        "Les cookies nous aident à sécuriser la plateforme, mémoriser vos préférences et comprendre le trafic afin d’améliorer votre expérience.",
    },
    {
      title: "10. Types de cookies",
      points: [
        "Cookies essentiels au fonctionnement du site",
        "Cookies de performance pour les analyses",
        "Cookies fonctionnels pour mémoriser les préférences",
        "Cookies marketing pour offres personnalisées",
      ],
    },
    {
      title: "11. Conservation des données",
      content:
        "Nous conservons vos données personnelles uniquement aussi longtemps que nécessaire pour des raisons légales, opérationnelles et commerciales.",
    },
    {
      title: "12. Comptes utilisateurs",
      points: [
        "Vous êtes responsable de la confidentialité de votre compte",
        "Maintenez vos identifiants en sécurité",
        "Prévenez-nous immédiatement en cas d’accès non autorisé",
      ],
    },
    {
      title: "13. Vos droits",
      points: [
        "Accéder à vos données personnelles",
        "Demander des corrections",
        "Demander la suppression",
        "Retirer votre consentement à tout moment",
        "Vous opposer à certains traitements",
      ],
    },
    {
      title: "14. Communications marketing",
      content:
        "Nous pouvons envoyer des e-mails promotionnels. Vous pouvez vous désinscrire à tout moment via les liens ou les paramètres du compte.",
    },
    {
      title: "15. Vie privée des enfants",
      content:
        "Nos services ne s’adressent pas aux moins de 18 ans. Nous ne collectons pas sciemment de données d’enfants.",
    },
    {
      title: "16. Liens tiers",
      content:
        "Notre plateforme peut contenir des liens vers des services tiers dont nous ne contrôlons pas les pratiques de confidentialité.",
    },
    {
      title: "17. Informations de paiement",
      points: [
        "Les paiements passent par des passerelles tierces sécurisées",
        "Nous ne stockons pas l’intégralité des données carte",
        "Les transactions sont chiffrées et surveillées",
      ],
    },
    {
      title: "18. Données spécifiques au voyage",
      points: [
        "Passeport et pièces d’identité pour réservations",
        "Préférences et historique de voyage",
        "Contacts d’urgence pour les séjours",
        "Demandes spéciales (repas, accessibilité, etc.)",
      ],
    },
    {
      title: "19. Mises à jour de la politique",
      content:
        "Nous pouvons modifier cette Politique de confidentialité. Les changements seront publiés sur cette page avec une date de révision mise à jour.",
    },
    {
      title: "20. Nous contacter",
      content:
        "Pour toute question concernant cette politique : support@traveltourup.com.",
    },
  ],
};

const TermsPage = {
  topCards: [
    {
      title: "Usage équitable",
      desc: "Informations sincères et utilisation conforme à la loi.",
    },
    {
      title: "Règles des prestataires",
      desc: "Les réservations suivent les conditions des compagnies et hôtels.",
    },
    {
      title: "Paiements sécurisés",
      desc: "Transactions traitées via des partenaires sécurisés.",
    },
  ],
  sections: [
    {
      title: "1. Acceptation des conditions",
      content:
        "En utilisant TravelTourUp, vous acceptez les présentes Conditions d’utilisation et les politiques applicables sur la plateforme.",
    },
    {
      title: "2. Éligibilité",
      content:
        "Vous devez avoir au moins 18 ans et être juridiquement capable de contracter pour utiliser nos services.",
    },
    {
      title: "3. Services de réservation",
      content:
        "TravelTourUp agit en tant qu’intermédiaire entre voyageurs et prestataires tiers (compagnies, hôtels, transport).",
    },
    {
      title: "4. Création de compte",
      points: [
        "Fournir des informations exactes et complètes",
        "Préserver la confidentialité de vos identifiants",
        "Vous êtes responsable de l’activité sur votre compte",
      ],
    },
    {
      title: "5. Paiements et tarifs",
      points: [
        "Paiements via des passerelles sécurisées",
        "Les prix affichés peuvent varier selon disponibilité et demande",
        "Taxes, frais de service et frais prestataires peuvent s’appliquer",
        "Les conversions de devise peuvent varier selon les taux des prestataires",
      ],
    },
    {
      title: "6. Confirmation de réservation",
      content:
        "Une réservation n’est confirmée qu’après paiement intégral et confirmation du prestataire.",
    },
    {
      title: "7. Annulations et remboursements",
      content:
        "Les conditions dépendent de chaque prestataire. Vérifiez les conditions tarifaires avant confirmation.",
    },
    {
      title: "8. Modifications",
      content:
        "Les changements (dates, voyageurs, etc.) sont soumis aux politiques du prestataire et peuvent entraîner des frais.",
    },
    {
      title: "9. Responsabilités de l’utilisateur",
      points: [
        "Fournir des informations voyageurs et de paiement exactes",
        "Respecter visas, immigration et lois locales",
        "Disposer de documents de voyage valides",
        "Ne pas utiliser la plateforme de manière abusive ou frauduleuse",
      ],
    },
    {
      title: "10. Documents de voyage",
      content:
        "Vous êtes responsable des passeports, visas et autorisations nécessaires avant votre départ.",
    },
    {
      title: "11. Risques liés au voyage",
      content:
        "Le voyage comporte des risques inhérents. TravelTourUp n’est pas responsable des retards, annulations ou perturbations dues à des facteurs externes.",
    },
    {
      title: "12. Prestataires tiers",
      content:
        "Les services sont fournis par des tiers indépendants. Nous ne sommes pas responsables de leurs erreurs ou de la qualité du service.",
    },
    {
      title: "13. Limitation de responsabilité",
      content:
        "TravelTourUp n’est pas responsable des perturbations causées par des tiers (retards, surbooking, annulations, force majeure).",
    },
    {
      title: "14. Force majeure",
      content:
        "Nous ne sommes pas responsables des impossibilités d’exécution dues à des événements hors de notre contrôle (catastrophes, pandémies, décisions publiques).",
    },
    {
      title: "15. Activités interdites",
      points: [
        "Réservations ou transactions frauduleuses",
        "Atteinte aux systèmes ou piratage",
        "Violation des lois applicables",
        "Usurpation d’identité",
      ],
    },
    {
      title: "16. Propriété intellectuelle",
      content:
        "Contenus et marques TravelTourUp sont protégés ; usage non autorisé interdit.",
    },
    {
      title: "17. Résiliation",
      content:
        "Nous pouvons suspendre ou fermer les comptes violant ces conditions sans préavis.",
    },
    {
      title: "18. Politique de confidentialité",
      content:
        "Votre utilisation est également régie par notre Politique de confidentialité.",
    },
    {
      title: "19. Modifications des conditions",
      content:
        "Nous pouvons modifier ces conditions à tout moment. L’usage continu vaut acceptation.",
    },
    {
      title: "20. Contact",
      content:
        "Questions sur ces conditions : support@traveltourup.com.",
    },
  ],
};

const AboutAchievements = {
  title: "Votre destination vous attend",
  subtitle:
    "Nous avons aidé des milliers de voyageurs à explorer le monde. Notre engagement pour la qualité fait grandir notre réussite.",
  statCustomers: "12870+",
  statCustomersLabel: "Clients heureux",
  statSatisfied: "100%",
  statSatisfiedLabel: "Satisfaction client",
  connectText: "Contactez-nous pour en savoir plus.",
  contactButton: "Nous contacter",
};

const out = { PrivacyPage, TermsPage, AboutAchievements };
const dir = dirname(fileURLToPath(import.meta.url));
const dest = join(dir, "locale-patches/legal/fr.json");
writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", dest);
