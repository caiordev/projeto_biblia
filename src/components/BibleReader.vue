<script setup>
import { ref, watch, computed, inject, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  book: String,
  chapter: Number,
  verse: Number,
  bibleData: Array
})

const emit = defineEmits(['select-verse', 'change-chapter'])

// Injetar o tema atual do componente pai
const isDarkTheme = inject('isDarkTheme', ref(false))

const loading = ref(false)
const error = ref(null)

// Estado para o recurso de áudio
const isPlaying = ref(false)
const audioProgress = ref(0)
const currentVerse = ref(null)
const availableVoices = ref([])
const selectedVoice = ref(null)
const showVoiceSelector = ref(false)
let speechSynthesis = null
let speechUtterance = null

// Estado para o progresso de leitura
const readingProgress = ref({
  general: 0,  // Progresso geral da Bíblia (0-100%)
  currentBook: 0, // Progresso do livro atual (0-100%)
  readChapters: {}, // Objeto que armazena capítulos lidos por livro
  totalChapters: 0, // Total de capítulos na Bíblia
  totalReadChapters: 0 // Total de capítulos lidos
})

// Encontrar o livro atual nos dados da Bíblia
const currentBookData = computed(() => {
  console.log('BibleReader - props recebidos:', {
    book: props.book,
    chapter: props.chapter,
    bibleData: props.bibleData
  })
  
  if (!props.bibleData || !props.book) return null
  
  // Procurar o livro pelo nome (book) ou pela propriedade name
  const foundBook = props.bibleData.find(book => 
    (book.book === props.book) || (book.name === props.book)
  )
  
  console.log('BibleReader - Livro encontrado:', foundBook)
  return foundBook
})

// Obter os versículos do capítulo atual
const verseContent = computed(() => {
  console.log('Calculando verseContent com:', {
    currentBookData: currentBookData.value,
    chapter: props.chapter
  })
  
  if (!currentBookData.value || !props.chapter || props.chapter < 1) {
    console.log('Retornando array vazio: dados insuficientes')
    return []
  }
  
  console.log('Estrutura do livro:', currentBookData.value)
  
  // Verificar se o livro tem a propriedade chapters
  if (!currentBookData.value.chapters) {
    console.log('Erro: livro não tem capítulos')
    return []
  }
  
  // Verificar se chapters é um array
  if (!Array.isArray(currentBookData.value.chapters)) {
    console.log('Erro: chapters não é um array', currentBookData.value.chapters)
    return []
  }
  
  // Verificar se o capítulo solicitado existe
  if (props.chapter > currentBookData.value.chapters.length) {
    console.log('Erro: capítulo fora do intervalo válido')
    return []
  }
  
  // Obter os versículos do capítulo (ajustando o índice para base 0)
  const chapterVerses = currentBookData.value.chapters[props.chapter - 1]
  console.log('Versículos do capítulo:', chapterVerses)
  
  // Verificar se os versículos são um array
  if (!chapterVerses) {
    console.log('Erro: capítulo não tem versículos')
    return []
  }
  
  if (!Array.isArray(chapterVerses)) {
    console.log('Erro: versículos não são um array')
    return []
  }
  
  // Formatar os versículos para o formato esperado pelo template
  const formattedVerses = chapterVerses.map((text, index) => ({
    number: index + 1,
    text: typeof text === 'string' ? text : JSON.stringify(text)
  }))
  
  console.log('Versículos formatados:', formattedVerses)
  return formattedVerses
})

// Método para rolar para o início do texto do capítulo
const scrollToTop = () => {
  setTimeout(() => {
    // Tentar encontrar o primeiro versículo
    const firstVerse = document.querySelector('.verses-container .verse')
    if (firstVerse) {
      // Rolar para o primeiro versículo
      firstVerse.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Fallback: rolar para o topo do conteúdo
      const readerContent = document.querySelector('.reader-content')
      if (readerContent) {
        readerContent.scrollTop = 0
      }
    }
  }, 100)
}

