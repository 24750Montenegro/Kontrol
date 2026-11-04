<template>
  <BaseModal v-model="show" max-width="480px">
    <template #header-prefix>
      <span class="priority-bar" :style="{ background: taskPriorityColor(task?.prioridad), minHeight: '24px' }"></span>
    </template>
    <template #header-title>
      <span class="modal-title">{{ task?.nombre ?? '…' }}</span>
    </template>

    <div v-if="loading" class="detail-loading">{{ $t('projects.tasks.detail.loading') }}</div>

    <div v-else-if="task" class="modal-form">
      <div class="form-field">
        <label>{{ $t('projects.tasks.detail.description') }}</label>
        <p>{{ task.descripcion || '—' }}</p>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>{{ $t('projects.tasks.detail.priority') }}</label>
          <p>{{ task.prioridad }}</p>
        </div>
        <div class="form-field" style="align-items: flex-start;">
          <label>{{ $t('projects.tasks.detail.status') }}</label>
          <span class="status-badge small" :style="taskStatusStyle(task.estado)" style="width: fit-content;">
            {{ statusLabel(task.estado) }}
          </span>
        </div>
      </div>
      <div class="form-field">
        <label>{{ $t('projects.tasks.detail.dueDate') }}</label>
        <p>{{ task.fecha_vencimiento?.substring(0, 10) || '—' }}</p>
      </div>
      <div class="form-field">
        <label>{{ $t('projects.tasks.detail.assignedTo') }}</label>
        <p>{{ task.asignado_nombre ? `${task.asignado_nombre} ${task.asignado_apellido}` : '—' }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('projects.tasks.detail.evidence.title') }}</label>

        <ul v-if="evidence.length" class="evidence-list">
          <li v-for="item in evidence" :key="item.id_evidencia" class="evidence-item">
            <a :href="item.url_archivo" target="_blank" rel="noopener">{{ item.descripcion || item.tipo_archivo }}</a>
            <span class="evidence-meta">{{ $t('projects.tasks.detail.evidence.by') }} {{ item.autor_nombre }}</span>
            <button type="button" class="evidence-delete" @click="removeEvidence(item.id_evidencia)">
              {{ $t('projects.tasks.detail.evidence.delete') }}
            </button>
          </li>
        </ul>
        <p v-else class="evidence-empty">{{ $t('projects.tasks.detail.evidence.empty') }}</p>

        <label class="evidence-upload-btn">
          {{ uploading ? $t('projects.tasks.detail.evidence.uploading') : $t('projects.tasks.detail.evidence.uploadLabel') }}
          <input type="file" hidden :disabled="uploading" @change="handleFileSelected" />
        </label>
        <p v-if="uploadError" class="evidence-error">{{ uploadError }}</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { apiFetch as requestApi, authHeaders } from '@/services/api.js'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toEvidencePayload, uploadFiles } from '@/services/fileUpload.js'
import BaseModal from '@/components/UI/Modal/BaseModal.vue'
import { statusLabel } from '@/utils/statusHelpers.js'
import { taskStatusStyle, taskPriorityColor } from '@/utils/taskIndicatorColors.js'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  task:       { type: Object, default: null },
  projectId:  { type: [String, Number], default: null },
  loading:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const evidence = ref([])
const uploading = ref(false)
const uploadError = ref('')

async function loadEvidence() {
  if (!props.projectId || !props.task?.id_tarea) {
    evidence.value = []
    return
  }
  const res = await requestApi(
    `/api/projects/${props.projectId}/tasks/${props.task.id_tarea}/evidence`,
    { headers: authHeaders() }
  )
  if (!res.ok) {
    evidence.value = []
    return
  }
  const body = await res.json()
  evidence.value = body.data ?? []
}

watch(() => [props.modelValue, props.task?.id_tarea], ([open]) => {
  uploadError.value = ''
  if (open) loadEvidence()
}, { immediate: true })

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !props.task?.id_tarea) return

  uploading.value = true
  uploadError.value = ''

  try {
    const [uploaded] = await uploadFiles([file], { purpose: 'evidence' })
    const res = await requestApi(
      `/api/projects/${props.projectId}/tasks/${props.task.id_tarea}/evidence`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(toEvidencePayload(uploaded)) }
    )
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.message || t('projects.tasks.detail.evidence.uploadError'))
    }
    await loadEvidence()
  } catch (error) {
    uploadError.value = error?.message || t('projects.tasks.detail.evidence.uploadError')
  } finally {
    uploading.value = false
  }
}

async function removeEvidence(id) {
  if (!props.projectId || !props.task?.id_tarea) return
  await requestApi(
    `/api/projects/${props.projectId}/tasks/${props.task.id_tarea}/evidence/${id}`,
    { method: 'DELETE', headers: authHeaders() }
  )
  await loadEvidence()
}
</script>

<style scoped>
.priority-bar { width: 3px; flex-shrink: 0; }
.modal-title  { font-family: var(--k-font-display); font-size: var(--k-font-size-heading-2); color: var(--k-color-text); flex: 1; }
.detail-loading { padding: 24px; text-align: center; color: var(--k-gray-4); font-family: var(--k-font-sans); font-size: var(--k-font-size-body-small); }

.modal-form  { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-field  { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: var(--k-font-size-caption); color: var(--k-gray-5); letter-spacing: 0.05em; font-family: var(--k-font-sans); }
.form-field p { font-size: var(--k-font-size-body-small); color: var(--k-color-text); font-family: var(--k-font-sans); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.status-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border: 1px solid;
  font-size: var(--k-font-size-caption); font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  font-family: var(--k-font-sans);
}
.status-badge.small { font-size: var(--k-font-size-caption); padding: 2px 8px; }

.evidence-list { display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0; margin: 0; }
.evidence-item {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--k-font-size-body-small); font-family: var(--k-font-sans);
}
.evidence-item a { color: var(--k-color-text); text-decoration: underline; }
.evidence-meta { color: var(--k-gray-5); font-size: var(--k-font-size-caption); }
.evidence-delete {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: var(--k-gray-5); font-size: var(--k-font-size-caption); text-decoration: underline;
}
.evidence-empty { color: var(--k-gray-5); font-size: var(--k-font-size-body-small); font-family: var(--k-font-sans); }
.evidence-upload-btn {
  display: inline-flex; width: fit-content; cursor: pointer;
  padding: 6px 12px; border: 1px solid var(--k-gray-3);
  font-size: var(--k-font-size-caption); font-family: var(--k-font-sans);
}
.evidence-error { color: var(--k-hue-rose); font-size: var(--k-font-size-caption); font-family: var(--k-font-sans); }
</style>
