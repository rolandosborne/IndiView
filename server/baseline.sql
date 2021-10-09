SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE TABLE IF NOT EXISTS `stat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `timestamp` INT(32) NOT NULL,
  `processor` INT NOT NULL,
  `memory` BIGINT(64) NOT NULL,
  `storage` BIGINT(64) NOT NULL,
  `accounts` BIGINT(64) NOT NULL,
  `requests` BIGINT(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `config_id` VARCHAR(32) NOT NULL,
  `str_value` VARCHAR(1024) NULL,
  `num_value` BIGINT(64) NULL,
  `bool_value` TINYINT NULL,
  UNIQUE INDEX `config_id_UNIQUE` (`config_id` ASC),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `account` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `amigo_id` VARCHAR(64) NOT NULL,
  `revision` INT NOT NULL,
  `handle` VARCHAR(128) NULL,
  `version` VARCHAR(64) NULL,
  `name` VARCHAR(128) NULL,
  `logo_set` TINYINT NOT NULL DEFAULT 0,
  `location` VARCHAR(1024) NULL,
  `description` VARCHAR(8192) NULL,
  `node` VARCHAR(1024) NULL,
  `registry` VARCHAR(1024) NULL,
  `enabled` TINYINT NOT NULL DEFAULT 1,
  `searchable` TINYINT NOT NULL DEFAULT 1,
  `token` VARCHAR(64) NOT NULL,
  `video_quality` VARCHAR(8) NOT NULL DEFAULT 'sd',
  `audio_quality` VARCHAR(8) NOT NULL DEFAULT 'sd',
  `video_mute` TINYINT NOT NULL DEFAULT 0,
  `audio_mute` TINYINT NOT NULL DEFAULT 0,
  `notifications` TINYINT NOT NULL DEFAULT 0,
  `push_token` VARCHAR(1024) NULL,
  `push_channel` VARCHAR(8) NULL,
  `gps` TINYINT NOT NULL DEFAULT 0,
  `gps_longitude` FLOAT NULL,
  `gps_latitude` FLOAT NULL,
  `gps_altitude` FLOAT NULL,
  `gps_timestamp` BIGINT(64) NULL,
  `alert_timestamp` BIGINT(64) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `token_UNIQUE` (`token` ASC),
  UNIQUE INDEX `emigo_UNIQUE` (`amigo_id` ASC),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB;

create index name_index on account(name);
create index handle_index on account(handle);
create index gps_index on account(gps);
create index gps_longitude_index on account(gps_longitude);
create index gps_latitude_index on account(gps_latitude);
create index gps_altitude_index on account(gps_altitude);
create index gps_timestamp_index on account(gps_timestamp);


