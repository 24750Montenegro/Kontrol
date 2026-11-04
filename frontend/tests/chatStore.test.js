import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Socket falso con la superficie que usa el store: on/once/off/emit y un
// `trigger` para simular eventos que llegan del servidor.
function createFakeSocket() {
  const handlers = {}
  const ioHandlers = {}
  const sock = {
    connected: false,
    emitted: [],
    on: vi.fn((event, fn) => { (handlers[event] ??= []).push(fn) }),
    once: vi.fn((event, fn) => {
      const wrapper = (...args) => { sock.off(event, wrapper); fn(...args) }
      wrapper.original = fn
      ;(handlers[event] ??= []).push(wrapper)
    }),
    off: vi.fn((event, fn) => {
      handlers[event] = (handlers[event] ?? []).filter((h) => h !== fn && h.original !== fn)
    }),
    emit: vi.fn((event, payload) => { sock.emitted.push([event, payload]) }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
    io: { on: vi.fn((event, fn) => { (ioHandlers[event] ??= []).push(fn) }) },
    trigger(event, payload) { for (const fn of [...(handlers[event] ?? [])]) fn(payload) },
    triggerIo(event, payload) { for (const fn of ioHandlers[event] ?? []) fn(payload) },
  }
  return sock
}

const sockets = []
const uploadFilesMock = vi.fn()

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    const s = createFakeSocket()
    sockets.push(s)
    return s
  }),
}))

vi.mock('@/services/fileUpload.js', async (importOriginal) => ({
  ...(await importOriginal()),
  uploadFiles: (...args) => uploadFilesMock(...args),
}))

const { useChatStore } = await import('@/stores/chat.js')
const { useAuthStore } = await import('@/stores/auth.js')
const { io } = await import('socket.io-client')

