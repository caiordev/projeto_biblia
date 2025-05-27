<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import BibleHeader from './components/BibleHeader.vue'

const router = useRouter()
const isDarkTheme = ref(false)

// Verificar e carregar o tema salvo no localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkTheme.value = true
    document.documentElement.classList.add('dark-theme')
  }
})

// Função para alternar entre tema claro e escuro
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('theme', 'light')
  }
}

// Disponibilizar o tema e a função de alternar para os componentes filhos
provide('isDarkTheme', isDarkTheme)
provide('toggleTheme', toggleTheme)

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

// Carregar a última leitura salva e navegar para ela
const continueReading = () => {
  try {
    const savedReading = localStorage.getItem('lastReading')
    if (savedReading) {
      const reading = JSON.parse(savedReading)
      console.log('Continuando leitura:', reading)
      router.push({ 
        name: 'reader', 
        params: { 
          book: reading.book, 
          chapter: reading.chapter 
        }
      })
    } else {
      // Se não houver leitura salva, ir para a lista de livros
      router.push({ name: 'books' })
    }
  } catch (error) {
    console.error('Erro ao carregar última leitura:', error)
    router.push({ name: 'books' })
  }
}
</script>

<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
    <BibleHeader @continue-reading="continueReading" :is-dark-theme="isDarkTheme" @toggle-theme="toggleTheme" />
    
    <main class="main-content">
      <router-view></router-view>
    </main>
    
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} - Site de Leitura da Bíblia</p>
    </footer>
  </div>
</template>

<style>
:root {
  /* Tema claro (padrão) */
  --primary-color: #3a5a78;
  --primary-color-rgb: 58, 90, 120; /* Valores RGB da cor primária */
  --primary-color-dark: #2a4158;
  --secondary-color: #f8f9fa;
  --accent-color: #d4a95e;
  --accent-color-light: rgba(212, 169, 94, 0.2);
  --text-color: #333;
  --light-text: #fff;
  --border-color: #e0e0e0;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
  --background-gradient: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
  --card-background: white;
  --footer-text: var(--light-text);
}

/* Variáveis do tema escuro */
:root.dark-theme {
  --primary-color: #1e3a5f;
  --primary-color-rgb: 30, 58, 95; /* Valores RGB da cor primária para o tema escuro */
  --primary-color-dark: #0f2744;
  --secondary-color: #121212;
  --accent-color: #e9b968;
  --accent-color-light: rgba(233, 185, 104, 0.15);
  --text-color: #e0e0e0;
  --light-text: #f8f8f8;
  --border-color: #333333;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  --background-gradient: linear-gradient(to bottom right, #121212, #1e1e1e);
  --card-background: #1e1e1e;
  --footer-text: var(--light-text);
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
  background-image: var(--background-gradient);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: 0;
}

.bible-container {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
  width: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  background-color: var(--card-background);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 3rem;
  transition: background-color 0.3s ease;
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
  color: var(--footer-text);
  text-align: center;
  padding: 1.5rem;
  margin-top: 3rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.05);
  transition: background 0.3s ease;
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
