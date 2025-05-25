<script setup>
import { ref, onMounted, watch } from 'vue'
import BibleHeader from './components/BibleHeader.vue'
import BibleReader from './components/BibleReader.vue'
import BibleSelector from './components/BibleSelector.vue'

// Recuperar última leitura do localStorage ou usar valores padrão
const getLastReading = () => {
  try {
    const savedReading = localStorage.getItem('lastReading')
    if (savedReading) {
      return JSON.parse(savedReading)
    }
  } catch (error) {
    console.error('Erro ao recuperar última leitura:', error)
  }
  return { book: 'Gênesis', chapter: 1, verse: null }
}

const lastReading = getLastReading()
const currentBook = ref(lastReading.book)
const currentChapter = ref(lastReading.chapter)
const currentVerse = ref(lastReading.verse)
const bibleData = ref(null)
const loading = ref(true)
const bibleReaderRef = ref(null)

const changeBook = (book) => {
  currentBook.value = book
  currentChapter.value = 1
  currentVerse.value = null
  saveLastReading()
}

const changeChapter = (chapter) => {
  currentChapter.value = chapter
  currentVerse.value = null
  saveLastReading()
  
  // Rolar para o início do texto do capítulo
  setTimeout(() => {
    if (bibleReaderRef.value) {
      bibleReaderRef.value.scrollToTop()
    }
  }, 100)
}

const changeVerse = (verse) => {
  currentVerse.value = verse
  saveLastReading()
}

// Salvar a última leitura no localStorage
const saveLastReading = () => {
  try {
    const readingData = {
      book: currentBook.value,
      chapter: currentChapter.value,
      verse: currentVerse.value
    }
    localStorage.setItem('lastReading', JSON.stringify(readingData))
    console.log('Leitura salva:', readingData)
  } catch (error) {
    console.error('Erro ao salvar leitura:', error)
  }
}

// Carregar a última leitura salva
const loadLastReading = () => {
  try {
    const savedReading = localStorage.getItem('lastReading')
    if (savedReading) {
      const reading = JSON.parse(savedReading)
      currentBook.value = reading.book
      currentChapter.value = reading.chapter
      if (reading.verse) {
        currentVerse.value = reading.verse
        // Dar tempo para o componente renderizar antes de rolar para o versículo
        setTimeout(() => {
          const verseElement = document.getElementById(`verse-${reading.verse}`)
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 500)
      }
      
      // Fechar o seletor de livros se estiver aberto (em dispositivos móveis)
      if (window.innerWidth <= 768) {
        const selector = document.querySelector('.bible-selector')
        if (selector && selector.classList.contains('active')) {
          selector.classList.remove('active')
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar última leitura:', error)
  }
}

onMounted(async () => {
  try {
    // Carregando o arquivo JSON local aa.json
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`)
    
    // Tratando possíveis problemas de codificação
    const text = await response.text()
    const jsonText = text.replace(/^\ufeff/, '') // Remove BOM se existir
    
    const data = JSON.parse(jsonText)
    console.log('Dados carregados:', data)
    
    bibleData.value = data
    
    // Verificar se o livro atual existe nos dados carregados
    const bookExists = data.some(book => 
      (book.book === currentBook.value) || (book.name === currentBook.value)
    )
    
    if (!bookExists && data.length > 0) {
      // Se o livro atual não existir, selecionar o primeiro livro disponível
      // Verificar qual propriedade o livro usa (book ou name)
      currentBook.value = data[0].book || data[0].name
    }
  } catch (error) {
    console.error('Erro ao carregar dados da Bíblia:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="app-container">
    <BibleHeader @continue-reading="loadLastReading" />
    
    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando a Bíblia...</p>
      </div>
      
      <div v-else class="bible-container">
        <BibleSelector 
          :currentBook="currentBook" 
          :currentChapter="currentChapter"
          :bibleData="bibleData"
          @change-book="changeBook"
          @change-chapter="changeChapter"
        />
        
        <BibleReader 
          ref="bibleReaderRef"
          :book="currentBook" 
          :chapter="currentChapter" 
          :verse="currentVerse"
          :bibleData="bibleData"
          @select-verse="changeVerse"
          @change-chapter="changeChapter"
        />
      </div>
    </main>
    
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} - Site de Leitura da Bíblia</p>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #3a5a78;
  --primary-color-dark: #2a4158;
  --secondary-color: #f8f9fa;
  --accent-color: #d4a95e;
  --accent-color-light: rgba(212, 169, 94, 0.2);
  --text-color: #333;
  --light-text: #fff;
  --border-color: #e0e0e0;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-color);
  background-color: var(--secondary-color);
  line-height: 1.6;
  background-image: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
}

.bible-container {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  background-color: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 3rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(58, 90, 120, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.footer {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: var(--light-text);
  text-align: center;
  padding: 1.5rem;
  margin-top: 3rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem;
  }
  
  .bible-container {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .bible-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .main-content {
    padding: 0.75rem;
  }
  
  .loading {
    padding: 1.5rem;
    height: 50vh;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
  }
  
  .footer {
    padding: 1rem;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }
}
</style>
