--
-- Script run when an upgrade of Dolibarr is done. Whatever is the Dolibarr version.
--
CREATE TABLE IF NOT EXISTS llx_c_typeactivity
(
	rowid  integer      AUTO_INCREMENT PRIMARY KEY,
	code   varchar(30)  NOT NULL,
	label  varchar(128) NOT NULL,
	active tinyint      DEFAULT 1 NOT NULL
) ENGINE=innodb;

CREATE TABLE IF NOT EXISTS llx_c_typedomain
(
	rowid  integer      AUTO_INCREMENT PRIMARY KEY,
	code   varchar(30)  NOT NULL,
	label  varchar(128) NOT NULL,
	active tinyint      DEFAULT 1 NOT NULL
) ENGINE=innodb;

CREATE TABLE IF NOT EXISTS llx_c_yearexercice
(
	rowid  integer      AUTO_INCREMENT PRIMARY KEY,
	code   varchar(30)  NOT NULL,
	label  varchar(128) NOT NULL,
	active tinyint      DEFAULT 1 NOT NULL
) ENGINE=innodb;