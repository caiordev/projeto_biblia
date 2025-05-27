<template>
  <div class="books-view">
    <h1 class="page-title">Livros da Bíblia</h1>
    
    <!-- Barra de progresso de leitura -->
    <div class="reading-progress-container">
      <div class="progress-info">
        <div class="progress-label">Progresso geral: {{ readingProgress.general }}%</div>
        <div class="progress-bar general-progress">
          <div class="progress-fill" :style="{ width: readingProgress.general + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div class="books-grid">
      <div 
        v-for="book in books" 
        :key="book.book || book.name"
        class="book-card"
        @click="selectBook(book.book || book.name)"
      >
        <h3 class="book-name">{{ book.book || book.name }}</h3>
        <div class="book-info">
          <span class="chapter-count">{{ book.chapters?.length || 0 }} capítulos</span>
          <div class="book-progress-bar" v-if="getBookProgress(book.book || book.name) > 0">
            <div class="book-progress-fill" :style="{ width: getBookProgress(book.book || book.name) + '%' }"></div>
            <span class="book-progress-text">{{ getBookProgress(book.book || book.name) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const books = ref([]);
const loading = ref(true);

// Estado para o progresso de leitura
const readingProgress = ref({
  general: 0,  // Progresso geral da Bíblia (0-100%)
  readChapters: {}, // Objeto que armazena capítulos lidos por livro
  totalChapters: 0, // Total de capítulos na Bíblia
  totalReadChapters: 0 // Total de capítulos lidos
});

// Calcular o progresso de leitura
const calculateReadingProgress = () => {
  if (!books.value || books.value.length === 0) return;
  
  // Carregar dados de progresso do localStorage
  try {
    const savedProgress = localStorage.getItem('readingProgress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      readingProgress.value.readChapters = parsed.readChapters || {};
      readingProgress.value.totalReadChapters = parsed.totalReadChapters || 0;
    }
  } catch (error) {
    console.error('Erro ao carregar progresso de leitura:', error);
    readingProgress.value.readChapters = {};
    readingProgress.value.totalReadChapters = 0;
  }
  
  // Calcular total de capítulos na Bíblia
  let totalChapters = 0;
  books.value.forEach(book => {
    if (book.chapters && Array.isArray(book.chapters)) {
      totalChapters += book.chapters.length;
    }
  });
  readingProgress.value.totalChapters = totalChapters;
  
  // Calcular progresso geral
  if (totalChapters > 0) {
    readingProgress.value.general = Math.round((readingProgress.value.totalReadChapters / totalChapters) * 100);
  }
};

// Calcular progresso para um livro específico
const getBookProgress = (bookName) => {
  if (!books.value || !readingProgress.value.readChapters) return 0;
  
  const book = books.value.find(b => (b.book || b.name) === bookName);
  if (!book || !book.chapters) return 0;
  
  const totalBookChapters = book.chapters.length;
  if (totalBookChapters === 0) return 0;
  
  const bookProgress = readingProgress.value.readChapters[bookName] || {};
  let readBookChapters = 0;
  
  // Contar capítulos lidos no livro
  for (let i = 1; i <= totalBookChapters; i++) {
    if (bookProgress[i]) {
      readBookChapters++;
    }
  }
  
  return Math.round((readBookChapters / totalBookChapters) * 100);
};

const selectBook = (bookName) => {
  router.push({ name: 'chapters', params: { book: bookName } });
};

onMounted(async () => {
  try {
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`);
    
    // Tratando possíveis problemas de codificação
    const text = await response.text();
    const jsonText = text.replace(/^﻿/, ''); // Remove BOM se existir
    
    const data = JSON.parse(jsonText);
    books.value = data;
    
    // Calcular progresso de leitura após carregar os livros
    calculateReadingProgress();
  } catch (error) {
    console.error('Erro ao carregar dados da Bíblia:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.books-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Estilos para o progresso de leitura */
.reading-progress-container {
  max-width: 800px;
  margin: 0 auto 2rem auto;
  padding: 1rem 1.5rem;
  background-color: var(--card-background);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-color);
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background-color: rgba(var(--primary-color-rgb, 58, 90, 120), 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.general-progress .progress-fill {
  background-color: var(--accent-color);
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-left: 4px solid transparent;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  border-left: 4px solid var(--accent-color);
}

.book-name {
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.book-info {
  font-size: 0.9rem;
  color: #666;
}

.chapter-count {
  background-color: rgba(58, 90, 120, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.book-progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(var(--primary-color-rgb, 58, 90, 120), 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  margin-top: 0.5rem;
}

.book-progress-fill {
  height: 100%;
  background-color: var(--accent-color);
  transition: width 0.3s ease;
}

.book-progress-text {
  font-size: 0.7rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-top: 0.25rem;
  display: block;
  text-align: right;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .book-card {
    padding: 1.25rem;
  }
  
  .reading-progress-container {
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
  }
  
  .book-name {
    font-size: 1.1rem;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
}
</style>