// Inicializar o sintetizador de voz quando o componente for montado
// Calcular o progresso de leitura
const calculateReadingProgress = () => {
  if (!props.bibleData || !props.book) return
  
  // Carregar dados de progresso do localStorage
  try {
    const savedProgress = localStorage.getItem('readingProgress')
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress)
      readingProgress.value.readChapters = parsed.readChapters || {}
      readingProgress.value.totalReadChapters = parsed.totalReadChapters || 0
    }
  } catch (error) {
    console.error('Erro ao carregar progresso de leitura:', error)
    readingProgress.value.readChapters = {}
    readingProgress.value.totalReadChapters = 0
  }
  
  // Calcular total de capítulos na Bíblia
  let totalChapters = 0
  props.bibleData.forEach(book => {
    if (book.chapters && Array.isArray(book.chapters)) {
      totalChapters += book.chapters.length
    }
  })
  readingProgress.value.totalChapters = totalChapters
  
  // Calcular progresso geral
  if (totalChapters > 0) {
    readingProgress.value.general = Math.round((readingProgress.value.totalReadChapters / totalChapters) * 100)
  }
  
  // Calcular progresso do livro atual
  if (currentBookData.value && currentBookData.value.chapters) {
    const bookName = currentBookData.value.book || currentBookData.value.name
    const totalBookChapters = currentBookData.value.chapters.length
    const bookProgress = readingProgress.value.readChapters[bookName] || {}
    let readBookChapters = 0
    
    // Contar capítulos lidos no livro atual
    for (let i = 1; i <= totalBookChapters; i++) {
      if (bookProgress[i]) {
        readBookChapters++
      }
    }
    
    // Calcular porcentagem de progresso do livro atual
    if (totalBookChapters > 0) {
      readingProgress.value.currentBook = Math.round((readBookChapters / totalBookChapters) * 100)
    }
  }
}

// Marcar capítulo como lido
const markChapterAsRead = () => {
  if (!currentBookData.value || !props.chapter) return
  
  const bookName = currentBookData.value.book || currentBookData.value.name
  
  // Inicializar objeto de progresso para o livro se não existir
  if (!readingProgress.value.readChapters[bookName]) {
    readingProgress.value.readChapters[bookName] = {}
  }
  
  // Verificar se o capítulo já foi marcado como lido
  if (!readingProgress.value.readChapters[bookName][props.chapter]) {
    // Marcar capítulo como lido
    readingProgress.value.readChapters[bookName][props.chapter] = true
    readingProgress.value.totalReadChapters++
    
    // Recalcular progresso
    calculateReadingProgress()
    
    // Salvar progresso no localStorage
    try {
      localStorage.setItem('readingProgress', JSON.stringify({
        readChapters: readingProgress.value.readChapters,
        totalReadChapters: readingProgress.value.totalReadChapters
      }))
    } catch (error) {
      console.error('Erro ao salvar progresso de leitura:', error)
    }
  }
}

onMounted(() => {
  // Calcular progresso de leitura
  calculateReadingProgress()
  
  // Inicializar sintetizador de voz
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechSynthesis = window.speechSynthesis
    
    // Carregar vozes disponíveis
    const loadVoices = () => {
      // Obter todas as vozes disponíveis, não apenas em português
      const allVoices = speechSynthesis.getVoices()
      
      // Filtrar vozes por idioma (priorizando português, mas incluindo outras)
      const ptVoices = allVoices.filter(voice => voice.lang.includes('pt'))
      const enVoices = allVoices.filter(voice => voice.lang.includes('en'))
      const otherVoices = allVoices.filter(voice => !voice.lang.includes('pt') && !voice.lang.includes('en'))
      
      // Combinar as vozes em ordem de prioridade
      availableVoices.value = [...ptVoices, ...enVoices, ...otherVoices]
      
      // Selecionar a primeira voz em português por padrão, se disponível
      if (ptVoices.length > 0 && !selectedVoice.value) {
        selectedVoice.value = ptVoices[0]
      } else if (availableVoices.value.length > 0 && !selectedVoice.value) {
        selectedVoice.value = availableVoices.value[0]
      }
      
      console.log('Vozes carregadas:', availableVoices.value)
    }
    
    // Algumas navegadores carregam as vozes de forma assíncrona
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
    
    loadVoices()
  }
})

