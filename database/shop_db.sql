CREATE DATABASE IF NOT EXISTS shop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shop_db;

-- 1. users
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  role        VARCHAR(10)  NOT NULL DEFAULT 'USER',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'))
);

-- 2. products
CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price       DECIMAL(12,0) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0)
);

-- 3. orders
CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  total_amount     DECIMAL(12,0) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  receiver_phone   VARCHAR(15)  NOT NULL,
  note             VARCHAR(255) NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
  CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'))
);

-- 4. order_items
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  price       DECIMAL(12,0) NOT NULL,
  CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT uq_order_product UNIQUE (order_id, product_id),
  CONSTRAINT chk_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_items_price CHECK (price >= 0)
);

-- ===== DỮ LIỆU MẪU =====

INSERT INTO users (full_name, email, password, phone, role) VALUES
('Quản Trị Viên', 'admin@shop.com', '$2b$10$LWGMwcRzXMr86uTYUzwyjOESWToru2G0F7hGTVz2r8mLhKxohOLTi', '0900000001', 'ADMIN'),
('Nguyễn Văn An', 'an@gmail.com',   '$2b$10$G60gpHLt/x0sv5huFKlj5erQXqGr49qCeXEQtG8I9RWQgWywEc.zu', '0900000002', 'USER'),
('Trần Thị Bình', 'binh@gmail.com', '$2b$10$G60gpHLt/x0sv5huFKlj5erQXqGr49qCeXEQtG8I9RWQgWywEc.zu', '0900000003', 'USER');

INSERT INTO products (name, description, price, stock, is_active) VALUES
('Áo thun basic', 'Áo thun cotton 100%, form rộng', 200000, 50, TRUE),
('Quần jean nam', 'Quần jean xanh đậm, co giãn nhẹ', 350000, 30, TRUE),
('Giày sneaker trắng', 'Giày thể thao đế cao su', 650000, 20, TRUE),
('Nón lưỡi trai', 'Nón vải, có thể chỉnh size', 120000, 100, TRUE),
('Balo laptop', 'Balo chống nước, ngăn laptop 15 inch', 480000, 15, TRUE),
('Áo khoác dù (ngừng bán)', 'Mẫu cũ đã ngừng kinh doanh', 300000, 0, FALSE);

-- Đơn 1 của An: 2 áo + 1 quần = 750000 (PENDING)
INSERT INTO orders (user_id, total_amount, shipping_address, receiver_phone, note, status) VALUES
(2, 750000, '12 Lê Lợi, Quận 1, TP.HCM', '0900000002', 'Giao giờ hành chính', 'PENDING');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 200000),
(1, 2, 1, 350000);

-- Đơn 2 của An: 1 giày = 650000 (DELIVERED)
INSERT INTO orders (user_id, total_amount, shipping_address, receiver_phone, note, status) VALUES
(2, 650000, '12 Lê Lợi, Quận 1, TP.HCM', '0900000002', NULL, 'DELIVERED');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(2, 3, 1, 650000);

-- Đơn 3 của Bình: 2 nón + 1 balo = 720000 (SHIPPING)
INSERT INTO orders (user_id, total_amount, shipping_address, receiver_phone, note, status) VALUES
(3, 720000, '45 Nguyễn Huệ, Quận 3, TP.HCM', '0900000003', 'Gọi trước khi giao', 'SHIPPING');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(3, 4, 2, 120000),
(3, 5, 1, 480000);

-- Đơn 4 của Bình: 1 áo = 200000 (CANCELLED)
INSERT INTO orders (user_id, total_amount, shipping_address, receiver_phone, note, status) VALUES
(3, 200000, '45 Nguyễn Huệ, Quận 3, TP.HCM', '0900000003', NULL, 'CANCELLED');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(4, 1, 1, 200000);