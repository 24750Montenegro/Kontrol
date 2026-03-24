SET search_path TO kontrol;

DROP TABLE IF EXISTS MOVIMIENTO_INVENTARIO CASCADE;
DROP TABLE IF EXISTS PRODUCTO_PROVEEDOR CASCADE;
DROP TABLE IF EXISTS PROVEEDOR CASCADE;
DROP TABLE IF EXISTS PRODUCTO CASCADE;
DROP TABLE IF EXISTS CATEGORIA CASCADE;
DROP TABLE IF EXISTS REPORTE CASCADE;
DROP TABLE IF EXISTS PRESUPUESTO_ACTIVIDAD CASCADE;
DROP TABLE IF EXISTS EVIDENCIA CASCADE;
DROP TABLE IF EXISTS ASIGNACION CASCADE;
DROP TABLE IF EXISTS TAREA CASCADE;
DROP TABLE IF EXISTS PROYECTO CASCADE;
DROP TABLE IF EXISTS USUARIO CASCADE;
DROP TABLE IF EXISTS EMPRESA CASCADE;
DROP TABLE IF EXISTS ROL CASCADE;

CREATE TABLE ROL (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE EMPRESA (
    id_empresa SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    industria VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE USUARIO (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    id_empresa INT REFERENCES EMPRESA(id_empresa) ON DELETE SET NULL,
    id_rol INT NOT NULL REFERENCES ROL(id_rol) ON DELETE RESTRICT
);

CREATE TABLE PROYECTO (
    id_proyecto SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin_planificada DATE,
    presupuesto_total NUMERIC(15,2) NOT NULL CHECK (presupuesto_total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADO'
        CHECK (estado IN ('PLANIFICADO','EN_PROGRESO','PAUSADO','COMPLETADO','CANCELADO')),
    id_empresa INT NOT NULL REFERENCES EMPRESA(id_empresa) ON DELETE RESTRICT,
    id_encargado INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

CREATE TABLE TAREA (
    id_tarea SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_vencimiento DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estado IN ('PENDIENTE','EN_PROGRESO','COMPLETADA','CANCELADA')),
    prioridad VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
        CHECK (prioridad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE ASIGNACION (
    id_tarea INT NOT NULL REFERENCES TAREA(id_tarea) ON DELETE CASCADE,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarea, id_usuario)
);

CREATE TABLE EVIDENCIA (
    id_evidencia SERIAL PRIMARY KEY,
    descripcion TEXT,
    url_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(20) NOT NULL
        CHECK (tipo_archivo IN ('IMAGEN','VIDEO','DOCUMENTO','OTRO')),
    timestamp_captura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    id_tarea INT NOT NULL REFERENCES TAREA(id_tarea) ON DELETE CASCADE,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

CREATE TABLE PRESUPUESTO_ACTIVIDAD (
    id_actividad SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    monto_planificado NUMERIC(15,2) NOT NULL CHECK (monto_planificado >= 0),
    monto_real NUMERIC(15,2) CHECK (monto_real >= 0),
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE REPORTE (
    id_reporte SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('AVANCE','PRESUPUESTO','INCIDENTE','CONSOLIDADO')),
    contenido_url VARCHAR(500),
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE CASCADE,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT
);

CREATE TABLE CATEGORIA (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE PRODUCTO (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio_venta NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
    precio_costo NUMERIC(12,2) NOT NULL CHECK (precio_costo >= 0),
    costo_promedio_ponderado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_promedio_ponderado >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    id_categoria INT REFERENCES CATEGORIA(id_categoria) ON DELETE SET NULL,
    id_empresa INT NOT NULL REFERENCES EMPRESA(id_empresa) ON DELETE RESTRICT
);

CREATE TABLE PROVEEDOR (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    contacto_nombre VARCHAR(150),
    telefono VARCHAR(20),
    email VARCHAR(150),
    id_empresa INT NOT NULL REFERENCES EMPRESA(id_empresa) ON DELETE RESTRICT
);

CREATE TABLE PRODUCTO_PROVEEDOR (
    id_producto INT NOT NULL REFERENCES PRODUCTO(id_producto) ON DELETE CASCADE,
    id_proveedor INT NOT NULL REFERENCES PROVEEDOR(id_proveedor) ON DELETE CASCADE,
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    fecha_ultima_cotizacion DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_producto, id_proveedor)
);

CREATE TABLE MOVIMIENTO_INVENTARIO (
    id_movimiento SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio_unitario >= 0),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    id_producto INT NOT NULL REFERENCES PRODUCTO(id_producto) ON DELETE RESTRICT,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT,
    id_proyecto INT NOT NULL REFERENCES PROYECTO(id_proyecto) ON DELETE RESTRICT,
    id_proveedor INT REFERENCES PROVEEDOR(id_proveedor) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION fn_actualizar_costo_promedio()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INT;
    v_costo_actual NUMERIC(12,2);
    v_nuevo_costo  NUMERIC(12,2);
BEGIN
    IF NEW.tipo = 'ENTRADA' AND NEW.precio_unitario > 0 THEN
        SELECT stock_actual, costo_promedio_ponderado
        INTO v_stock_actual, v_costo_actual
        FROM PRODUCTO
        WHERE id_producto = NEW.id_producto;
        IF v_stock_actual + NEW.cantidad > 0 THEN
            v_nuevo_costo := (
                (v_stock_actual * v_costo_actual) + (NEW.cantidad * NEW.precio_unitario)
            ) / (v_stock_actual + NEW.cantidad);
        ELSE
            v_nuevo_costo := NEW.precio_unitario;
        END IF;

        UPDATE PRODUCTO
        SET costo_promedio_ponderado = ROUND(v_nuevo_costo, 2)
        WHERE id_producto = NEW.id_producto;
    END IF;

    IF NEW.tipo = 'ENTRADA' THEN
        UPDATE PRODUCTO
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id_producto = NEW.id_producto;
    ELSIF NEW.tipo = 'SALIDA' THEN
        UPDATE PRODUCTO
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_producto = NEW.id_producto;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimiento_costo_promedio
AFTER INSERT ON MOVIMIENTO_INVENTARIO
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_costo_promedio();

CREATE OR REPLACE VIEW v_comparativa_proveedores AS
SELECT
    p.id_producto,
    p.nombre AS producto,
    p.costo_promedio_ponderado,
    p.precio_venta,
    pv.nombre AS proveedor,
    pp.precio_unitario AS precio_proveedor,
    ROUND(
        ((pp.precio_unitario - p.costo_promedio_ponderado) / NULLIF(p.costo_promedio_ponderado, 0)) * 100,
        2
    ) AS diferencia_porcentual,
    pp.fecha_ultima_cotizacion
FROM PRODUCTO p
JOIN PRODUCTO_PROVEEDOR pp ON p.id_producto = pp.id_producto
JOIN PROVEEDOR pv ON pp.id_proveedor = pv.id_proveedor
ORDER BY p.id_producto, pp.precio_unitario;

CREATE OR REPLACE VIEW v_margen_ganancia AS
SELECT
    p.id_producto,
    p.nombre,
    p.precio_venta,
    p.precio_costo AS costo_lista,
    p.costo_promedio_ponderado,
    p.stock_actual,
    ROUND(p.precio_venta - p.costo_promedio_ponderado, 2) AS ganancia_unitaria,
    CASE
        WHEN p.costo_promedio_ponderado > 0 THEN
            ROUND(((p.precio_venta - p.costo_promedio_ponderado) / p.costo_promedio_ponderado) * 100, 2)
        ELSE NULL
    END AS margen_porcentual,
    ROUND((p.precio_venta - p.costo_promedio_ponderado) * p.stock_actual, 2) AS ganancia_potencial_stock
FROM PRODUCTO p
ORDER BY margen_porcentual DESC NULLS LAST;