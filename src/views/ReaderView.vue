<template>
  <div class="reader-view">
    <div class="header">
      <button class="back-button" @click="goBack">
        &laquo; Voltar para Capítulos
      </button>
    </div>
    
    <BibleReader 
      ref="bibleReaderRef"
      :book="bookName" 
      :chapter="chapterNumber" 
      :verse="currentVerse"
      :bibleData="bibleData"
      @select-verse="selectVerse"
      @change-chapter="changeChapter"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BibleReader from '../components/BibleReader.vue';

const router = useRouter();
const route = useRoute();
const bookName = computed(() => route.params.book);
const chapterNumber = computed(() => parseInt(route.params.chapter) || 1);
const currentVerse = ref(null);
const bibleData = ref(null);
const loading = ref(true);
const bibleReaderRef = ref(null);

const goBack = () => {
  router.push({ name: 'chapters', params: { book: bookName.value } });
};

const selectVerse = (verse) => {
  currentVerse.value = verse;
  
  // Salvar a última leitura no localStorage
  saveLastReading();
};

const changeChapter = (chapter) => {
  router.push({ 
    name: 'reader', 
    params: { 
      book: bookName.value, 
      chapter: chapter 
    } 
  });
  
  // Salvar a última leitura no localStorage
  saveLastReading();
};

// Salvar a última leitura no localStorage
const saveLastReading = () => {
  try {
    const readingData = {
      book: bookName.value,
      chapter: chapterNumber.value,
      verse: currentVerse.value
    };
    localStorage.setItem('lastReading', JSON.stringify(readingData));
  } catch (error) {
    console.error('Erro ao salvar leitura:', error);
  }
};

// Observar mudanças no livro e capítulo para salvar no localStorage
watch([bookName, chapterNumber], ([newBook, newChapter]) => {
  saveLastReading();
});

onMounted(async () => {
  try {
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`);
    
    // Tratando possíveis problemas de codificação
    const text = await response.text();
    const jsonText = text.replace(/^\ufeff/, ''); // Remove BOM se existir
    
    const data = JSON.parse(jsonText);
    bibleData.value = data;
    
    // Salvar a leitura atual no localStorage
    saveLastReading();
  } catch (error) {
    console.error('Erro ao carregar dados da Bíblia:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.reader-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
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
  font-weight: 500;
}

.back-button:hover {
  color: var(--accent-color);
  transform: translateX(-5px);
}

@media (max-width: 768px) {
  .reader-view {
    padding: 0.75rem;
  }
  
  .header {
    margin-bottom: 1rem;
  }
}
</style>
