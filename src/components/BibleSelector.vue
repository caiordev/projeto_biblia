<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentBook: String,
  currentChapter: Number,
  bibleData: Array
})

const emit = defineEmits(['change-book', 'change-chapter'])

// Lista de livros do Antigo Testamento em ordem
const oldTestamentBooks = [
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute',
  '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias',
  'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias',
  'Lamentações', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias', 'Jonas',
  'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias'
];

// Lista de livros do Novo Testamento em ordem
const newTestamentBooks = [
  'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios',
  'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses',
  '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro',
  '1 João', '2 João', '3 João', 'Judas', 'Apocalipse'
];

const books = computed(() => {
  if (!props.bibleData) return []
  
  console.log('BibleData recebido:', props.bibleData)
  
  // Mostrar todos os livros disponíveis
  return [
    { heading: 'Livros da Bíblia', items: props.bibleData }
  ]
})

const selectedBook = computed(() => {
  if (!props.bibleData) return null
  return props.bibleData.find(book => 
    (book.book === props.currentBook) || (book.name === props.currentBook)
  )
})

const chapters = computed(() => {
  if (!selectedBook.value || !selectedBook.value.chapters) return []
  
  // Verificar se chapters é um array (estrutura do JSON)
  if (Array.isArray(selectedBook.value.chapters)) {
    return Array.from({ length: selectedBook.value.chapters.length }, (_, i) => i + 1)
  }
  
  // Caso seja um número (outra possível estrutura)
  if (typeof selectedBook.value.chapters === 'number') {
    return Array.from({ length: selectedBook.value.chapters }, (_, i) => i + 1)
  }
  
  return []
})

const handleBookChange = (bookName) => {
  emit('change-book', bookName)
}

const handleChapterChange = (chapter) => {
  emit('change-chapter', Number(chapter))
}
</script>

<template>
  <div class="bible-selector">
    <div class="selector-container">
      <h2 class="selector-title">Navegação</h2>
      
      <div class="book-selector">
        <h3>Livro</h3>
        <div class="book-list">
          <div v-for="testament in books" :key="testament.heading" class="testament-group">
            <h4 class="testament-heading">{{ testament.heading }}</h4>
            <ul class="book-items">
              <li 
                v-for="book in testament.items" 
                :key="book.abbrev || book.name"
                :class="{ active: (book.book === currentBook) || (book.name === currentBook) }"
                @click="handleBookChange(book.book || book.name)"
              >
                {{ book.book || book.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="chapter-selector">
        <h3>Capítulo</h3>
        <div class="chapter-grid">
          <button 
            v-for="chapter in chapters" 
            :key="chapter"
            :class="{ active: chapter === currentChapter }"
            @click="handleChapterChange(chapter)"
          >
            {{ chapter }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bible-selector {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.selector-container {
  padding: 0;
}

.selector-title {
  margin: 0;
  padding: 1.8rem 2rem;
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark, #2a4158));
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-selector, .chapter-selector {
  margin: 0;
  padding: 1.5rem 2rem;
}

.book-selector {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.book-selector h3, .chapter-selector h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-weight: 600;
  display: flex;
  align-items: center;
}

.book-selector h3::before, .chapter-selector h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: var(--accent-color);
  margin-right: 10px;
  border-radius: 2px;
}

.testament-heading {
  font-size: 1rem;
  color: var(--accent-color);
  margin: 1rem 0 0.5rem;
  font-weight: 600;
}

.book-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 0.5rem;
  background-color: rgba(245, 245, 245, 0.5);
  scrollbar-width: thin;
}

.book-list::-webkit-scrollbar {
  width: 6px;
}

.book-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.book-list::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
}

.book-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.book-items li {
  padding: 0.7rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-bottom: 3px;
  font-size: 0.95rem;
  border-left: 3px solid transparent;
  -webkit-tap-highlight-color: transparent; /* Remover destaque de toque em dispositivos móveis */
}

.book-items li:hover {
  background-color: rgba(212, 169, 94, 0.1);
  border-left: 3px solid var(--accent-color);
  transform: translateX(4px);
}

.book-items li.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(58, 90, 120, 0.2);
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.6rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  scrollbar-width: thin;
}

.chapter-grid::-webkit-scrollbar {
  width: 6px;
}

.chapter-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chapter-grid::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
}

.chapter-grid button {
  padding: 0.7rem 0.5rem;
  background-color: rgba(245, 245, 245, 0.7);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  -webkit-tap-highlight-color: transparent; /* Remover destaque de toque em dispositivos móveis */
}

.chapter-grid button:hover {
  background-color: rgba(212, 169, 94, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.chapter-grid button.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 8px rgba(58, 90, 120, 0.2);
}

@media (max-width: 768px) {
  .bible-selector {
    position: static;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
  
  .selector-title {
    padding: 1.25rem;
    font-size: 1.3rem;
  }
  
  .book-selector, .chapter-selector {
    padding: 1rem 1.25rem;
  }
  
  .book-selector h3, .chapter-selector h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  .book-list {
    max-height: 200px;
  }
  
  .testament-heading {
    font-size: 0.9rem;
    margin: 0.75rem 0 0.3rem;
  }
  
  .chapter-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }
  
  .book-items li {
    padding: 0.8rem 0.6rem;
    font-size: 0.95rem;
    /* Aumentar área de toque para melhor experiência em dispositivos móveis */
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .chapter-grid button {
    padding: 0.6rem 0.4rem;
    font-size: 0.95rem;
    /* Aumentar área de toque para melhor experiência em dispositivos móveis */
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Adicionar modo de rolagem horizontal para os capítulos em telas muito pequenas */
  @media (max-width: 400px) {
    .chapter-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
