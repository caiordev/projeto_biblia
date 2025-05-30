<template>
  <div class="books-view">
    <!-- Conteúdo estático para SEO e conformidade com políticas do Google AdSense -->
    <div class="seo-content">
      <h1>Bíblia Sagrada Online</h1>
      <p>Bem-vindo à nossa plataforma de leitura bíblica. Explore todos os livros da Bíblia Sagrada em português, com uma interface moderna e intuitiva. Acompanhe seu progresso de leitura e aprofunde seu conhecimento das Escrituras.</p>
      
      <div class="bible-info">
        <div class="info-card">
          <h3>Antigo Testamento</h3>
          <p>39 livros que relatam a criação do mundo, a história do povo de Israel e as profecias sobre o Messias.</p>
        </div>
        <div class="info-card">
          <h3>Novo Testamento</h3>
          <p>27 livros que incluem os evangelhos, a história da igreja primitiva, as cartas apostólicas e o Apocalipse.</p>
        </div>
      </div>
    </div>
    
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
    
    <!-- Mostrar mensagem de carregamento com conteúdo adicional -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando livros da Bíblia...</p>
      
      <div class="loading-content">
        <h3>Curiosidades sobre a Bíblia</h3>
        <ul class="bible-facts">
          <li>A Bíblia foi escrita ao longo de um período de aproximadamente 1.500 anos.</li>
          <li>Foi escrita por mais de 40 autores diferentes, incluindo reis, pescadores, médicos e pastores.</li>
          <li>O livro mais longo da Bíblia é o de Salmos, com 150 capítulos.</li>
          <li>O livro mais curto é 2 João, com apenas 13 versículos.</li>
          <li>A Bíblia foi o primeiro livro impresso na prensa de tipos móveis de Gutenberg.</li>
        </ul>
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
      </div>
    </div>
    
    <!-- Mostrar a grade de livros quando carregados -->
    <div v-else class="books-grid">
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
const error = ref(null);

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
    books.value = data;
    
    // Calcular progresso de leitura após carregar os livros
    calculateReadingProgress();
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
  // Dados mínimos para garantir que o componente funcione
  books.value = [
    { book: 'Gênesis', chapters: Array(50).fill([]) },
    { book: 'Salmos', chapters: Array(150).fill([]) },
    { book: 'João', chapters: Array(21).fill([]) },
    { book: 'Apocalipse', chapters: Array(22).fill([]) }
  ];
  
  // Calcular progresso de leitura com os dados de fallback
  calculateReadingProgress();
};

onMounted(() => {
  loadBibleData();
});
</script>

<style scoped>
.books-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.seo-content {
  background-color: var(--card-background);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.seo-content h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.seo-content > p {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.bible-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.info-card {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.05), rgba(var(--primary-color-rgb), 0.1));
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--accent-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.info-card p {
  line-height: 1.6;
  color: var(--text-color);
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

.bible-facts {
  list-style-type: none;
  padding: 0;
}

.bible-facts li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  padding-left: 1.5rem;
}

.bible-facts li:before {
  content: '\2022';
  color: var(--accent-color);
  font-weight: bold;
  position: absolute;
  left: 0;
}

.bible-facts li:last-child {
  border-bottom: none;
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
