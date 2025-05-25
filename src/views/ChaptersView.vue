<template>
  <div class="chapters-view">
    <div class="header">
      <button class="back-button" @click="goBack">
        &laquo; Voltar para Livros
      </button>
      <h1 class="page-title">{{ bookName }}</h1>
    </div>
    
    <div class="chapters-grid">
      <div 
        v-for="chapterNumber in chapterCount" 
        :key="chapterNumber"
        :class="['chapter-card', { 'last-read': chapterNumber === lastReadChapter }]"
        @click="selectChapter(chapterNumber)"
      >
        <span class="chapter-number">{{ chapterNumber }}</span>
        <span v-if="chapterNumber === lastReadChapter" class="last-read-indicator">Última leitura</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const bookName = computed(() => route.params.book);
const bookData = ref(null);
const loading = ref(true);
const lastReadChapter = ref(null);

const chapterCount = computed(() => {
  if (!bookData.value) return 0;
  return bookData.value.chapters?.length || 0;
});

const goBack = () => {
  router.push({ name: 'books' });
};

const selectChapter = (chapterNumber) => {
  router.push({ 
    name: 'reader', 
    params: { 
      book: bookName.value, 
      chapter: chapterNumber 
    } 
  });
};

onMounted(async () => {
  try {
    // Verificar se há uma última leitura salva
    try {
      const savedReading = localStorage.getItem('lastReading');
      if (savedReading) {
        const reading = JSON.parse(savedReading);
        if (reading.book === bookName.value) {
          lastReadChapter.value = reading.chapter;
        }
      }
    } catch (e) {
      console.error('Erro ao recuperar última leitura:', e);
    }
    
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`);
    
    // Tratando possíveis problemas de codificação
    const text = await response.text();
    const jsonText = text.replace(/^\ufeff/, ''); // Remove BOM se existir
    
    const data = JSON.parse(jsonText);
    
    // Encontrar o livro selecionado
    const selectedBook = data.find(book => 
      (book.book === bookName.value) || (book.name === bookName.value)
    );
    
    bookData.value = selectedBook;
  } catch (error) {
    console.error('Erro ao carregar dados da Bíblia:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.chapters-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.back-button {
  background-color: transparent;
  color: var(--primary-color);
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  font-weight: 500;
}

.back-button:hover {
  color: var(--accent-color);
  transform: translateX(-5px);
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  font-weight: 700;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1.25rem;
}

.chapter-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
  border-bottom: 4px solid transparent;
}

.chapter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  border-bottom: 4px solid var(--accent-color);
}

.chapter-number {
  font-size: 1.5rem;
  color: var(--primary-color);
  font-weight: 600;
}

.last-read {
  border-bottom: 4px solid var(--accent-color);
  background-color: rgba(212, 169, 94, 0.1);
  position: relative;
}

.last-read-indicator {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--accent-color);
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 600;
}

@media (max-width: 768px) {
  .chapters-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 1rem;
  }
  
  .chapter-card {
    padding: 1rem;
  }
  
  .chapter-number {
    font-size: 1.25rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
