<template>
  <div class="reader-view">
    <!-- Conteúdo estático para SEO e conformidade com políticas do Google AdSense -->
    <div class="reader-about">
      <h1>Leitura Bíblica Online</h1>
      <p>Bem-vindo à nossa plataforma de leitura bíblica. Aqui você pode ler a Bíblia Sagrada em português, com uma interface moderna e intuitiva. Navegue pelos livros, capítulos e versículos com facilidade.</p>
    </div>
    
    <div class="header">
      <button class="back-button" @click="goBack">
        &laquo; Voltar para Capítulos
      </button>
    </div>
    
    <!-- Mostrar mensagem de carregamento com conteúdo adicional -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando o texto bíblico...</p>
      
      <div class="loading-content">
        <h3>Enquanto você espera...</h3>
        <p>A Bíblia é uma coleção de textos religiosos ou escrituras sagradas. É considerada pelos cristãos como divinamente inspirada e contém 66 livros no cânone protestante, divididos entre o Antigo e o Novo Testamento.</p>
        <p>O Antigo Testamento contém 39 livros e o Novo Testamento contém 27 livros. Cada livro é dividido em capítulos e versículos para facilitar a referência e o estudo.</p>
      </div>
    </div>
    
    <!-- Mostrar mensagem de erro com conteúdo adicional -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>Erro ao carregar dados</h2>
      <p>{{ error }}</p>
      <button @click="loadBibleData" class="retry-button">Tentar novamente</button>
      
      <div class="error-content">
        <h3>Enquanto resolvemos o problema...</h3>
        <p>A Bíblia é o livro mais vendido e distribuído de todos os tempos, com estimativas de mais de 5 bilhões de cópias vendidas. Ela foi traduzida para mais de 2.000 idiomas, tornando-a acessível para a maioria da população mundial.</p>
        <p>A primeira tradução completa da Bíblia para o português foi feita por João Ferreira de Almeida, um missionário português, no século XVII.</p>
      </div>
    </div>
    
    <!-- Mostrar o conteúdo da Bíblia quando carregado -->
    <BibleReader 
      v-else
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
const error = ref(null);
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

// Função para carregar os dados da Bíblia
const loadBibleData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`);
    }
    
    // Tratando possíveis problemas de codificação
    const text = await response.text();
    const jsonText = text.replace(/^\ufeff/, ''); // Remove BOM se existir
    
    const data = JSON.parse(jsonText);
    bibleData.value = data;
    
    // Salvar a leitura atual no localStorage
    saveLastReading();
  } catch (err) {
    error.value = err.message;
    console.error('Erro ao carregar dados da Bíblia:', err);
    // Usar dados de fallback para garantir que sempre haja conteúdo
    useFallbackData();
  } finally {
    loading.value = false;
  }
};

// Função para usar dados de fallback quando a API falha
const useFallbackData = () => {
  // Dados mínimos para garantir que o componente BibleReader funcione
  bibleData.value = [
    {
      book: 'Gênesis',
      name: 'Gênesis',
      chapters: [
        [
          'No princípio, Deus criou os céus e a terra.',
          'A terra era sem forma e vazia; e havia trevas sobre a face do abismo, mas o Espírito de Deus pairava sobre a face das águas.',
          'E disse Deus: Haja luz. E houve luz.',
          'E viu Deus que a luz era boa; e dividiu Deus a luz das trevas.',
          'E Deus chamou à luz Dia, e às trevas chamou Noite. E foi a tarde e a manhã: o primeiro dia.'
        ]
      ]
    }
  ];
};

onMounted(() => {
  loadBibleData();
});
</script>

<style scoped>
.reader-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.reader-about {
  background-color: var(--card-background);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.reader-about h1 {
  color: var(--primary-color);
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
}

.reader-about p {
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.loading-container, .error-container {
  background-color: var(--card-background);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  text-align: center;
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(58, 90, 120, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content, .error-content {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: left;
}

.loading-content h3, .error-content h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.loading-content p, .error-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #e74c3c;
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-2px);
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
