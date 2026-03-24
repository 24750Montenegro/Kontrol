package handlers

import "github.com/gin-gonic/gin"

func RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		v1.GET("/health", HealthCheck)
	}

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service": "proyecto-backend",
			"version": "1.0.0",
			"docs":    "/api/v1/health",
		})
	})

	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{
			"error":   "not_found",
			"message": "La ruta solicitada no existe",
		})
	})
}
