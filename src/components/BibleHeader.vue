<script setup>
// Componente de cabeçalho para o site da Bíblia
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  isDarkTheme: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['continue-reading', 'toggle-theme'])

// Verificar se existe uma leitura salva
const hasLastReading = ref(false)

onMounted(() => {
  try {
    const savedReading = localStorage.getItem('lastReading')
    hasLastReading.value = !!savedReading
  } catch (error) {
    console.error('Erro ao verificar última leitura:', error)
  }
})

const continueReading = () => {
  emit('continue-reading')
}

const goHome = () => {
  router.push({ name: 'home' })
}

const goToBible = () => {
  router.push({ name: 'books' })
}

const toggleTheme = () => {
  emit('toggle-theme')
}
</script>

<template>
  <header class="bible-header">
    <div class="header-container">
      <div class="logo-container" @click="goHome" style="cursor: pointer;">
        <span class="book-icon">📖</span>
        <h1 class="site-title">Bíblia Online</h1>
      </div>
      
      <div class="nav-menu">
        <div class="nav-buttons">
          <button @click="goHome" class="nav-button" title="Liturgia do Dia">
            <span class="nav-icon">🙏</span>
          </button>
          <button @click="goToBible" class="nav-button" title="Bíblia">
            <span class="nav-icon">📚</span>
          </button>
          <button v-if="hasLastReading" @click="continueReading" class="nav-button continue-reading-btn" title="Continuar leitura">
            <span class="continue-icon">⏵</span>
          </button>
        </div>
        <button @click="toggleTheme" class="theme-toggle-btn" title="Alternar tema">
          <span class="theme-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.bible-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: var(--light-text);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  padding: 0.75rem 0;
}

.bible-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.header-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.2s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
}

.book-icon {
  font-size: 1.75rem;
  background-color: rgba(255, 255, 255, 0.15);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.site-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  margin-right: 0.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--light-text);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.continue-reading-btn {
  background-color: var(--accent-color);
}

.theme-toggle-btn {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--light-text);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.theme-icon {
  font-size: 1.1rem;
}

.continue-icon, .nav-icon {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .bible-header {
    padding: 0.5rem 0;
  }
  
  .header-container {
    padding: 0 1rem;
  }
  
  .site-title {
    font-size: 1.25rem;
  }
  
  .book-icon {
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
  }
  
  .nav-button, .theme-toggle-btn {
    width: 32px;
    height: 32px;
  }
  
  .nav-icon, .theme-icon, .continue-icon {
    font-size: 1rem;
  }
}
</style>
