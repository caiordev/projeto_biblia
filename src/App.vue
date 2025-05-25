<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BibleHeader from './components/BibleHeader.vue'

const router = useRouter()

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
  <div class="app-container">
    <BibleHeader @continue-reading="continueReading" />
    
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