function respond(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

let fetchMock
let auth

beforeEach(() => {
  localStorage.clear()
  sockets.length = 0
  vi.mocked(io).mockClear()
  uploadFilesMock.mockReset()
  setActivePinia(createPinia())
  auth = useAuthStore()
  auth.token = 'jwt'
  auth.user = { id_usuario: 1 }
  fetchMock = vi.fn(() => Promise.resolve(respond({ data: [] })))
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function connected(store) {
  store.connect()
  const sock = sockets.at(-1)
  sock.connected = true
  return sock
}

describe('chat store — conexión', () => {
  it('no conecta sin token', () => {
    auth.token = null
    const store = useChatStore()
    store.connect()
    expect(io).not.toHaveBeenCalled()
    expect(store.socket).toBeNull()
  })

  it('conecta con el token y no reabre un socket ya conectado', () => {
    const store = useChatStore()
    connected(store)
    store.connect()
    expect(io).toHaveBeenCalledOnce()
    expect(vi.mocked(io).mock.calls[0][1]).toMatchObject({ auth: { token: 'jwt' }, withCredentials: true })
  })

  it('reemplaza un socket desconectado limpiando sus listeners', () => {
    const store = useChatStore()
    store.connect()
    const first = sockets[0]
    store.connect()
    expect(first.removeAllListeners).toHaveBeenCalled()
    expect(first.disconnect).toHaveBeenCalled()
    expect(sockets).toHaveLength(2)
  })

  it('al conectar o reconectar marca conectado y recarga conversaciones y mensajes abiertos', async () => {
    const store = useChatStore()
    const sock = connected(store)
    store.messages = { c1: [] }

    sock.trigger('connect')
    await flush()
    expect(store.isConnected).toBe(true)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([expect.stringContaining('/api/chat/conversations'), expect.stringContaining('/api/chat/conversations/c1/messages')])
    )

    fetchMock.mockClear()
    sock.triggerIo('reconnect')
    await flush()
    expect(fetchMock).toHaveBeenCalled()
  })

  it('registra errores de conexión y reconecta si el servidor cortó', () => {
    const store = useChatStore()
    const sock = connected(store)

    sock.trigger('connect_error', { message: 'sin servidor' })
    expect(store.isConnected).toBe(false)
    expect(store.lastError).toBe('sin servidor')
    sock.trigger('connect_error', {})
    expect(store.lastError).toBe('The chat server is unavailable.')

    sock.trigger('disconnect', 'transport close')
    expect(sock.connect).not.toHaveBeenCalled()
    sock.trigger('disconnect', 'io server disconnect')
    expect(sock.connect).toHaveBeenCalledOnce()
  })

  it('refleja chat:error, chat:unavailable y chat:available', async () => {
    const store = useChatStore()
    const sock = connected(store)

    sock.trigger('chat:error', { message: 'boom' })
    expect(store.lastError).toBe('boom')
    sock.trigger('chat:error', {})
    expect(store.lastError).toBe('Chat socket error.')
    sock.trigger('chat:unavailable', {})
    expect(store.lastError).toBe('Chat is unavailable.')
    sock.trigger('chat:unavailable', { message: 'Mongo caído' })
    expect(store.lastError).toBe('Mongo caído')

    sock.trigger('chat:available')
    await flush()
    expect(store.lastError).toBe('')
  })

  it('disconnect limpia todo el estado', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.conversations = [{ _id: '1' }]
    store.messages = { 1: [] }
    store.lastError = 'x'

    store.disconnect()

    expect(sock.disconnect).toHaveBeenCalled()
    expect(store.socket).toBeNull()
    expect(store.isConnected).toBe(false)
    expect(store.conversations).toEqual([])
    expect(store.messages).toEqual({})
    expect(store.lastError).toBe('')
  })
})

describe('chat store — carga por API', () => {
  it('loadConversations normaliza, ordena por actividad y manda el token', async () => {
    fetchMock.mockResolvedValueOnce(respond({
      data: [
        { _id: 'a', updatedAt: '2026-10-01T00:00:00Z' },
        { _id: 'b', lastMessage: { text: 'hola', createdAt: '2026-10-05T00:00:00Z' } },
        { _id: 'c' },
      ],
    }))
    const store = useChatStore()

    await store.loadConversations()

    expect(store.conversations.map((c) => c._id)).toEqual(['b', 'a', 'c'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/chat\/conversations$/)
    expect(init.headers).toEqual({ Authorization: 'Bearer jwt' })
  })

  it('loadConversations tolera data ausente y registra errores del servidor', async () => {
    const store = useChatStore()
    fetchMock.mockResolvedValueOnce(respond({}))
    await store.loadConversations()
    expect(store.conversations).toEqual([])

    fetchMock.mockResolvedValueOnce(respond({ message: 'Sin acceso' }, 403))
    expect(await store.loadConversations()).toEqual({ success: false, message: 'Sin acceso' })
    expect(store.lastError).toBe('Sin acceso')

    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.reject(new Error('x')) })
    await store.loadConversations()
    expect(store.lastError).toBe('Invalid server response.')

    fetchMock.mockResolvedValueOnce(respond({}, 500))
    await store.loadConversations()
    expect(store.lastError).toBe('Chat request failed.')
  })

  it('sin token no manda Authorization', async () => {
    auth.token = null
    await useChatStore().loadCompanyUsers()
    expect(fetchMock.mock.calls[0][1].headers).toEqual({})
  })

  it('loadMessages fusiona sin duplicados, en orden, y antepone las páginas anteriores', async () => {
    const store = useChatStore()
    fetchMock.mockResolvedValueOnce(respond({
      data: [
        { _id: 'm2', conversationId: 'c', createdAt: '2026-10-02T00:00:00Z' },
        { _id: 'm3', conversationId: 'c', createdAt: '2026-10-03T00:00:00Z' },
      ],
    }))
    await store.loadMessages('c')

    fetchMock.mockResolvedValueOnce(respond({
      data: [
        { _id: 'm1', conversationId: 'c', createdAt: '2026-10-01T00:00:00Z' },
        { _id: 'm2', conversationId: 'c', createdAt: '2026-10-02T00:00:00Z' },
        { conversationId: 'c' },
      ],
    }))
    await store.loadMessages('c', '2026-10-02T00:00:00Z')

    expect(store.messages.c.map((m) => m._id)).toEqual(['m1', 'm2', 'm3'])
    expect(fetchMock.mock.calls[1][0]).toContain('/conversations/c/messages?before=2026-10-02T00%3A00%3A00Z')
  })

  it('loadMessages registra errores y tolera data ausente', async () => {
    const store = useChatStore()
    fetchMock.mockResolvedValueOnce(respond({}))
    await store.loadMessages('c')
    expect(store.messages.c).toEqual([])

    fetchMock.mockResolvedValueOnce(respond({ message: 'No existe' }, 404))
    expect(await store.loadMessages('c')).toEqual({ success: false, message: 'No existe' })
  })

  it('loadCompanyUsers guarda la lista o registra el error', async () => {
    const store = useChatStore()
    fetchMock.mockResolvedValueOnce(respond({ data: [{ id_usuario: 2 }] }))
    await store.loadCompanyUsers()
    expect(store.companyUsers).toEqual([{ id_usuario: 2 }])

    fetchMock.mockResolvedValueOnce(respond({ data: 'x' }))
    await store.loadCompanyUsers()
    expect(store.companyUsers).toEqual([])

    fetchMock
      .mockResolvedValueOnce(respond({ message: 'caído' }, 503))
      .mockResolvedValueOnce(respond({ message: 'caído' }, 503))
    expect(await store.loadCompanyUsers()).toEqual({ success: false, message: 'caído' })
  })
})

