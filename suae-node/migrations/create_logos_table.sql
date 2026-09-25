-- Create logos table
CREATE TABLE IF NOT EXISTS `logos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `file_url` LONGTEXT NOT NULL,
  `file_id` VARCHAR(100) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT 'Company Logo',
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure only one logo can be active at a time (optional trigger)
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS `before_logo_activate` 
BEFORE UPDATE ON `logos`
FOR EACH ROW
BEGIN
  IF NEW.is_active = TRUE AND OLD.is_active = FALSE THEN
    UPDATE `logos` SET `is_active` = FALSE WHERE `id` != NEW.id;
  END IF;
END$$
DELIMITER ;
