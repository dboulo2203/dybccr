# Documentation utilisateur DYBCCR (dybuser)

DYBCCR a été créé afin de simplifier la gestion des inscriptions du CCR.

## En tant que dybuser, je veux rechercher un adhérent.

- Je peux chercher par nom, adresse, email, facture.
- Dans Dolibarr, module DYBccr ->recherche adhérent
- Choisir le type de recherche, saisir une partie de la chaine à chercher
- Pour la recherche par facture, saisir l'id de la facture.
- DybCCR affiche la liste des adhérents correspondant au critère
- Un clic sur le nom permet d'accéder la page de l'adhérent

## En tant que dybuser, je veux créer un nouvel adhérent

- Il peut être sage de ccommencer par rechercher les nom, prénom de l'adhérent
- Dans Dolibarr, module DYBccr ->Nouvel adhérent,
- saisir les champs, cliquer sauver
- Règles
  - Le programme vérifie que l'email n'est pas déjà utilisé dans la base de données
  - Le nom et le prénom ne peuvent comporter des espaces, remplacez par des -

## En tant que dybuser, je veux voir le suivi des inscriptions

- Dans Dolibarr, module DYBccr ->suivi inscriptions,
- Choisir le filtre,
  - Année : c'est la saison culturelle configurée dans la facture
  - Statut de la facture : voir explication sur les statuts de facture
  - Activité : Ce sont les services insérés dans les lignes de la facture
- Dans la liste de résultats :
  - Il est possible de cliquer sur les noms des colonnes pour trier la liste
  - Cliquer sur le nom de l'adhérent ouvre la la page de l'adhérent.

## Remarques sur le statut des factures.

> - Les factures brouillon sont les factures en cours de modification
> - Les factures validées sont eles factures en attente de paiement
> - Les factures payées sont les factures ayant un paiement valide. C'est le statut d'une inscription finalisée.
> - Les factures annulées sont en annulées suite à une modification. La raison est que les factures ne peuvent pas être supprimées. Le seul moyen de noter qu'une facture ne doit pas être conservée et comptée est de l'annuler.

> - les factures payées par HelloAsso sont en statut payé
> - Les factures Dybweb avec chix du moode de paiement chèque ouu autre sont en statut Brouillon.

## En tant que dybuser, je veux clôturer la caisse

- Dans Dolibarr, module DYBccr -> clôture de caisse,.
- Saisir la période d'analyse souhaitée
- Filtrer éventuellement par utilisateur (Utilisateur ayant cloturé la facture : ayant enregistré le paiement),- Pour la recherche par facture, saisir l'id de la facture.
- Note :
  - La clôture de caisse intègre toutes les factures dont le paiement a été enregistré dans la période d'analyse.
