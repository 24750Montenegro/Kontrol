import { apiFetch as requestApi, getApiBaseUrl } from '@/services/api.js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { io } from 'socket.io-client'
import { toChatAttachment, uploadFiles as uploadToStorage } from '@/services/fileUpload.js'
import { useAuthStore } from './auth.js'
import {
  getMessagePreview,
  normalizeAttachment,
  normalizeConversation,
  normalizeMessage,
} from '../utils/chat.js'
import { logger } from '../utils/logger.js'

function resolveSocketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL
  return explicit || getApiBaseUrl()
}

const SOCKET_URL = resolveSocketUrl()

function resolveRtcConfiguration() {
  const fallbackIceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
  const rawIceServers = import.meta.env.VITE_WEBRTC_ICE_SERVERS

  if (!rawIceServers) {
    return { iceServers: fallbackIceServers }
  }

  try {
    const parsedIceServers = JSON.parse(rawIceServers)
    return {
      iceServers: Array.isArray(parsedIceServers) && parsedIceServers.length
        ? parsedIceServers
        : fallbackIceServers,
    }
  } catch (error) {
    logger.warn('Invalid VITE_WEBRTC_ICE_SERVERS configuration. Falling back to STUN only.', error)
    return { iceServers: fallbackIceServers }
  }
}

const RTC_CONFIGURATION = resolveRtcConfiguration()
const CALL_ENDED_CLEANUP_DELAY_MS = 2200

function sortConversations(list) {
  return [...list].sort((left, right) => {
    const leftDate = left.lastMessage?.createdAt ?? left.updatedAt ?? ''
    const rightDate = right.lastMessage?.createdAt ?? right.updatedAt ?? ''
    const leftTime = leftDate ? new Date(leftDate).getTime() : 0
    const rightTime = rightDate ? new Date(rightDate).getTime() : 0
    return rightTime - leftTime
  })
}

