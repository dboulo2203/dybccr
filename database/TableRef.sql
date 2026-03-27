-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table adhesion.activites
CREATE TABLE IF NOT EXISTS `activites` (
  `act_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `act_ext_key` varchar(255) DEFAULT NULL COMMENT 'clé externe type D02',
  `act_libelle` varchar(255) NOT NULL,
  `act_mode_rem` varchar(255) DEFAULT NULL COMMENT 'Mode de rémunération du prof a l''h ou au 1/4/ h/élève',
  `dom_id` MEDIUMINT DEFAULT NULL,
  `tyac_id` MEDIUMINT DEFAULT NULL,
  PRIMARY KEY (`act_id`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.activites: ~48 rows (approximately)
DELETE FROM `activites`;
INSERT INTO `activites` (`act_id`, `act_ext_key`, `act_libelle`, `act_mode_rem`, `dom_id`, `tyac_id`) VALUES
	(128, 'D01', 'Danse bretonne le mardi', NULL, 8, 1),
	(129, 'D02', 'Danse bretonne débutants - mercredi', NULL, 8, 1),
	(130, 'D03', 'Danse bretonne tous niveaux - jeudi matin', NULL, 8, 1),
	(131, 'D04', 'Danse bretonne débutants - jeudi ', NULL, 8, 1),
	(132, 'D05', 'Danse bretonne non-débutants - mercredi', NULL, 8, 1),
	(133, 'D06', 'Danse bretonne non-débutants - jeudi', NULL, 8, 1),
	(134, 'D07', 'Danse écossaise / Folk', NULL, 8, 1),
	(135, 'D08', 'Danse irlandaise', NULL, 8, 1),
	(136, 'D09', 'Multi-activités enfant', NULL, 8, 1),
	(137, 'D10', 'Sensibilisation à l\'animation', NULL, 9, 1),
	(138, 'M01', 'Accordéon diatonique', NULL, 1, 1),
	(139, 'M02', 'Biniou kozh/ Veuze', NULL, 1, 1),
	(140, 'M03', 'Bohdran', NULL, 1, 1),
	(141, 'M04', 'Bombarde', NULL, 1, 1),
	(142, 'M05', 'Clarinette', NULL, 1, 1),
	(143, 'M06', 'Cornemuse', NULL, 1, 1),
	(144, 'M06a', 'Flûte - Tin Whistle', NULL, 1, 1),
	(145, 'M06b', 'Flûte - Low Whistle', NULL, 1, 1),
	(146, 'M07', 'Flûte traversière', NULL, 1, 1),
	(147, 'M08', 'Guitare', NULL, 1, 1),
	(148, 'M09', 'Harpe celtique', NULL, 1, 1),
	(149, 'M10', 'Saxophone', NULL, 1, 1),
	(150, 'M11', 'Violon', NULL, 1, 1),
	(151, 'M12', 'Musique bretonne en ensemble - Ado', NULL, 2, 1),
	(152, 'M13', 'Musique bretonne en ensemble ', NULL, 2, 1),
	(153, 'M14', 'Musique bretonne en acoustique', NULL, 2, 1),
	(154, 'M15', 'Musique irlandaise en ensemble', NULL, 2, 1),
	(155, 'M16', 'Sonneurs de couple biniou - bombarde', NULL, 2, 1),
	(156, 'M17', 'Sonneurs de couple cornemuse - bombarde', NULL, 2, 1),
	(157, 'M18', 'Musique écossaise', NULL, 2, 1),
	(158, 'C01', 'Chant traditionnel en breton', NULL, 3, 1),
	(159, 'C02', 'Chant traditionnel Haute-Bretagne', NULL, 3, 1),
	(160, 'C03', 'Chorale en breton', NULL, 3, 1),
	(161, 'C04', 'Chant marin', NULL, 3, 1),
	(162, 'L01', 'Cours de langue bretonne', NULL, 4, 1),
	(163, 'L02', 'Cours de langue gallèse', NULL, 4, 1),
	(164, 'L03', 'Stages de Gallo avec Nânon', NULL, 4, 4),
	(165, 'AS01', 'Astour - Danse (Adhésion Astour)', NULL, 5, 1),
	(166, 'AS02', 'Astour - Musique', NULL, 5, 1),
	(167, 'AS03', 'Astour- Soutien logistique', NULL, 5, 1),
	(168, 'A01', 'Broderie', NULL, 6, 1),
	(169, 'A02', 'Sensibilisation aux contes', NULL, 6, 1),
	(170, 'A03', 'Activité culinaire de Bretagne et d\'ailleurs', NULL, 6, 1),
	(171, 'A04', 'Répétitions ', NULL, 7, 10),
	(172, 'A05', 'Autres ', NULL, 9, 11),
	(173, 'A06', 'Théâtre', NULL, 6, 1),
	(191, 'AUT01', 'Adhésion', NULL, 10, 3),
	(192, 'AUT02', 'Réduction-complément', NULL, 11, 12);

-- Dumping structure for table adhesion.an_exercice
CREATE TABLE IF NOT EXISTS `an_exercice` (
  `ans_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `ans_libelle` varchar(255) DEFAULT NULL COMMENT '2019-2020, 2020-2021,...',
  `ans_date_debut` datetime DEFAULT NULL,
  `ans_date_fin` datetime DEFAULT NULL,
  PRIMARY KEY (`ans_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.an_exercice: ~4 rows (approximately)
DELETE FROM `an_exercice`;
INSERT INTO `an_exercice` (`ans_id`, `ans_libelle`, `ans_date_debut`, `ans_date_fin`) VALUES
	(1, '2024-2025', '2024-09-01', '2025-08-31'),
	(2, '2023-2024', '2023-09-01', '2024-08-31'),
	(3, '2022-2023', '2022-09-01', '2023-08-31'),
	(4, '2025-2026', '2025-09-01', '2026-08-31');

-- Dumping structure for table adhesion.civilites
CREATE TABLE IF NOT EXISTS `civilites` (
  `civ_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `civ_libelle` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`civ_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.civilites: ~2 rows (approximately)
DELETE FROM `civilites`;
INSERT INTO `civilites` (`civ_id`, `civ_libelle`) VALUES
	(1, 'Monsieur'),
	(2, 'Madame');

-- Dumping structure for table adhesion.domaines
CREATE TABLE IF NOT EXISTS `domaines` (
  `dom_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `dom_libelle` varchar(255) DEFAULT NULL COMMENT 'Danse, ',
  PRIMARY KEY (`dom_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.domaines: ~11 rows (approximately)
DELETE FROM `domaines`;
INSERT INTO `domaines` (`dom_id`, `dom_libelle`) VALUES
	(1, 'Pratiques musicales'),
	(2, 'Pratiques d\'ensemble'),
	(3, 'Chants'),
	(4, 'Langues'),
	(5, 'Art populaire'),
	(6, 'Art traditionnel'),
	(7, 'Répétitions'),
	(8, 'Danses'),
	(9, 'Autres'),
	(10, 'Adhésion'),
	(11, 'Réduction');

-- Dumping structure for table adhesion.modereglement
CREATE TABLE IF NOT EXISTS `modereglement` (
  `mreg_id` MEDIUMINT DEFAULT NULL,
  `mreg_code` varchar(50) NOT NULL,
  `mreg_Libelle` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.modereglement: ~5 rows (approximately)
DELETE FROM `modereglement`;
INSERT INTO `modereglement` (`mreg_id`, `mreg_code`, `mreg_Libelle`) VALUES
	(1, 'ESP', 'Espèces'),
	(2, 'HEL', 'HelloAsso'),
	(3, 'TPE', 'TPE'),
	(4, 'CHE', 'Chèque'),
	(5, 'DIS', 'Dispositif sortir'),
	(6, 'VAC', 'Chèque vacances'),
	(7, 'VIR', 'Virement bancaire'),
	(8, '-', 'Aucun mode de règlement');

-- Dumping structure for table adhesion.typeactivite
CREATE TABLE IF NOT EXISTS `typeactivite` (
  `tyac_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `tyac_libelle` varchar(255) DEFAULT NULL COMMENT 'cours, événement,adhésion, stage, don, Crowdfunding',
  PRIMARY KEY (`tyac_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.typeactivite: ~7 rows (approximately)
DELETE FROM `typeactivite`;
INSERT INTO `typeactivite` (`tyac_id`, `tyac_libelle` , `tyac_famille`) VALUES
	(1, 'Activité','1'),
	(2, 'Stage','1'),
	(3, 'Adhésion','2'),
	(4, 'Evénement','1'),
	(10, 'Répétitions','1'),
	(11, 'Autres','1'),
	(12, 'Réduction-supplément','3');

-- Dumping structure for table adhesion.typerole
CREATE TABLE IF NOT EXISTS `typerole` (
  `tyro_id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `tyro_libelle` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tyro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Dumping data for table adhesion.typerole: ~2 rows (approximately)
DELETE FROM `typerole`;
INSERT INTO `typerole` (`tyro_id`, `tyro_libelle`) VALUES
	(1, 'Animateur'),
	(2, 'Référent');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