describe('chat store — eventos de mensajes', () => {
  it('un mensaje ajeno actualiza el último mensaje, suma no leídos y reordena', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.conversations = [
      { _id: 'a', unread: 0, updatedAt: '2026-10-05T00:00:00Z' },
      { _id: 'b', unread: 2, updatedAt: '2026-10-01T00:00:00Z' },
    ]

    sock.trigger('chat:message', {
      _id: 'm1', conversationId: 'b', senderId: 2, text: '',
      attachments: [{ url: 'https://x', type: 'image' }],
      createdAt: '2026-10-10T00:00:00Z',
    })

    expect(store.conversations.map((c) => c._id)).toEqual(['b', 'a'])
    expect(store.conversations[0]).toMatchObject({
      unread: 3,
      lastMessage: { text: '[Imagen]', senderId: 2, type: 'image' },
    })
    expect(store.messages.b).toHaveLength(1)
    expect(store.totalUnread).toBe(3)
  })

  it('un mensaje propio no suma no leídos', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.conversations = [{ _id: 'a', unread: 0 }]
    sock.trigger('chat:message', { _id: 'm', conversationId: 'a', senderId: 1, text: 'yo' })
    expect(store.conversations[0].unread).toBe(0)
    expect(store.conversations[0].lastMessage).toMatchObject({ text: 'yo', type: 'text' })
  })

  it('un mensaje de una conversación desconocida recarga la lista; uno inválido se ignora', async () => {
    const store = useChatStore()
    const sock = connected(store)

    sock.trigger('chat:message', { _id: 'm', conversationId: 'nueva', senderId: 2 })
    await flush()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/conversations$/), expect.anything())

    fetchMock.mockClear()
    sock.trigger('chat:message', { text: 'sin ids' })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(store.messages).toEqual({ nueva: expect.any(Array) })
  })

  it('conversation_ready y conversation_updated insertan o actualizan sin duplicar', () => {
    const store = useChatStore()
    const sock = connected(store)

    sock.trigger('chat:conversation_ready', { conversation: { _id: 'x', name: 'Ana' } })
    sock.trigger('chat:conversation_updated', { conversation: { _id: 'x', name: 'Ana María' } })
    sock.trigger('chat:conversation_updated', { conversation: null })

    expect(store.conversations).toHaveLength(1)
    expect(store.conversations[0].name).toBe('Ana María')
  })

  it('lleva el registro de quién está escribiendo', () => {
    const store = useChatStore()
    const sock = connected(store)

    sock.trigger('chat:typing', { userId: 2, conversationId: 'c' })
    sock.trigger('chat:typing', { userId: 3, conversationId: 'c' })
    expect([...store.typingUsers.c]).toEqual([2, 3])

    sock.trigger('chat:stop_typing', { userId: 2, conversationId: 'c' })
    sock.trigger('chat:stop_typing', { userId: 9, conversationId: 'otra' })
    expect([...store.typingUsers.c]).toEqual([3])
  })

  it('read_update marca como leídos solo mis mensajes que aún no lo estaban', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.messages = {
      c: [
        { _id: '1', senderId: 1, readBy: [] },
        { _id: '2', senderId: 1, readBy: [5] },
        { _id: '3', senderId: 5, readBy: [] },
      ],
    }

    sock.trigger('chat:read_update', { conversationId: 'c', userId: 5 })
    sock.trigger('chat:read_update', { conversationId: 'vacía', userId: 5 })

    expect(store.messages.c.map((m) => m.readBy)).toEqual([[5], [5], []])
    expect(store.messages.vacía).toBeUndefined()
  })
})

