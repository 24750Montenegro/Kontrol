<script setup>
import { ref, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const status = ref('checking')   
const data = ref(null)
const errorMsg = ref('')

async function checkHealth() {
  status.value = 'checking'
  errorMsg.value = ''

  try {
    const res = await fetch(`${API_URL}/api/v1/health`)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    data.value = await res.json()
    status.value = 'ok'
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message
    data.value = null
  }
}

onMounted(checkHealth)
</script>

<template>
  <div class="health-card" :class="status">
    <div class="health-header">
      <span class="indicator" />
      <h2>Estado del Backend</h2>
      <button class="refresh-btn" @click="checkHealth" title="Verificar de nuevo">
        ↻
      </button>
    </div>

    <!-- Cargando -->
    <p v-if="status === 'checking'" class="msg">
      Conectando con el servidor…
    </p>

    <!-- OK -->
    <div v-else-if="status === 'ok'" class="details">
      <p class="msg success">✓ Servidor en línea</p>
      <ul>
        <li><strong>Servicio:</strong> {{ data.service }}</li>
        <li><strong>Uptime:</strong> {{ data.uptime }}</li>
        <li><strong>Go:</strong> {{ data.go_version }}</li>
        <li><strong>Timestamp:</strong> {{ data.timestamp }}</li>
      </ul>
    </div>

    <!-- Error -->
    <div v-else class="details">
      <p class="msg error">✗ No se pudo conectar</p>
      <p class="error-detail">{{ errorMsg }}</p>
      <p class="hint">
        Asegúrate de que el backend esté corriendo en
        <code>{{ API_URL }}</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
.health-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #adb5bd;
  transition: border-color 0.3s;
}

.health-card.ok {
  border-left-color: #28a745;
}

.health-card.error {
  border-left-color: #dc3545;
}

.health-card.checking {
  border-left-color: #ffc107;
}

.health-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.health-header h2 {
  font-size: 1.1rem;
  flex: 1;
  color: #394d54;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #adb5bd;
}

.ok .indicator {
  background: #28a745;
}
.error .indicator {
  background: #dc3545;
}
.checking .indicator {
  background: #ffc107;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.refresh-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  color: #6c757d;
  transition: color 0.2s, border-color 0.2s;
}

.refresh-btn:hover {
  color: #2496ed;
  border-color: #2496ed;
}

.msg {
  font-size: 0.95rem;
  color: #6c757d;
}

.msg.success {
  color: #28a745;
  font-weight: 600;
}

.msg.error {
  color: #dc3545;
  font-weight: 600;
}

.details ul {
  list-style: none;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.details li {
  font-size: 0.85rem;
  color: #495057;
}

.error-detail {
  font-size: 0.85rem;
  color: #dc3545;
  margin-top: 0.25rem;
  font-family: monospace;
}

.hint {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.hint code {
  background: #f1f3f5;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
