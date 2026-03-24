package main

import (
	"log"
	"os"

	"proyecto-backend/internal/config"
	"proyecto-backend/internal/handlers"
	"proyecto-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno desde .env (ignorar error si no existe,
	// ya que en Docker se pasan como variables de entorno del contenedor)
	_ = godotenv.Load()

	// Cargar configuración
	cfg := config.Load()

	// Configurar modo de Gin
	gin.SetMode(cfg.GinMode)

	// Crear router
	router := gin.New()

	// Middlewares globales
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Registrar rutas
	handlers.RegisterRoutes(router)

	// Iniciar servidor
	addr := ":" + cfg.Port
	log.Printf("🚀 Servidor iniciado en http://localhost%s", addr)
	log.Printf("📋 Health check: http://localhost%s/api/v1/health", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
		os.Exit(1)
	}
}
