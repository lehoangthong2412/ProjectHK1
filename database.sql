SET FOREIGN_KEY_CHECKS=0;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;

-- 1. branches
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `branch_id` bigint NOT NULL AUTO_INCREMENT,
  `branch_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`branch_id`),
  UNIQUE KEY `branch_code` (`branch_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ADMIN','AGENT','CUSTOMER') NOT NULL,
  `branch_id` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `fk_users_branch` (`branch_id`),
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `customer_code` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `customer_code` (`customer_code`),
  KEY `fk_customers_user` (`user_id`),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. shipment_types
DROP TABLE IF EXISTS `shipment_types`;
CREATE TABLE `shipment_types` (
  `shipment_type_id` bigint NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `base_rate` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`shipment_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. shipments
DROP TABLE IF EXISTS `shipments`;
CREATE TABLE `shipments` (
  `shipment_id` bigint NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(50) NOT NULL,
  `sender_customer_id` bigint NOT NULL,
  `receiver_customer_id` bigint NOT NULL,
  `shipment_type_id` bigint NOT NULL,
  `origin_branch_id` bigint NOT NULL,
  `assigned_agent_id` bigint DEFAULT NULL,
  `weight` decimal(10,2) NOT NULL,
  `total_charge` decimal(12,2) NOT NULL,
  `current_status` enum('BOOKED','IN_TRANSIT','DELIVERED','CANCELLED') DEFAULT 'BOOKED',
  `booking_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` datetime DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `sender_customer_id` (`sender_customer_id`),
  KEY `receiver_customer_id` (`receiver_customer_id`),
  KEY `shipment_type_id` (`shipment_type_id`),
  KEY `origin_branch_id` (`origin_branch_id`),
  KEY `assigned_agent_id` (`assigned_agent_id`),
  CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`sender_customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`receiver_customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `shipments_ibfk_3` FOREIGN KEY (`shipment_type_id`) REFERENCES `shipment_types` (`shipment_type_id`),
  CONSTRAINT `shipments_ibfk_4` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`branch_id`),
  CONSTRAINT `shipments_ibfk_5` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. bills
DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `bill_id` bigint NOT NULL AUTO_INCREMENT,
  `bill_number` varchar(30) NOT NULL,
  `shipment_id` bigint NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_status` enum('UNPAID','PAID') DEFAULT 'UNPAID',
  `payment_method` enum('CASH','BANK_TRANSFER','CARD') DEFAULT NULL,
  `issued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by_user_id` bigint NOT NULL,
  PRIMARY KEY (`bill_id`),
  UNIQUE KEY `bill_number` (`bill_number`),
  UNIQUE KEY `shipment_id` (`shipment_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`shipment_id`),
  CONSTRAINT `bills_ibfk_2` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. shipment_status_history
DROP TABLE IF EXISTS `shipment_status_history`;
CREATE TABLE `shipment_status_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `shipment_id` bigint NOT NULL,
  `status` enum('BOOKED','IN_TRANSIT','DELIVERED','CANCELLED') NOT NULL,
  `status_note` varchar(255) DEFAULT NULL,
  `updated_by_user_id` bigint NOT NULL,
  `event_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `shipment_id` (`shipment_id`),
  KEY `updated_by_user_id` (`updated_by_user_id`),
  CONSTRAINT `shipment_status_history_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`shipment_id`),
  CONSTRAINT `shipment_status_history_ibfk_2` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DỮ LIỆU MẪU
INSERT INTO `branches` (`branch_code`, `branch_name`, `city`) VALUES ('HCM01', 'Chi nhánh Quận 1', 'Hồ Chí Minh');
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `role`, `branch_id`) VALUES ('admin', '123', 'Admin', 'ADMIN', 1);
INSERT INTO `shipment_types` (`type_name`, `base_rate`) VALUES ('Giao nhanh', 30000), ('Giao tiết kiệm', 15000);
INSERT INTO `customers` (`customer_code`, `full_name`, `phone`, `city`) VALUES ('CUST001', 'Nguyen Van A', '0123456789', 'Hồ Chí Minh'), ('CUST002', 'Tran Thi B', '0987654321', 'Hà Nội');

SET FOREIGN_KEY_CHECKS=1;