describe('chat store — acciones del usuario', () => {
  it('sendMessage sin conexión intenta conectar y avisa', () => {
    const store = useChatStore()
    expect(store.sendMessage({ conversationId: 'c', text: 'hola' })).toBe(false)
    expect(io).toHaveBeenCalledOnce()
    expect(store.lastError).toBe('The chat server is unavailable.')
  })

  it('sendMessage recorta el texto, filtra adjuntos inválidos y no manda mensajes vacíos', () => {
    const store = useChatStore()
    const sock = connected(store)

    expect(store.sendMessage({ conversationId: 'c', text: '   ', attachments: [{ url: '' }] })).toBe(false)
    expect(store.sendMessage({ conversationId: 'c', text: 5 })).toBe(false)
    expect(store.sendMessage({ conversationId: 'c', text: ' hola ', attachments: [{ url: 'https://a' }, null] })).toBe(true)

    expect(sock.emitted).toHaveLength(1)
    const [event, payload] = sock.emitted[0]
    expect(event).toBe('chat:send')
    expect(payload.text).toBe('hola')
    expect(payload.attachments).toHaveLength(1)
  })

  it('emitTyping y emitStopTyping solo emiten con conversación', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.emitTyping('')
    store.emitStopTyping(null)
    store.emitTyping('c')
    store.emitStopTyping('c')
    expect(sock.emitted).toEqual([
      ['chat:typing', { conversationId: 'c' }],
      ['chat:stop_typing', { conversationId: 'c' }],
    ])
  })

  it('markRead emite, pone en cero los no leídos y me añade a readBy', () => {
    const store = useChatStore()
    const sock = connected(store)
    store.conversations = [{ _id: 'c', unread: 4 }]
    store.messages = { c: [{ _id: '1', readBy: [] }, { _id: '2', readBy: [1] }, { _id: '3' }] }

    store.markRead('')
    store.markRead('c')

    expect(sock.emitted).toEqual([['chat:mark_read', { conversationId: 'c' }]])
    expect(store.conversations[0].unread).toBe(0)
    expect(store.messages.c.map((m) => m.readBy)).toEqual([[1], [1], [1]])
  })

  it('markRead no reemplaza los mensajes si ya estaban todos leídos', () => {
    // El chat flotante vigila los mensajes y llama a markRead: un array nuevo
    // en cada llamada volvía a disparar el watcher, en bucle.
    const store = useChatStore()
    connected(store)
    store.messages = { c: [{ _id: '1', readBy: [1] }] }
    const antes = store.messages.c
    store.markRead('c')
    expect(store.messages.c).toBe(antes)
  })

  it('markRead sin usuario no toca los mensajes', () => {
    auth.user = null
    const store = useChatStore()
    connected(store)
    store.messages = { c: [{ _id: '1', readBy: [] }] }
    store.markRead('c')
    expect(store.messages.c[0].readBy).toEqual([])
  })

  it('uploadFiles valida archivos y conexión antes de subir', async () => {
    const store = useChatStore()
    expect(await store.uploadFiles([])).toEqual({ success: false, message: 'No files selected.' })
    expect(await store.uploadFiles(null)).toEqual({ success: false, message: 'No files selected.' })
    expect(await store.uploadFiles([new Blob(['x'])])).toEqual({ success: false, message: 'The chat server is unavailable.' })
    expect(uploadFilesMock).not.toHaveBeenCalled()
  })

  it('uploadFiles normaliza lo que devuelve Cloudinary y reporta fallos', async () => {
    const store = useChatStore()
    connected(store)

    uploadFilesMock.mockResolvedValueOnce([
      { url: 'https://cdn/a.png', kind: 'image', filename: 'a.png', resourceType: 'image', publicId: 'kontrol/chat/a', bytes: 5 },
      null,
    ])
    const ok = await store.uploadFiles([new Blob(['x'])])
    expect(ok.success).toBe(true)
    expect(ok.data).toHaveLength(1)
    expect(ok.data[0]).toMatchObject({ type: 'image', url: 'https://cdn/a.png', publicId: 'image:kontrol/chat/a', size: 5 })
    expect(uploadFilesMock.mock.calls[0][1]).toEqual({ purpose: 'chat', token: 'jwt' })

    uploadFilesMock.mockResolvedValueOnce([{}])
    expect(await store.uploadFiles([new Blob(['x'])])).toEqual({ success: false, message: 'No attachment data was returned.' })

    uploadFilesMock.mockRejectedValueOnce(new Error('límite excedido'))
    expect(await store.uploadFiles([new Blob(['x'])])).toEqual({ success: false, message: 'límite excedido' })
    expect(store.lastError).toBe('límite excedido')

    uploadFilesMock.mockRejectedValueOnce({})
    expect((await store.uploadFiles([new Blob(['x'])])).message).toBe('Upload failed.')
  })

  it('uploadFile sube un solo archivo y propaga el fallo', async () => {
    const store = useChatStore()
    expect(await store.uploadFile(null)).toEqual({ success: false, message: 'No files selected.' })

    connected(store)
    uploadFilesMock.mockResolvedValueOnce([{ url: 'https://cdn/b' }])
    const res = await store.uploadFile(new Blob(['x']))
    expect(res.success).toBe(true)
    expect(res.data.url).toBe('https://cdn/b')
  })
})

