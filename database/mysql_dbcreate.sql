CREATE TABLE `activites` (
  `act_id` int,
  `act_ext_key` varchar(255) COMMENT 'clé externe type D02',
  `act_libelle` varchar(255) NOT NULL,
  `act_mode_rem` varchar(255) COMMENT 'Mode de rémunération du prof a l''h ou au 1/4/ h/élève',
  `dom_id` int,
  `tyac_id` int
);

CREATE TABLE `domaines` (
  `dom_id` int,
  `dom_libelle` varchar(255) COMMENT 'Danse, '
);

CREATE TABLE `typeactivite` (
  `tyac_id` int,
  `tyac_libelle` varchar(255) COMMENT 'cours, événement,adhésion, stage, don, Crowdfunding',
  `tyac_famille` varchar(255)
);

CREATE TABLE `personnes` (
  `per_id` int PRIMARY KEY AUTO_INCREMENT,
  `per_nom` varchar(255) NOT NULL,
  `civ_id` int,
  `per_prenom` varchar(255) NOT NULL,
  `per_tel` varchar(255),
  `per_email` varchar(255) NOT NULL,
  `per_adresse` varchar(255),
  `per_code_postal` varchar(255),
  `per_ville` varchar(255),
  `per_dat_naissance` date
);

CREATE TABLE `civilites` (
  `civ_id` int,
  `civ_libelle` varchar(255)
);

CREATE TABLE `role` (
  `rol_id` int PRIMARY KEY AUTO_INCREMENT,
  `tyro_id` int,
  `pers_id` int,
  `act_id` int
);

CREATE TABLE `reglements` (
  `reg_id` int PRIMARY KEY AUTO_INCREMENT,
  `reg_montant` float,
  `mreg_id` int,
  `reg_date` varchar(255)
);

CREATE TABLE `modereglement` (
  `mreg_id` int,
  `mreg_code` varchar(255) COMMENT 'ESP, CHE, HEL, DIS, TPE',
  `mreg_Libelle` varchar(255)
);

CREATE TABLE `tarifs` (
  `tar_id` int PRIMARY KEY AUTO_INCREMENT,
  `ans_id` int,
  `act_id` int,
  `tar_montant` float,
  `tar_libelle` varchar(255)
);

CREATE TABLE `an_exercice` (
  `ans_id` int,
  `ans_libelle` varchar(255) COMMENT '2019-2020, 2020-2021,...',
  `ans_date_debut` date,
  `ans_date_fin` date
);

CREATE TABLE `inscriptions` (
  `ins_id` int PRIMARY KEY AUTO_INCREMENT,
  `per_id` int,
  `act_id` int,
  `ins_date_inscription` date NOT NULL,
  `reg_id` int,
  `ins_debut` date COMMENT 'début d''activité de la ligne',
  `ins_fin` date COMMENT 'fin''activité de la ligne',
  `ins_montant` float,
  `ans_id` int
);

CREATE TABLE `typerole` (
  `tyro_id` int,
  `tyro_libelle` varchar(255) COMMENT 'animateur, référent, etc'
);
CREATE TABLE IF NOT EXISTS `brouillon`(
  `brou_id` int,
  `brou_nom` varchar(255),
  `brou_prenom` varchar(255),
  `brou_portable` char(50),
  `brou_email` varchar(255),
  `brou_commune` varchar(255),
  `brou_adh` float,
  `brou_act` float,
  `brou_reglement` char(3),
  `brou_code` varchar(255),
  `brou_CP` varchar(255),
  `brou_annee` char(9),
  `brou_date_adh` char(10),
  `brou_date_naiss`char(10),
  `brou_titre` varchar(255),
  `brou_telephone` char(50)
);
