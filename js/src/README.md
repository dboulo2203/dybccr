--------------------------------------------------
# Fonctionnalités DYB
L'objectif de DYB est de fournir aux utilisateurs du cercle celtique de Rennes des outils de suivi des adhésions et inscriptions.

## Recherche
- V1 : recherche de personnes par le nom, prénom, email
- V1 : Recherche des personnes inscriptes à une activité
- Vx : Filtre par année

## Listes de personnes
- V1 : Fonction de sélection de personnes, ajout de personnes à la liste, suppression de personnes de la liste
- V1 : Export de la liste des personnes (nom, prénom, email, téléphone)
- Vx : Créer une liste Brevo, avec ajout ou remplacement des emails

## Mise à jour des personnes, inscriptions, adhésions, règlements
- Vx : mise à jour des données des personnes
- Vx : Mise à jour des inscriptions, adhésions, règlements 
## Création personne :
- Vx : création/modification d'une personne existante
- Vx : création/modification d'une inscription/adhésion existante,

## Tableaux de bord 
- V1 : tableau de récapitulatif des montants et nb pour l'année en cours,
- V1 : tableau de visualisation de la dernière intégration

## Intégration du fichier YB
- V1 : intégration de l'année 2024-2025,
- Vx : intégration de l'historique.

## Intégration HelloAsso
- Vx : importer les inscriptions à des événements (autre que des adhésions)

## Historique 

## Sécurisation des accès
- V1 : Utilisation des mécanismes d'authentification Apache en V1

----------------------------------------------------------------------------------------
# Installation
- Copier le répertoire source dans le répertoire cible
- Configurer le fichier config.php avec les données de la base de données opérationnelle
- Copier les fichier htaccess et htpasswwd de manière à activer la sécurisation par mot de passe
---------------------------------------------------------------------------------------
# Remarque : 
- Le numéro de version est situé en bas, dans le menu canvas.
---------------------------------------------------------------------------------------
# Release notes : 
## Version 1.1 : 
- NEW : réécriture en JS de la fonction person : visualisation d'une personne
- New : réécriture en JS de  la fonction search : recherche de personnes

---------------------------------------------------------------------------------------
# Todo
- Search : ajouter CRLF


    