describe('chat store — startDM', () => {
  it('reutiliza una conversación existente con ese usuario', async () => {
    const store = useChatStore()
    store.conversations = [{ _id: 'c', otherUserId: 7 }]
    expect(await store.startDM(7)).toEqual({ _id: 'c', otherUserId: 7 })
    expect(io).not.toHaveBeenCalled()
  })

  it('pide la conversación por socket y resuelve con la del usuario pedido', async () => {
    const store = useChatStore()
    const sock = connected(store)

    const pending = store.startDM(7)
    await flush()
    expect(sock.emitted).toEqual([['chat:start_dm', { targetUserId: 7 }]])

    sock.trigger('chat:conversation_ready', { conversation: { _id: 'otra', otherUserId: 8 } })
    sock.trigger('chat:conversation_ready', { conversation: { _id: 'nueva', otherUserId: 7 } })

    expect(await pending).toMatchObject({ _id: 'nueva', otherUserId: 7 })
  })

  it('rechaza con el error del servidor', async () => {
    const store = useChatStore()
    const sock = connected(store)

    const pending = store.startDM(7)
    await flush()
    sock.trigger('chat:error', { message: 'Usuario no encontrado' })
    await expect(pending).rejects.toThrow('Usuario no encontrado')
  })

  it('rechaza si el socket no llega a conectar', async () => {
    vi.useFakeTimers()
    const store = useChatStore()

    const pending = store.startDM(7)
    const assertion = expect(pending).rejects.toThrow('The chat server is unavailable.')
    await vi.advanceTimersByTimeAsync(10000)
    await vi.advanceTimersByTimeAsync(10000)
    await assertion
  })

  it('espera la conexión y continúa cuando llega', async () => {
    const store = useChatStore()
    const pending = store.startDM(7)
    const sock = sockets.at(-1)
    sock.connected = true
    sock.trigger('connect')
    await flush()
    expect(sock.emitted).toContainEqual(['chat:start_dm', { targetUserId: 7 }])
    sock.trigger('chat:conversation_ready', { conversation: { _id: 'n', otherUserId: 7 } })
    expect((await pending)._id).toBe('n')
  })

  it('reintenta si el primer intento de conexión falla', async () => {
    const store = useChatStore()
    const pending = store.startDM(7)
    sockets.at(-1).trigger('connect_error', { message: 'x' })
    await flush()

    const second = sockets.at(-1)
    second.connected = true
    second.trigger('connect')
    await flush()
    second.trigger('chat:conversation_ready', { conversation: { _id: 'r', otherUserId: 7 } })
    expect((await pending)._id).toBe('r')
  })
})