// Limpar recursos de áudio quando o componente for desmontado
onBeforeUnmount(() => {
  stopAudio()
  
  // Garantir que o intervalo seja limpo
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
  }
})

// Variável para armazenar o intervalo de manutenção da fala
let keepAliveInterval = null

// Função para dividir o texto em partes menores
const splitTextIntoChunks = (text, chunkSize = 200) => {
  // Dividir por pontos para não cortar no meio de frases
  const sentences = text.split('.')
  const chunks = []
  let currentChunk = ''
  
  for (let sentence of sentences) {
    // Adicionar o ponto de volta (exceto se for a última frase vazia)
    if (sentence.trim()) {
      sentence = sentence.trim() + '.'
    }
    
    // Se a frase atual + a próxima frase exceder o tamanho do chunk, iniciar um novo chunk
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }
  
  // Adicionar o último chunk se não estiver vazio
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

// Função para iniciar a leitura em áudio
const playAudio = () => {
  if (!speechSynthesis) {
    alert('Seu navegador não suporta a síntese de voz.')
    return
  }
  
  // Se já estiver tocando, parar primeiro
  if (isPlaying.value) {
    stopAudio()
    return
  }
  
  // Criar um texto com todos os versículos (sem mencionar os números)
  const fullText = verseContent.value
    .map(verse => verse.text)
    .join('. ')
  
  // Dividir o texto em partes menores para evitar que o navegador pare a síntese
  const textChunks = splitTextIntoChunks(fullText)
  let currentChunkIndex = 0
  
  // Função para falar o próximo chunk
  const speakNextChunk = () => {
    if (currentChunkIndex < textChunks.length && isPlaying.value) {
      const chunk = textChunks[currentChunkIndex]
      
      // Configurar a fala para este chunk
      speechUtterance = new SpeechSynthesisUtterance(chunk)
      
      // Usar a voz selecionada pelo usuário
      if (selectedVoice.value) {
        speechUtterance.voice = selectedVoice.value
      }
      
      speechUtterance.lang = 'pt-BR'
      speechUtterance.rate = 1.1 // Um pouco mais rápido conforme solicitado
      speechUtterance.pitch = 1.05 // Ajuste sutil para uma voz mais agradável
      
      // Quando este chunk terminar, falar o próximo
      speechUtterance.onend = () => {
        currentChunkIndex++
        
        // Atualizar o progresso com base no chunk atual
        audioProgress.value = (currentChunkIndex / textChunks.length) * 100
        
        // Estimar o versículo atual com base no progresso
        const verseIndex = Math.floor((audioProgress.value / 100) * verseContent.value.length)
        currentVerse.value = verseIndex < verseContent.value.length ? verseContent.value[verseIndex].number : null
        
        // Verificar se ainda há mais chunks para falar
        if (currentChunkIndex < textChunks.length) {
          speakNextChunk()
        } else {
          // Finalizar quando todos os chunks forem falados
          isPlaying.value = false
          audioProgress.value = 0
          currentVerse.value = null
          clearInterval(keepAliveInterval)
          keepAliveInterval = null
        }
      }
      
      // Iniciar a fala deste chunk
      speechSynthesis.speak(speechUtterance)
    }
  }
  
  // Iniciar a leitura do primeiro chunk
  isPlaying.value = true
  speakNextChunk()
  
  // Solução para o bug do Chrome que pausa a síntese após 15 segundos
  // Manter a síntese ativa a cada 10 segundos
  keepAliveInterval = setInterval(() => {
    if (isPlaying.value && speechSynthesis.paused) {
      console.log('Reativando síntese de voz')
      speechSynthesis.resume()
    }
  }, 10000)
}

// Função para parar a leitura em áudio
const stopAudio = () => {
  if (speechSynthesis) {
    speechSynthesis.cancel()
    isPlaying.value = false
    audioProgress.value = 0
    currentVerse.value = null
    
    // Limpar o intervalo de manutenção
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval)
      keepAliveInterval = null
    }
  }
}