function uniqueMessages(list) {
  const seen = new Set()
  return [...list]
    .filter((message) => {
      if (!message._id || seen.has(message._id)) return false
      seen.add(message._id)
      return true
    })
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return leftTime - rightTime
    })
}

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  const socket = ref(null)
  const isConnected = ref(false)
  const conversations = ref([])
  const messages = ref({})
  const typingUsers = ref({})
  const companyUsers = ref([])
  const lastError = ref('')
  const incomingCall = ref(null)
  const activeCall = ref(null)
  const localStream = ref(null)
  const remoteStream = ref(null)
  const callError = ref('')
  const isMicrophoneEnabled = ref(true)
  const isCameraEnabled = ref(true)

  const totalUnread = computed(() =>
    conversations.value.reduce((sum, conversation) => sum + (conversation.unread || 0), 0)
  )

  let peerConnection = null
  let pendingIceCandidates = []
  let callCleanupTimer = null

  function clearLastError() {
    lastError.value = ''
  }

  function clearCallCleanupTimer() {
    if (callCleanupTimer) {
      window.clearTimeout(callCleanupTimer)
      callCleanupTimer = null
    }
  }

  function clearCallError() {
    callError.value = ''
  }

  function currentChatUnavailableMessage() {
    return lastError.value || 'The chat server is unavailable.'
  }

  function stopMediaStream(stream) {
    stream?.getTracks?.().forEach((track) => track.stop())
  }

  function syncLocalTrackState() {
    const audioTrack = localStream.value?.getAudioTracks?.()[0] ?? null
    const videoTrack = localStream.value?.getVideoTracks?.()[0] ?? null
    isMicrophoneEnabled.value = audioTrack ? audioTrack.enabled : true
    isCameraEnabled.value = videoTrack ? videoTrack.enabled : true
  }

  function getConversationById(conversationId) {
    const normalizedId = String(conversationId ?? '')
    return conversations.value.find((conversation) => conversation._id === normalizedId) ?? null
  }

  function buildPeerMeta(input) {
    if (!input) {
      return {
        peerUserId: null,
        peerName: 'Usuario',
        peerAvatar: '??',
        peerEmail: '',
      }
    }

    if (typeof input === 'object' && '_id' in input) {
      return {
        peerUserId: input.otherUserId ?? null,
        peerName: input.name ?? 'Usuario',
        peerAvatar: input.avatar ?? '??',
        peerEmail: input.email ?? '',
      }
    }

    return {
      peerUserId: input.peerUserId ?? null,
      peerName: input.peerName ?? input.fromName ?? 'Usuario',
      peerAvatar: input.peerAvatar ?? input.fromAvatar ?? '??',
      peerEmail: input.peerEmail ?? '',
    }
  }

  function mapMediaError(error) {
    if (error?.code === 'INSECURE_CONTEXT') {
      return 'Las videollamadas requieren HTTPS en el servidor. En localhost si funcionan por excepcion del navegador.'
    }

    if (error?.name === 'NotAllowedError') {
      return 'Permite acceso a la camara y al microfono para usar videollamadas.'
    }

    if (error?.name === 'NotFoundError') {
      return 'No se encontro una camara o microfono disponible.'
    }

    if (error?.name === 'NotReadableError') {
      return 'La camara o el microfono estan siendo usados por otra aplicacion.'
    }

    return error?.message || 'No se pudo acceder a la camara y al microfono.'
  }

  function ensureSocketReady() {
    if (socket.value?.connected) return true
    connect()
    return Boolean(socket.value?.connected)
  }

  function waitForSocketReady(timeoutMs = 5000) {
    if (socket.value?.connected) return Promise.resolve(true)
    connect()
    if (!socket.value) return Promise.resolve(false)

    return new Promise((resolve) => {
      const sock = socket.value
      const timeoutId = window.setTimeout(() => {
        sock?.off('connect', onConnect)
        sock?.off('connect_error', onError)
        resolve(false)
      }, timeoutMs)

      const onConnect = () => {
        window.clearTimeout(timeoutId)
        sock?.off('connect_error', onError)
        resolve(true)
      }

      const onError = () => {
        window.clearTimeout(timeoutId)
        sock?.off('connect', onConnect)
        resolve(false)
      }

      sock.once('connect', onConnect)
      sock.once('connect_error', onError)
    })
  }

  function cleanupCallSession({ keepCallError = false, keepIncomingCall = false } = {}) {
    clearCallCleanupTimer()

    if (peerConnection) {
      peerConnection.onicecandidate = null
      peerConnection.ontrack = null
      peerConnection.onconnectionstatechange = null
      peerConnection.close()
      peerConnection = null
    }

    pendingIceCandidates = []
    stopMediaStream(localStream.value)
    stopMediaStream(remoteStream.value)
    localStream.value = null
    remoteStream.value = null
    activeCall.value = null
    if (!keepIncomingCall) incomingCall.value = null
    if (!keepCallError) clearCallError()
    isMicrophoneEnabled.value = true
    isCameraEnabled.value = true
  }

  function scheduleCallCleanup(message = '') {
    clearCallCleanupTimer()

    if (message) {
      callError.value = message
    }

    if (activeCall.value) {
      activeCall.value = {
        ...activeCall.value,
        status: 'ended',
      }
    }

    callCleanupTimer = window.setTimeout(() => {
      cleanupCallSession()
    }, CALL_ENDED_CLEANUP_DELAY_MS)
  }

  async function ensureLocalStream() {
    if (localStream.value) {
      syncLocalTrackState()
      return localStream.value
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const error = new Error('Video calls require a secure context.')
      error.code = 'INSECURE_CONTEXT'
      throw error
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support camera access.')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    localStream.value = stream
    remoteStream.value = new MediaStream()
    syncLocalTrackState()
    return stream
  }

  async function flushPendingIceCandidates() {
    if (!peerConnection?.remoteDescription || !pendingIceCandidates.length) return

    const queuedCandidates = [...pendingIceCandidates]
    pendingIceCandidates = []

    for (const candidate of queuedCandidates) {
      try {
        await peerConnection.addIceCandidate(candidate ? new RTCIceCandidate(candidate) : null)
      } catch (error) {
        logger.error('Failed to add queued ICE candidate:', error)
      }
    }
  }

  async function addRemoteIceCandidate(candidate) {
    if (!candidate) return

    if (!peerConnection?.remoteDescription) {
      pendingIceCandidates.push(candidate)
      return
    }

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      logger.error('Failed to add ICE candidate:', error)
    }
  }

  async function ensurePeerConnection(conversationId) {
    if (peerConnection) return peerConnection

    const stream = await ensureLocalStream()
    remoteStream.value = new MediaStream()
    pendingIceCandidates = []

    const connection = new RTCPeerConnection(RTC_CONFIGURATION)

    stream.getTracks().forEach((track) => {
      connection.addTrack(track, stream)
    })

    connection.onicecandidate = (event) => {
      if (!event.candidate || !activeCall.value?.conversationId || !socket.value?.connected) return

      socket.value.emit('call:signal', {
        conversationId: activeCall.value.conversationId,
        candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
      })
    }

    connection.ontrack = (event) => {
      if (!remoteStream.value) {
        remoteStream.value = new MediaStream()
      }

      const streamWithTracks = event.streams?.[0]
      if (streamWithTracks) {
        streamWithTracks.getTracks().forEach((track) => {
          if (!remoteStream.value.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
            remoteStream.value.addTrack(track)
          }
        })
        return
      }

      event.tracks.forEach((track) => {
        if (!remoteStream.value.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
          remoteStream.value.addTrack(track)
        }
      })
    }

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState

      if (state === 'connected') {
        clearCallError()
        if (activeCall.value) {
          activeCall.value = { ...activeCall.value, status: 'connected' }
        }
        return
      }

      if (state === 'failed') {
        scheduleCallCleanup('La videollamada fallo.')
        return
      }

      if (state === 'disconnected') {
        scheduleCallCleanup('La videollamada se desconecto.')
      }
    }

    peerConnection = connection
    return peerConnection
  }

  async function handleIncomingCallSignal({ conversationId, description, candidate }) {
    if (!activeCall.value || activeCall.value.conversationId !== String(conversationId)) return

    try {
      const connection = await ensurePeerConnection(conversationId)

      if (description) {
        if (description.type === 'offer') {
          await connection.setRemoteDescription(description)
          await flushPendingIceCandidates()

          const answer = await connection.createAnswer()
          await connection.setLocalDescription(answer)

          socket.value?.emit('call:signal', {
            conversationId: activeCall.value.conversationId,
            description: connection.localDescription?.toJSON
              ? connection.localDescription.toJSON()
              : connection.localDescription,
          })
        } else if (description.type === 'answer') {
          await connection.setRemoteDescription(description)
          await flushPendingIceCandidates()
        }
      }

      if (candidate) {
        await addRemoteIceCandidate(candidate)
      }
    } catch (error) {
      logger.error('WebRTC signaling error:', error)
      scheduleCallCleanup('No se pudo establecer la videollamada.')
    }
  }

  function handleIncomingCall(payload) {
    clearCallCleanupTimer()

    if (activeCall.value?.status === 'ended') {
      cleanupCallSession()
    }

    if (activeCall.value) {
      socket.value?.emit('call:decline', {
        conversationId: payload.conversationId,
        reason: 'busy',
      })
      return
    }

    clearCallError()
    incomingCall.value = {
      conversationId: String(payload.conversationId),
      ...buildPeerMeta(payload),
      status: 'incoming',
    }
  }

  async function handleAcceptedCall({ conversationId }) {
    if (!activeCall.value || activeCall.value.conversationId !== String(conversationId)) return

    try {
      activeCall.value = {
        ...activeCall.value,
        status: 'connecting',
      }

      const connection = await ensurePeerConnection(conversationId)
      const offer = await connection.createOffer()
      await connection.setLocalDescription(offer)

      socket.value?.emit('call:signal', {
        conversationId: activeCall.value.conversationId,
        description: connection.localDescription?.toJSON
          ? connection.localDescription.toJSON()
          : connection.localDescription,
      })
    } catch (error) {
      logger.error('Failed to create WebRTC offer:', error)
      scheduleCallCleanup('No se pudo iniciar la videollamada.')
    }
  }

  function handleDeclinedCall({ conversationId, reason }) {
    if (!activeCall.value || activeCall.value.conversationId !== String(conversationId)) return

    const message = reason === 'busy'
      ? 'El usuario ya esta en otra videollamada.'
      : 'La videollamada fue rechazada.'

    scheduleCallCleanup(message)
  }

  function handleEndedCall({ conversationId }) {
    const normalizedId = String(conversationId)

    if (incomingCall.value?.conversationId === normalizedId) {
      incomingCall.value = null
      return
    }

    if (activeCall.value?.conversationId === normalizedId) {
      scheduleCallCleanup('La videollamada termino.')
    }
  }

  function handleCallError(payload) {
    if (!payload?.message) return

    callError.value = payload.message

    if (payload.conversationId && activeCall.value?.conversationId === String(payload.conversationId)) {
      scheduleCallCleanup(payload.message)
    }
  }

  function upsertConversation(rawConversation) {
    const conversation = normalizeConversation(rawConversation)
    const index = conversations.value.findIndex((item) => item._id === conversation._id)

    if (index === -1) {
      conversations.value = sortConversations([conversation, ...conversations.value])
      return conversation
    }

    const nextList = [...conversations.value]
    nextList[index] = {
      ...nextList[index],
      ...conversation,
    }
    conversations.value = sortConversations(nextList)
    return nextList[index]
  }

  function mergeMessages(conversationId, incomingMessages, prepend = false) {
    const current = messages.value[conversationId] ?? []
    const merged = prepend
      ? [...incomingMessages, ...current]
      : [...current, ...incomingMessages]

    messages.value = {
      ...messages.value,
      [conversationId]: uniqueMessages(merged),
    }

    return messages.value[conversationId]
  }

  async function apiFetch(path, opts = {}) {
    const response = await requestApi(`/api/chat${path}`, {
      ...opts,
      token: authStore.token,
      headers: opts.headers,
    })

    const payload = await response.json().catch(() => ({
      success: false,
      message: 'Invalid server response.',
    }))

    if (!response.ok) {
      throw new Error(payload.message || 'Chat request failed.')
    }

    return payload
  }

  function handleIncomingConversation(rawConversation) {
    if (!rawConversation) return null
    clearLastError()
    return upsertConversation(rawConversation)
  }

  function handleIncomingMessage(rawMessage) {
    const message = normalizeMessage(rawMessage)
    if (!message._id || !message.conversationId) return null

    clearLastError()

    mergeMessages(message.conversationId, [message])

    const conversation = conversations.value.find((item) => item._id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = {
        text: getMessagePreview(message),
        senderId: message.senderId,
        type: message.attachments[0]?.type ?? 'text',
        createdAt: message.createdAt,
      }

      if (message.senderId !== authStore.user?.id_usuario) {
        conversation.unread = Number(conversation.unread || 0) + 1
      }

      conversations.value = sortConversations(conversations.value)
    } else {
      void loadConversations()
    }

    return message
  }

  function refreshActiveConversationMessages() {
    const ids = Object.keys(messages.value || {})
    ids.forEach((conversationId) => {
      void loadMessages(conversationId)
    })
  }

  function connect() {
    if (!authStore.token) return
    if (socket.value?.connected) return

    if (socket.value) {
      try { socket.value.removeAllListeners() } catch {}
      try { socket.value.disconnect() } catch {}
      socket.value = null
    }

    lastError.value = ''

    socket.value = io(SOCKET_URL, {
      auth: { token: authStore.token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      clearLastError()
      void loadConversations()
      refreshActiveConversationMessages()
    })

    socket.value.io?.on('reconnect', () => {
      isConnected.value = true
      clearLastError()
      void loadConversations()
      refreshActiveConversationMessages()
    })

    socket.value.on('disconnect', (reason) => {
      isConnected.value = false
      if (reason === 'io server disconnect') {
        try { socket.value?.connect() } catch {}
      }
    })

    socket.value.on('connect_error', (error) => {
      isConnected.value = false
      lastError.value = error?.message || 'The chat server is unavailable.'
    })

    socket.value.on('chat:message', (message) => {
      handleIncomingMessage(message)
    })

    socket.value.on('chat:conversation_ready', ({ conversation }) => {
      handleIncomingConversation(conversation)
    })

    socket.value.on('chat:conversation_updated', ({ conversation }) => {
      handleIncomingConversation(conversation)
    })

    socket.value.on('chat:typing', ({ userId, conversationId }) => {
      if (!typingUsers.value[conversationId]) {
        typingUsers.value[conversationId] = new Set()
      }
      typingUsers.value[conversationId].add(userId)
    })

    socket.value.on('chat:stop_typing', ({ userId, conversationId }) => {
      typingUsers.value[conversationId]?.delete(userId)
    })

    socket.value.on('chat:read_update', ({ conversationId, userId }) => {
      clearLastError()

      const currentMessages = messages.value[conversationId] ?? []
      if (!currentMessages.length) return

      messages.value = {
        ...messages.value,
        [conversationId]: currentMessages.map((message) => (
          message.senderId === authStore.user?.id_usuario && !message.readBy.includes(userId)
            ? { ...message, readBy: [...message.readBy, userId] }
            : message
        )),
      }
    })

    socket.value.on('chat:error', ({ message }) => {
      lastError.value = message || 'Chat socket error.'
      logger.error('Socket chat error:', message)
    })

    socket.value.on('chat:unavailable', ({ message }) => {
      lastError.value = message || 'Chat is unavailable.'
    })

    socket.value.on('chat:available', () => {
      clearLastError()
      void loadConversations()
    })

    socket.value.on('call:incoming', (payload) => {
      handleIncomingCall(payload)
    })

    socket.value.on('call:ringing', ({ conversationId }) => {
      if (activeCall.value?.conversationId !== String(conversationId)) return
      clearCallError()
      activeCall.value = {
        ...activeCall.value,
        status: 'ringing',
      }
    })

    socket.value.on('call:accepted', (payload) => {
      void handleAcceptedCall(payload)
    })

    socket.value.on('call:declined', (payload) => {
      handleDeclinedCall(payload)
    })

    socket.value.on('call:ended', (payload) => {
      handleEndedCall(payload)
    })

    socket.value.on('call:signal', (payload) => {
      void handleIncomingCallSignal(payload)
    })

    socket.value.on('call:error', (payload) => {
      handleCallError(payload)
    })
  }

  function disconnect() {
    cleanupCallSession()
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
    conversations.value = []
    messages.value = {}
    typingUsers.value = {}
    companyUsers.value = []
    lastError.value = ''
  }

  async function loadConversations() {
    try {
      const response = await apiFetch('/conversations')
      conversations.value = sortConversations(
        Array.isArray(response.data) ? response.data.map(normalizeConversation) : []
      )
      lastError.value = ''
      return response
    } catch (error) {
      lastError.value = error.message
      return { success: false, message: error.message }
    }
  }

  async function loadMessages(conversationId, before = null) {
    try {
      const query = before ? `?before=${encodeURIComponent(before)}` : ''
      const response = await apiFetch(`/conversations/${conversationId}/messages${query}`)
      const normalized = Array.isArray(response.data)
        ? response.data.map(normalizeMessage)
        : []

      mergeMessages(conversationId, normalized, Boolean(before))
      lastError.value = ''
      return response
    } catch (error) {
      lastError.value = error.message
      return { success: false, message: error.message }
    }
  }

  async function loadCompanyUsers() {
    try {
      const response = await apiFetch('/users')
      companyUsers.value = Array.isArray(response.data) ? response.data : []
      lastError.value = ''
      return response
    } catch (error) {
      lastError.value = error.message
      return { success: false, message: error.message }
    }
  }

  async function startDM(targetUserId) {
    const existing = conversations.value.find((conversation) => conversation.otherUserId === targetUserId)
    if (existing) return existing

    // Esperamos más tiempo por si el socket tarda en reconectarse
    let ready = await waitForSocketReady(10000)
    if (!ready || !socket.value) {
      // Intentamos forzar reconexión rápida
      try { connect() } catch {}
      ready = await waitForSocketReady(10000)
    }

    if (!ready || !socket.value) {
      throw new Error(currentChatUnavailableMessage())
    }

    return new Promise((resolve, reject) => {
      clearLastError()

      const timeoutId = window.setTimeout(() => {
        cleanup()
        reject(new Error(lastError.value || 'The conversation could not be created.'))
      }, 15000)

      const cleanup = () => {
        window.clearTimeout(timeoutId)
        socket.value?.off('chat:conversation_ready', onReady)
        socket.value?.off('chat:error', onError)
      }

      const onReady = ({ conversation }) => {
        const normalized = handleIncomingConversation(conversation)
        if (!normalized || normalized.otherUserId !== targetUserId) return
        cleanup()
        resolve(normalized)
      }

      const onError = ({ message }) => {
        cleanup()
        reject(new Error(message || 'The conversation could not be created.'))
      }

      socket.value.on('chat:conversation_ready', onReady)
      socket.value.on('chat:error', onError)
      socket.value.emit('chat:start_dm', { targetUserId })
    })
  }

  function sendMessage({ conversationId, text = '', attachments = [] }) {
    if (!socket.value?.connected) {
      connect()
      lastError.value = currentChatUnavailableMessage()
      return false
    }

    const normalizedAttachments = attachments
      .map(normalizeAttachment)
      .filter(Boolean)

    const trimmedText = typeof text === 'string' ? text.trim() : ''
    if (!trimmedText && normalizedAttachments.length === 0) return false

    clearLastError()
    socket.value.emit('chat:send', {
      conversationId,
      text: trimmedText,
      attachments: normalizedAttachments,
    })

    return true
  }

  function emitTyping(conversationId) {
    if (!conversationId) return
    socket.value?.emit('chat:typing', { conversationId })
  }

  function emitStopTyping(conversationId) {
    if (!conversationId) return
    socket.value?.emit('chat:stop_typing', { conversationId })
  }

  function markRead(conversationId) {
    if (!conversationId) return

    socket.value?.emit('chat:mark_read', { conversationId })

    const conversation = conversations.value.find((item) => item._id === conversationId)
    if (conversation) {
      conversation.unread = 0
    }
    // También actualizamos localmente los mensajes para reflejar que este usuario
    // ha leído los mensajes (añadiendo su id a `readBy` cuando no esté presente).
    try {
      const myId = authStore.user?.id_usuario
      if (myId) {
        const current = messages.value[conversationId] ?? []
        let changed = false
        const next = current.map((m) => {
          if (Array.isArray(m.readBy) && m.readBy.includes(myId)) return m
          changed = true
          return { ...m, readBy: Array.isArray(m.readBy) ? [...m.readBy, myId] : [myId] }
        })
        // Solo si algo cambió: el chat flotante llama a markRead cada vez que
        // cambian los mensajes, y un array nuevo en cada llamada lo metía en un
        // bucle ("Maximum recursive updates exceeded") al abrir una conversación.
        if (changed) {
          messages.value = {
            ...messages.value,
            [conversationId]: next,
          }
        }
      }
    } catch (err) {
      logger.warn('Failed to locally mark messages read:', err)
    }
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList ?? []).filter(Boolean)
    if (!files.length) {
      return { success: false, message: 'No files selected.' }
    }

    if (!socket.value?.connected) {
      const message = currentChatUnavailableMessage()
      lastError.value = message
      return { success: false, message }
    }

    try {
      const uploaded = await uploadToStorage(files, { purpose: 'chat', token: authStore.token })

      const attachments = uploaded
        .map((item) => normalizeAttachment(toChatAttachment(item)))
        .filter(Boolean)

      if (!attachments.length) {
        return { success: false, message: 'No attachment data was returned.' }
      }

      lastError.value = ''
      return { success: true, data: attachments }
    } catch (error) {
      logger.error('Attachment upload error:', error)
      const message = error?.message || 'Upload failed.'
      lastError.value = message
      return { success: false, message }
    }
  }

  async function uploadFile(file) {
    const response = await uploadFiles(file ? [file] : [])
    if (!response.success) return response

    return {
      success: true,
      data: response.data[0] ?? null,
    }
  }

  async function startVideoCall(conversationInput) {
    const conversation = typeof conversationInput === 'string'
      ? getConversationById(conversationInput)
      : conversationInput

    if (!conversation?._id) {
      return { success: false, message: 'Conversation not found.' }
    }

    let ready = await waitForSocketReady()
    if (!ready) {
      try { connect() } catch {}
      ready = await waitForSocketReady(10000)
    }

    if (!ready) {
      const message = currentChatUnavailableMessage()
      callError.value = message
      return { success: false, message }
    }

    if (activeCall.value?.status === 'ended') {
      cleanupCallSession()
    }

    if (activeCall.value) {
      const message = 'Ya hay una videollamada activa.'
      callError.value = message
      return { success: false, message }
    }

    try {
      clearCallCleanupTimer()
      clearCallError()
      await ensureLocalStream()

      activeCall.value = {
        conversationId: conversation._id,
        ...buildPeerMeta(conversation),
        direction: 'outgoing',
        status: 'ringing',
      }

      socket.value?.emit('call:invite', { conversationId: conversation._id })
      return { success: true }
    } catch (error) {
      cleanupCallSession()
      const message = mapMediaError(error)
      callError.value = message
      return { success: false, message }
    }
  }

  async function acceptIncomingCall() {
    if (!incomingCall.value) {
      return { success: false, message: 'No incoming call.' }
    }

    const ready = await waitForSocketReady()
    if (!ready) {
      const message = currentChatUnavailableMessage()
      callError.value = message
      return { success: false, message }
    }

    try {
      clearCallCleanupTimer()
      clearCallError()
      await ensureLocalStream()

      const call = incomingCall.value
      activeCall.value = {
        conversationId: call.conversationId,
        ...buildPeerMeta(call),
        direction: 'incoming',
        status: 'connecting',
      }

      incomingCall.value = null
      await ensurePeerConnection(call.conversationId)
      socket.value?.emit('call:answer', { conversationId: call.conversationId })

      return { success: true }
    } catch (error) {
      const message = mapMediaError(error)
      callError.value = message
      return { success: false, message }
    }
  }

  function declineIncomingCall(reason = 'declined') {
    if (!incomingCall.value) return

    socket.value?.emit('call:decline', {
      conversationId: incomingCall.value.conversationId,
      reason,
    })

    incomingCall.value = null
    clearCallError()
  }

  function endVideoCall({ notify = true } = {}) {
    if (notify && activeCall.value?.conversationId && socket.value?.connected) {
      socket.value.emit('call:end', { conversationId: activeCall.value.conversationId })
    }

    cleanupCallSession()
  }

  function toggleCallMicrophone() {
    const audioTrack = localStream.value?.getAudioTracks?.()[0]
    if (!audioTrack) return
    audioTrack.enabled = !audioTrack.enabled
    isMicrophoneEnabled.value = audioTrack.enabled
  }

  function toggleCallCamera() {
    const videoTrack = localStream.value?.getVideoTracks?.()[0]
    if (!videoTrack) return
    videoTrack.enabled = !videoTrack.enabled
    isCameraEnabled.value = videoTrack.enabled
  }

  return {
    socket,
    isConnected,
    conversations,
    messages,
    typingUsers,
    companyUsers,
    lastError,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    callError,
    isMicrophoneEnabled,
    isCameraEnabled,
    totalUnread,
    connect,
    disconnect,
    loadConversations,
    loadMessages,
    loadCompanyUsers,
    startDM,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markRead,
    uploadFiles,
    uploadFile,
    startVideoCall,
    acceptIncomingCall,
    declineIncomingCall,
    endVideoCall,
    toggleCallMicrophone,
    toggleCallCamera,
  }
})
