SELECT
    ae.ans_libelle                          AS annee,
    COUNT(*)                                AS nb_personnes,
    ROUND(AVG(age_a_l_inscription), 1)      AS age_moyen,
    MIN(age_a_l_inscription)                AS age_min,
    MAX(age_a_l_inscription)                AS age_max
FROM (
    -- Une ligne par personne et par année (première inscription de l'année)
    SELECT
        i.per_id,
        i.ans_id,
        TIMESTAMPDIFF(
            YEAR,
            p.per_dat_naissance,
            MIN(i.ins_date_inscription)     -- date de la 1ère inscription dans l'année
        ) AS age_a_l_inscription
    FROM inscriptions i
    JOIN personnes p ON p.per_id = i.per_id
    WHERE p.per_dat_naissance IS NOT NULL
    GROUP BY i.per_id, i.ans_id, p.per_dat_naissance
) sub
JOIN an_exercice ae ON ae.ans_id = sub.ans_id
GROUP BY sub.ans_id, ae.ans_libelle
ORDER BY ae.ans_libelle;

-- Nb inscriptions
SELECT an_exercice.ans_libelle, COUNT(*) FROM inscriptions
LEFT JOIN an_exercice ON an_exercice.ans_id=inscriptions.ans_id
WHERE inscriptions.act_id=191
GROUP BY inscriptions.ans_id

-- Nb activités
SELECT an_exercice.ans_libelle, COUNT(*) FROM inscriptions
LEFT JOIN an_exercice ON an_exercice.ans_id=inscriptions.ans_id
WHERE inscriptions.act_id!=191
GROUP BY inscriptions.ans_id

-- Check unicity 
SELECT inscriptions.ans_id,inscriptions.per_id,inscriptions.act_id, COUNT(*) as compte FROM inscriptions
GROUP BY inscriptions.ans_id,inscriptions.per_id,inscriptions.act_id
order BY compte DESC

--- Nb adhesion par ville
SELECT personnes.per_ville,personnes.per_code_postal, an_exercice.ans_libelle, COUNT(*) as compte FROM inscriptions
LEFT JOIN an_exercice ON an_exercice.ans_id=inscriptions.ans_id
left JOIN personnes ON personnes.per_id=inscriptions.per_id
WHERE inscriptions.act_id=191 AND inscriptions.ans_id=1
GROUP BY per_ville
ORDER BY compte DeSC

--- Rennes, métrolople, 35, autre
SELECT personnes.per_code_postal, if (personnes.per_code_postal in (35520, 35230, 35310, 35230, 35230, 35230, 35760, 35850, 35740, 35150, 35890, 
35170, 35310, 35850,35850,35590,35230,35136,35190,35630,35190,35510,35650,35131,35131,
35690,35590,3525035760,35160,35770,35135,35530,35310,35590,35250,35132,35410,35235,35850, 35830, 35590)
, 'Metropole', 
if (personnes.per_code_postal IN (35000, 35200, 35700), 'Rennes',
if (SUBSTR(personnes.per_code_postal,0,2) = 35,'Ille et Vilaine','Autre'))) FROM personnes


--- Extract
SELECT per_nom, per_prenom, per_ville, personnes.per_code_postal,       
if (personnes.per_code_postal in (35520, 35230, 35310, 35230, 35230, 35230, 35760, 35850, 35740, 35150, 35890, 
35170, 35310, 35850,35850,35590,35230,35136,35190,35630,35190,35510,35650,35131,35131,
35690,35590,3525035760,35160,35770,35135,35530,35310,35590,35250,35132,35410,35235,35850, 35830, 35590)
, 'Metropole', 
if (personnes.per_code_postal IN (35000, 35200, 35700), 'Rennes',
if (left(personnes.per_code_postal,2) = '35','Ille et VIlaine','Autre'))) AS per_lieu,
personnes.per_dat_naissance ,

 TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) AS age,

 if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >=70,'70+',
  if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >=60, '60',
  if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) >=50, '50',
   if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) >=40, '40',
 if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >=30, '30',
 if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) >=20, '20',
 if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >=10, '10'
 ,'10-'
 ))))))) AS tranche_age,
 if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >60,'60+',
  if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription)  >=41, '41-60',
  if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) >=26, '26-40',
   if (TIMESTAMPDIFF(YEAR,personnes.per_dat_naissance,inscriptions.ins_date_inscription) >=18, '18-26'
 ,'18-')))) AS tranche_age_insee,
 activites.act_libelle, typeactivite.tyac_libelle, tyac_famille ,
 domaines.dom_libelle, dom_family,
 
 an_exercice.ans_libelle,
 1 as compte, 
 inscriptions.ins_montant AS montant 
 FROM inscriptions
 