// Expor o método para o componente pai
defineExpose({ scrollToTop })

// Observar mudanças no capítulo para rolar automaticamente para o início do texto
watch(() => props.chapter, (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    // Pequeno atraso para garantir que o DOM foi atualizado
    setTimeout(scrollToTop, 200)
    // Recalcular progresso quando mudar de capítulo
    calculateReadingProgress()
  }
})

// Observar mudanças no livro para recalcular o progresso
watch(() => props.book, () => {
  calculateReadingProgress()
})

const selectVerse = (verseNumber) => {
  emit('select-verse', verseNumber === props.verse ? null : verseNumber)
  
  // Rolar para o versículo selecionado em dispositivos móveis
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      const element = document.getElementById(`verse-${verseNumber}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}

const previousChapter = () => {
  if (props.chapter > 1) {
    emit('change-chapter', props.chapter - 1)
  }
}

const nextChapter = () => {
  if (currentBookData.value && props.chapter < currentBookData.value.chapters.length) {
    emit('change-chapter', props.chapter + 1)
  }
}
</script>

<template>
  <div class="bible-reader" role="region" aria-label="Leitor da Bíblia">
    <div class="reader-header">
      <h2 class="book-title">{{ currentBookData?.book || currentBookData?.name || book }} {{ chapter }}</h2>
      
      <!-- Barra de progresso movida para BooksView -->
      
      <div class="reader-controls">
        <div class="audio-controls">
          <button 
            @click="playAudio" 
            class="audio-button" 
            :class="{ 'playing': isPlaying }" 
            aria-label="Ouvir capítulo"
            :title="isPlaying ? 'Parar áudio' : 'Ouvir capítulo'"
          >
            <span class="audio-icon">
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </span>
            {{ isPlaying ? 'Parar' : 'Ouvir' }}
          </button>
          
          <button 
            @click="showVoiceSelector = !showVoiceSelector" 
            class="voice-selector-button"
            title="Selecionar voz"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          
          <div v-if="showVoiceSelector" class="voice-selector-dropdown">
            <div class="voice-selector-header">
              <h4>Selecionar Voz</h4>
              <button @click="showVoiceSelector = false" class="close-button">&times;</button>
            </div>
            <div class="voice-list">
              <div 
                v-for="voice in availableVoices" 
                :key="voice.name"
                class="voice-option"
                :class="{ 'selected': selectedVoice && selectedVoice.name === voice.name }"
                @click="selectedVoice = voice; showVoiceSelector = false"
              >
                <div class="voice-name">{{ voice.name }}</div>
                <div class="voice-lang">{{ voice.lang }}</div>
              </div>
            </div>
          </div>
        </div>
        <button 
          v-if="chapter > 1" 
          @click="previousChapter" 
          class="chapter-nav-button" 
          aria-label="Capítulo anterior"
        >
          &laquo; Anterior
        </button>
        <button 
          v-if="currentBookData && chapter < (currentBookData.chapters?.length || 0)" 
          @click="nextChapter" 
          class="chapter-nav-button" 
          aria-label="Próximo capítulo"
        >
          Próximo &raquo;
        </button>
      </div>
    </div>
    
    <div class="reader-content">
      <div v-if="loading" class="loading-verses">
        <div class="spinner-small" aria-hidden="true"></div>
        <p>Carregando versículos...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchBibleData" class="retry-button">Tentar novamente</button>
      </div>
      
      <div v-else-if="verseContent.length === 0" class="no-verses">
        <p>Nenhum versículo encontrado para este capítulo.</p>
      </div>
      
      <div v-if="isPlaying" class="audio-progress-container">
        <div class="audio-progress-bar">
          <div class="audio-progress" :style="{ width: audioProgress + '%' }"></div>
        </div>
        <div class="audio-status">
          <span>Lendo em voz alta</span>
          <span v-if="currentVerse">Versículo {{ currentVerse }}</span>
        </div>
      </div>
      
      <div v-else class="verses-container">
        <div 
          v-for="verseItem in verseContent" 
          :key="verseItem.number"
            :id="`verse-${verseItem.number}`"
            class="verse"
            :class="{ 'verse-highlighted': verseItem.number === verse }"
            @click="selectVerse(verseItem.number)"
            tabindex="0"
            @keydown.enter="selectVerse(verseItem.number)"
          >
            <span class="verse-number" aria-hidden="true">{{ verseItem.number }}</span>
            <span class="verse-text">{{ verseItem.text }}</span>
          </div>
        
        <div class="chapter-actions">
          <button @click="markChapterAsRead" class="mark-read-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Marcar como lido
          </button>
        </div>
      </div>
      
      <!-- Botão de áudio flutuante para dispositivos móveis -->
      <button 
        @click="playAudio" 
        class="mobile-audio-button" 
        :class="{ 'playing': isPlaying }" 
        aria-label="Ouvir capítulo"
      >
        <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      
      <div v-if="verseContent.length > 0" class="reader-footer">
        <button 
          v-if="chapter > 1" 
          @click="previousChapter" 
          class="chapter-nav-button mobile-nav-button" 
          aria-label="Capítulo anterior"
        >
          &laquo; Capítulo anterior
        </button>
        <button 
          v-if="currentBookData && chapter < (currentBookData.chapters?.length || 0)" 
          @click="nextChapter" 
          class="chapter-nav-button mobile-nav-button" 
          aria-label="Próximo capítulo"
        >
          Próximo capítulo &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bible-reader {
  background-color: var(--card-background);
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.reader-header {
  padding: 1.2rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: var(--light-text);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.book-title {
  color: var(--light-text);
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reader-controls {
  display: flex;
  gap: 0.5rem;
}

.chapter-nav-button, .audio-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--light-text);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.chapter-nav-button:hover, .audio-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.audio-controls {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.audio-button {
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.audio-button.playing {
  background-color: #e74c3c;
}

.audio-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-selector-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--light-text);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.voice-selector-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.voice-selector-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--shadow);
  width: 280px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  border: 1px solid var(--border-color);
}

.voice-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.voice-selector-header h4 {
  margin: 0;
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.close-button:hover {
  opacity: 1;
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.voice-list {
  padding: 0.5rem;
}

.voice-option {
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0.25rem 0;
  border-left: 2px solid transparent;
}

.voice-option:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.voice-option.selected {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-left: 2px solid var(--accent-color);
}

.voice-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--text-color);
}

.voice-lang {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

.reader-progress {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-label {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.8;
}

.progress-bar {
  height: 4px;
  background-color: rgba(var(--primary-color-rgb, 58, 90, 120), 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.book-progress .progress-fill {
  background-color: var(--accent-color);
}

.general-progress .progress-fill {
  background-color: var(--primary-color);
}

.chapter-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.mark-read-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: var(--accent-color);
  color: var(--light-text);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mark-read-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.audio-progress-container {
  background-color: rgba(var(--primary-color-rgb, 58, 90, 120), 0.05);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(var(--primary-color-rgb, 58, 90, 120), 0.1);
}

/* Botão de áudio flutuante (escondido por padrão) */
.mobile-audio-button {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  z-index: 20;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: var(--accent-color);
  color: var(--light-text);
  border: none;
  display: none; /* Escondido por padrão em telas grandes */
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.mobile-audio-button.playing {
  background-color: #e74c3c;
}

.audio-progress-bar {
  height: 6px;
  background-color: rgba(var(--primary-color-rgb, 58, 90, 120), 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.audio-progress {
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 3px;
  transition: width 0.3s linear;
}

.audio-status {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--primary-color);
  opacity: 0.8;
}

.mobile-nav-button {
  background-color: var(--primary-color);
  color: var(--light-text);
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.mobile-nav-button:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.reader-content {
  padding: 1.5rem;
  min-height: 400px;
  background-color: var(--card-background);
  position: relative;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
}

.reader-content::-webkit-scrollbar {
  width: 6px;
}

.reader-content::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.1);
}

.reader-content::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
}

.reader-footer {
  display: flex;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  justify-content: space-between;
  gap: 1rem;
}

.loading-verses, .error-message, .no-verses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(58, 90, 120, 0.1);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  padding: 2rem;
  border-radius: 8px;
  background-color: rgba(231, 76, 60, 0.05);
}

.retry-button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.retry-button:hover {
  background-color: var(--primary-color-dark, #2a4158);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.verses-container {
  line-height: 1.8;
  padding: 0;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.verse {
  margin-bottom: 1.2rem;
  cursor: pointer;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.verse:hover {
  background-color: rgba(212, 169, 94, 0.1);
  border-left: 3px solid var(--accent-color);
  transform: translateX(4px);
}

.verse-highlighted {
  background-color: rgba(212, 169, 94, 0.2);
  border-left: 3px solid var(--accent-color);
  box-shadow: 0 2px 8px rgba(212, 169, 94, 0.15);
}

.verse-number {
  font-weight: bold;
  color: var(--primary-color);
  margin-right: 0.8rem;
  font-size: 0.85rem;
  background-color: rgba(58, 90, 120, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  vertical-align: super;
}

.verse-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-color);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 768px) {
  .bible-reader {
    border-radius: 12px;
  }
  
  .reader-header {
    padding: 1.25rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .book-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .reader-controls {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 0.75rem;
  }
  
  .reader-content {
    padding: 1rem;
  }
  
  .verse {
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    border-left: none;

  }
  
  .verse:hover {
    transform: none;
    background-color: rgba(212, 169, 94, 0.05);
    border-left: none;
    border-bottom: 1px solid var(--accent-color);
  }
  
  .verse-highlighted {
    background-color: rgba(212, 169, 94, 0.1);
    border-left: none;
    border-bottom: 1px solid var(--accent-color);
    border-radius: 8px;
  }
  
  .verse-number {
    font-size: 0.8rem;
    padding: 1px 4px;
    margin-right: 0.5rem;
  }
  
  .verse-text {
    font-size: 1.05rem;
    line-height: 1.6;
  }
  
  /* Aumentar área de toque para melhor experiência em dispositivos móveis */
  .verse {
    min-height: 44px;
  }
  
  /* Ajustar botões de navegação no rodapé em dispositivos móveis */
  .reader-footer {
    position: sticky;
    bottom: 1rem;
    z-index: 10;
    background-color: var(--card-background);
    opacity: 0.95;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin: 2rem -0.5rem 0;
    display: flex;
    justify-content: space-between;
  }
  
  /* Adicionar botão de áudio flutuante para dispositivos móveis */
  .mobile-audio-button {
    position: fixed;
    bottom: 5rem;
    right: 1rem;
    z-index: 20;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--accent-color);
    color: var(--light-text);
    border: none;
    display: flex; /* Mostrar apenas em dispositivos móveis */
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    font-size: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .mobile-audio-button.playing {
    background-color: #e74c3c;
    animation: pulse 2s infinite;
  }
  
  .mobile-nav-button {
    padding: 0.8rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .audio-controls {
    flex: 1;
    justify-content: flex-start;
    margin-right: 0.5rem;
  }
  
  .voice-selector-dropdown {
    width: 250px;
    left: 0;
    right: auto;
  }
}
</style>
