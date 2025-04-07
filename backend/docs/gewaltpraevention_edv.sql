-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/

--
-- Datenbank: `gewaltpraevention_edv`
--
CREATE DATABASE IF NOT EXISTS `gewaltpraevention_edv` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gewaltpraevention_edv`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gesendet_am` datetime DEFAULT NULL,
  `nachweis` enum('fz','us') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `email_logs`
--

INSERT INTO `email_logs` (`id`, `email`, `gesendet_am`, `nachweis`) VALUES
(47, 'paulfriedrich.kroener@gmail.com', '2025-04-07 12:00:01', 'fz'),
(48, 'paulfriedrich.kroener@gmail.com', '2025-04-07 12:00:01', 'us');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `gp_employees`
--

CREATE TABLE `gp_employees` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `vorname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `postadresse` varchar(255) DEFAULT NULL,
  `gemeinde_freizeit` varchar(255) DEFAULT NULL,
  `fz_eingetragen` date DEFAULT NULL,
  `fz_abgelaufen` date DEFAULT NULL,
  `fz_kontrolliert` varchar(255) DEFAULT NULL,
  `fz_kontrolliert_am` date DEFAULT NULL,
  `gs_eingetragen` date DEFAULT NULL,
  `gs_erneuert` date DEFAULT NULL,
  `gs_kontrolliert` varchar(255) DEFAULT NULL,
  `us_eingetragen` date DEFAULT NULL,
  `us_abgelaufen` date DEFAULT NULL,
  `us_kontrolliert` varchar(255) DEFAULT NULL,
  `sve_eingetragen` date DEFAULT NULL,
  `sve_kontrolliert` varchar(255) DEFAULT NULL,
  `hauptamt` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `gp_users`
--

CREATE TABLE `gp_users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `vorname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` tinyint(1) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `gp_employees`
--
ALTER TABLE `gp_employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indizes für die Tabelle `gp_users`
--
ALTER TABLE `gp_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT für Tabelle `gp_employees`
--
ALTER TABLE `gp_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT für Tabelle `gp_users`
--
ALTER TABLE `gp_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;