<template>
  <div class="books-view">
    <h1 class="page-title">Livros da Bíblia</h1>
    
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

const selectBook = (bookName) => {
  router.push({ name: 'chapters', params: { book: bookName } });
};

onMounted(async () => {
  try {
    // Usar import.meta.env.BASE_URL para considerar o caminho base configurado no vite.config.js
    const response = await fetch(`${import.meta.env.BASE_URL}aa.json`);
    
    // Tratando possíveis problemas de codificação
    const text = await response.text();
    const jsonText = text.replace(/^\ufeff/, ''); // Remove BOM se existir
    
    const data = JSON.parse(jsonText);
    books.value = data;
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
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .book-card {
    padding: 1.25rem;
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
