-- ============================================================
-- DocuPasion - Esquema completo MySQL
--
-- phpMyAdmin > Pestaña SQL > Pegar todo > Ejecutar
--
-- El usuario admin se crea automáticamente al iniciar el
-- servidor (admin@docupasion.com / Admin123456!).
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. BASE DE DATOS Y USUARIO
-- ============================================================

CREATE DATABASE IF NOT EXISTS `docupasion`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Si usas root en XAMPP puedes omitir este bloque
CREATE USER IF NOT EXISTS 'docupasion'@'localhost'
    IDENTIFIED BY 'DocuPasion2024!';
GRANT ALL PRIVILEGES ON `docupasion`.* TO 'docupasion'@'localhost';
FLUSH PRIVILEGES;

USE `docupasion`;

-- ============================================================
-- 2. TABLAS
-- ============================================================

-- ------------------------------------------------------------
-- 2.1  users  —  Usuarios del sistema (RF-001, RF-002)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id`               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `email`            VARCHAR(255)    NOT NULL,
    `hashed_password`  VARCHAR(255)    NOT NULL,
    `role`             ENUM('client','admin') NOT NULL DEFAULT 'client',
    `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE  KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.2  categories  —  Clasificación documental (RF-007, 9.12)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(80)     NOT NULL,
    `description` VARCHAR(255)    DEFAULT NULL,
    `is_default`  TINYINT(1)      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE  KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.3  repositories  —  Contenedores de documentos (RF-006)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `repositories` (
    `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(120)    NOT NULL,
    `owner_id`   INT UNSIGNED    NOT NULL,
    `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE  KEY `uq_repository_owner_name` (`owner_id`, `name`),
    CONSTRAINT `fk_repositories_owner`
        FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.4  documents  —  Archivos cargados (RF-001..RF-005)
--       extracted_text es MEDIUMTEXT por documentos grandes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `documents` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `filename`          VARCHAR(255)    NOT NULL,
    `original_filename` VARCHAR(255)    NOT NULL,
    `file_path`         VARCHAR(500)    NOT NULL,
    `file_size`         INT UNSIGNED    DEFAULT NULL,
    `mime_type`         VARCHAR(100)    DEFAULT NULL,
    `status`            ENUM('processing','indexed','failed') NOT NULL DEFAULT 'processing',
    `content_summary`   TEXT            DEFAULT NULL,
    `extracted_text`    MEDIUMTEXT      DEFAULT NULL,
    `owner_id`          INT UNSIGNED    NOT NULL,
    `repository_id`     INT UNSIGNED    DEFAULT NULL,
    `category_id`       INT UNSIGNED    DEFAULT NULL,
    `uploaded_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed_at`      DATETIME        DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX  `idx_documents_owner`      (`owner_id`),
    INDEX  `idx_documents_status`     (`status`),
    INDEX  `idx_documents_repository` (`repository_id`),
    INDEX  `idx_documents_category`   (`category_id`),
    CONSTRAINT `fk_documents_owner`
        FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_documents_repository`
        FOREIGN KEY (`repository_id`) REFERENCES `repositories` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_documents_category`
        FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.5  document_extractions  —  Campos extraídos por IA (9.7)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `document_extractions` (
    `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `document_id`     INT UNSIGNED    NOT NULL,
    `field_name`      VARCHAR(80)     NOT NULL,
    `field_value`     TEXT            NOT NULL,
    `extraction_type` VARCHAR(30)     NOT NULL,
    `timestamp`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX  `idx_extractions_document` (`document_id`),
    CONSTRAINT `fk_extractions_document`
        FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.6  ai_logs  —  Auditoría de operaciones IA (RNF-004)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_logs` (
    `id`                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `document_id`         INT UNSIGNED    DEFAULT NULL,
    `owner_id`            INT UNSIGNED    DEFAULT NULL,
    `operation_type`      VARCHAR(30)     DEFAULT NULL,
    `tokens_used`         INT UNSIGNED    DEFAULT NULL,
    `processing_time_ms`  INT UNSIGNED    DEFAULT NULL,
    `timestamp`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX  `idx_ailogs_document` (`document_id`),
    INDEX  `idx_ailogs_owner`    (`owner_id`),
    INDEX  `idx_ailogs_op`       (`operation_type`),
    CONSTRAINT `fk_ailogs_document`
        FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_ailogs_owner`
        FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.7  error_logs  —  Registro de errores (RNF-005)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `error_logs` (
    `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `document_id` INT UNSIGNED    DEFAULT NULL,
    `error_code`  VARCHAR(50)     NOT NULL,
    `message`     TEXT            NOT NULL,
    `level`       VARCHAR(20)     NOT NULL DEFAULT 'error',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX  `idx_errorlogs_document` (`document_id`),
    CONSTRAINT `fk_errorlogs_document`
        FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.8  system_config  —  Parámetros RAG en tiempo de ejecución (RF-020)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_config` (
    `key`   VARCHAR(80) NOT NULL,
    `value` TEXT        DEFAULT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 3. DATOS INICIALES
-- ============================================================

-- 3.1  Categorías del sistema (RF-007, 9.12)
INSERT IGNORE INTO `categories` (`name`, `description`, `is_default`) VALUES
    ('academico',      'Documentos de carácter académico e investigativo',    0),
    ('tecnico',        'Documentos técnicos y de ingeniería',                 0),
    ('legal',          'Documentos con valor legal o contractual',            0),
    ('administrativo', 'Documentos de gestión y administración',              0),
    ('general',        'Categoría por defecto cuando no se supera el umbral', 1);

-- 3.2  Parámetros RAG por defecto (RF-020)
INSERT IGNORE INTO `system_config` (`key`, `value`) VALUES
    ('chunk_size',    '512'),
    ('chunk_overlap', '64'),
    ('llm_model',     'gpt-4o-mini');

-- ============================================================
-- 4. VERIFICACIÓN
-- ============================================================
SELECT
    (SELECT COUNT(*) FROM `categories`)        AS 'Categorías',
    (SELECT COUNT(*) FROM `users`)             AS 'Usuarios',
    (SELECT COUNT(*) FROM `system_config`)     AS 'Parámetros',
    'Esquema DocuPasion creado correctamente'  AS 'Resultado';