- Procédure standard de clôture de caisse :
  1. afficher la clôture de caisse
  2. Vérifier que les 2 montants totaux sont égaux,
  3. Valider que les montants des modes de correspondent aux chèques, espèces etc qu'il ont en caisse,
  4. Corriger éventuellement les écarts.
  5. imprimer le document de clôture de caisse et le joindre aux chèques, espèces, CB reçus.
  6. transmettre le tout à la comptabilité (YB, si j'ai bien compris).

## en tant que dybuser, je souhaite voir le reporting inscription,.

- Dans Dolibarr, module DYBccr -> Reporting inscription.
- L'écran présente, en nb et en montant, les totaux des inscriptions sur les 3 dernières années.
  - par activité : En nombre et montant
  - par type d'activité, en nombre
  - par type de domaine, en nombre et montant
  - par ttype de paiement, en nombre et montant

## en tant que dybuser, je souhaite clôturer une facture à 0€

- Dans Dolibarr, facture paiement,
- ouvrir la facture, cliquer sur 'classer payée'.

# Documentation utilisateur DYBWeb

- A l'ouverture de la page
  - Le message configuré est affiché sous le titre
  - La liste des adhésions et des activités est la liste des services dans Dolibar ayant le paramètre act_ouvertdyb coché.
  - Les modes de paiement sont désactivés. Ils seront activivés lorsque la validation des conditions de vente sera passée avec succès.
- Indiquez-nous votre identité
  - Les champs obligatoires sont : nom, prénom et email
  - email sera utilisé pour :
    - Pour vérifier que l'utilisateur n'est pas déjà inscrit aux activités et adhésions choisies dans l'inscription actuelle,
      lors de la sauvegarde de l'inscription pour décider l'il faut créer un nouvel adhérent ou bien rattacher l'inscription à un adhérent existant.
- Souhaitez-vous adhérer à l'association ?

- Quelles activités vous intéressent-elles ?
- Votre inscription
  - Valider valider les conditions de vente
    - Le programme affiche les éventuelles erreurs
    - Lorsque les conditions sont remplies, les zones de paiement sont ouvertes
- Comment pensez-vous régler ?
  - Règlement par Helloasso
    - Lorsque l'utilisateur valide, la facture est créé dans dybccr et l'utilisateur est rerouté vers le site de HelloAsso,
    - Lorsque l'utisateur a terminé l'utilisateur est retourné vers la page de retour : en fonction du succès du paiemmnt, le message est adapté. L'ID de la facture est affiché
    - Il est proposé à l'utilisateur de retourner vers Dybweb
  - Règlement par chèque et règlement par autre moyen
    - Lorsque l'utilisateur valide, la facture est créé dans dybccr
    - L'ID de la facture est affiché, il est demandé à l'utilisateur de rappeler ce numéro lors de son paiement.

## Règles retenues

- Question de l'enregistrement des enfants :
  ○ Le parent crée un email pour l'enfant, il inscrit l'enfant sur DYB WEB (solution retenue)

# Documentation manager DYBCCR (manager)

## En tant que manager, je veux créer un nouveau service

- Créer le service dans Dolibarr
- Lui attribuer impérativement un type d'activité
  - Activité : activité annuelle
  - Adhésion : différentes formules d'adhésion à l'association
  - Autres : si aucun des autres
  - Evénement : Evénement à date unique
  - Réduction-supplément
  - Répétitions : prêt ou location de salle
  - Stage : Stage de formation
  - type_domaine type_domaine Liste issue d'une table c_typedomain:label:rowid::
  - type_activite Liste issue d'une table c_typeactivity:label:rowid::
  - act_ouvertdyact_ouvertdyb Boolean

## En tant qu'manager, Je choisis les activités affichées dans DybWeb

- Dans Dolibarr, produits | Services
- J'affiche le service souhaité, je coche act_ouvertdyb

## Informations de l'adhérent

- genre - Liste issue d'une table c_civility:label:rowid::
- thi_birthday Type Date

## Informations de la facture

- inv_culturalseason Liste issue d'une table c_yearexercice:label:rowid::

# Installation

## installation du module

- Copier le module DYBCCR dans le répertoire custom de dolibarr

## Configuration du module

- Dolibarr/Accueil/Configuration/Modules
- Cliquer sur le module DYB CCR
- Paramètres :
  - Permet de fermer l'utilisation de dybweb (DYBCCR_DYBWEB_OPEN: "1"),
  - Message affiché dans dybweb lorsqu'il est fermé (DYBCCR_DYBWEB_CLOSE_MESSAGE: "Message affiché lorsque DYBWEB est fermé ")
  - Id de la saison culturelle par défut dans les factures générées par DYBWEN==B (DYBCCR_DYBWEB_CURRENT_SEASON : Saison en cours pour les inscriptions sur Dybweb)
  - Message affiché en entête de DYBWEB (DYBCCR_DYBWEB_INFORMATION_MESSAGE : "message affiché en en-tête de DYBWEB ")

- créer un user nommé DYBWEB user et dont la clé api est 'cleAPI_DYBWEB'

## Configuration Dolibarr nécessaire

(A compléter)

## paramétrage DYBWeb

## (A compléter)

# documents projet

[Présentation PowerPoint du projet](./img/Processus_inscription_présentation.pptx)
