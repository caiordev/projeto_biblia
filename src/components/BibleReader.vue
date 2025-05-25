<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  book: String,
  chapter: Number,
  verse: Number,
  bibleData: Array
})

const emit = defineEmits(['select-verse', 'change-chapter'])

const loading = ref(false)
const error = ref(null)

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

// Expor o método para o componente pai
defineExpose({ scrollToTop })

// Observar mudanças no capítulo para rolar automaticamente para o início do texto
watch(() => props.chapter, (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    // Pequeno atraso para garantir que o DOM foi atualizado
    setTimeout(scrollToTop, 200)
  }
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
      
      <div class="reader-controls">
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
        <p>Nenhum versículo encontrado para {{ book }} {{ chapter }}.</p>
      </div>
      
      <div v-else class="verses-container">
        <div 
          v-for="verseItem in verseContent" 
          :key="verseItem.number"
          :class="{ 'verse-highlighted': verse === verseItem.number }"
          @click="selectVerse(verseItem.number)"
          class="verse"
          :id="`verse-${verseItem.number}`"
          role="button"
          :aria-label="`Versículo ${verseItem.number}`"
          tabindex="0"
          @keydown.enter="selectVerse(verseItem.number)"
        >
          <span class="verse-number" aria-hidden="true">{{ verseItem.number }}</span>
          <span class="verse-text">{{ verseItem.text }}</span>
        </div>
      </div>
      
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
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.reader-header {
  padding: 1.8rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark, #2a4158));
  color: white;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.book-title {
  color: white;
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

.chapter-nav-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-nav-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mobile-nav-button {
  background-color: var(--primary-color);
  color: white;
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
  padding: 2rem;
  min-height: 400px;
  background-color: #fff;
  position: relative;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(0, 0, 0, 0.05);
}

.reader-content::-webkit-scrollbar {
  width: 6px;
}

.reader-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.reader-content::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
}

.reader-footer {
  display: flex;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
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
  padding: 0.5rem;
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
  color: #333;
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
    align-items: flex-start;
  }
  
  .book-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .reader-controls {
    display: none; /* Esconder os controles de navegação no cabeçalho em dispositivos móveis */
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
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin: 2rem -0.5rem 0;
  }
  
  .mobile-nav-button {
    padding: 0.8rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