LEFT JOIN an_exercice ON an_exercice.ans_id=inscriptions.ans_id
left JOIN personnes ON personnes.per_id=inscriptions.per_id
LEFT JOIN activites ON activites.act_id=inscriptions.act_id
LEFT JOIN typeactivite ON typeactivite.tyac_id=activites.tyac_id
LEFT JOIN domaines ON domaines.dom_id = activites.dom_id
WHERE inscriptions.act_id=191 AND inscriptions.ans_id=4
ORDER BY compte DESC; 

-- Doublons
[DANVEAU Michel] Adhésion 2024-2025 déjà existante — ignorée
[DANIEL Loic] Adhésion 2024-2025 déjà existante — ignorée
[DANIEL Loic] Activité C03/2024-2025 déjà existante — ignorée
[DELAUNAY Marie-France] Adhésion 2024-2025 déjà existante — ignorée
[DINARD Christelle] Adhésion 2024-2025 déjà existante — ignorée
[FARINELLI VITRY Nils] Adhésion 2024-2025 déjà existante — ignorée
[GARANI Florence] Adhésion 2024-2025 déjà existante — ignorée
[GARANI Florence] Activité D01/2024-2025 déjà existante — ignorée
[LE TOQUIN Anne] Adhésion 2024-2025 déjà existante — ignorée
[LEBEAU Loane] Adhésion 2024-2025 déjà existante — ignorée
[LEBEAU Loane] Activité D02/2024-2025 déjà existante — ignorée
[LEBEAU Morgane] Adhésion 2024-2025 déjà existante — ignorée
[LEBEAU Morgane] Activité D02/2024-2025 déjà existante — ignorée
[MARQUET Yannick] Adhésion 2024-2025 déjà existante — ignorée
[MARQUET Yannick] Activité D05/2024-2025 déjà existante — ignorée
[MARY Zacharie] Adhésion 2024-2025 déjà existante — ignorée
[MOREAU Maëg] Adhésion 2024-2025 déjà existante — ignorée
[MOREAU Maëg] Activité M09/2024-2025 déjà existante — ignorée
[NOEL Sophie] Adhésion 2024-2025 déjà existante — ignorée
[NOEL Sophie] Activité D05/2024-2025 déjà existante — ignorée
[PIEDVACHE Maryvonne] Adhésion 2024-2025 déjà existante — ignorée
[PIEDVACHE Maryvonne] Activité D01/2024-2025 déjà existante — ignorée
[PRUKOP Stéphane] Adhésion 2024-2025 déjà existante — ignorée
[PRUKOP Stéphane] Activité D08/2024-2025 déjà existante — ignorée

[DANIEL Loic] Adhésion 2025-2026 déjà existante — ignorée
[DANIEL Loic] Activité C03/2025-2026 déjà existante — ignorée
[DINARD Christelle] Adhésion 2025-2026 déjà existante — ignorée
[FARINELLI VITRY Nils] Adhésion 2025-2026 déjà existante — ignorée
[GARANI Florence] Adhésion 2025-2026 déjà existante — ignorée
[GARANI Florence] Activité D01/2025-2026 déjà existante — ignorée
[GARANI Florence] Activité D05/2025-2026 déjà existante — ignorée
[HOUZE KARWAT-SEKO Irène] Adhésion 2025-2026 déjà existante — ignorée
[LE TOQUIN Anne] Adhésion 2025-2026 déjà existante — ignorée
[LEBEAU Loane] Adhésion 2025-2026 déjà existante — ignorée
[LEBEAU Loane] Activité D05/2025-2026 déjà existante — ignorée
[MARQUET Yannick] Adhésion 2025-2026 déjà existante — ignorée
[MARQUET Yannick] Activité D05/2025-2026 déjà existante — ignorée
[OUANNY Laurène] Adhésion 2025-2026 déjà existante — ignorée
[OUANNY Laurène] Activité D02/2025-2026 déjà existante — ignorée
[PIEDVACHE Maryvonne] Adhésion 2025-2026 déjà existante — ignorée
[PIEDVACHE Maryvonne] Activité D01/2025-2026 déjà existante — ignorée
[PRUKOP Stéphane] Adhésion 2025-2026 déjà existante — ignorée
[PRUKOP Stéphane] Activité D08/2025-2026 déjà existante — ignorée
[RICHARD Faustine] Adhésion 2025-2026 déjà existante — ignorée
[RICHARD Faustine] Activité D09/2025-2026 déjà existante — ignorée