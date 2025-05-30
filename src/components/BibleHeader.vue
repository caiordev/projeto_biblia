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
      
      <!-- Menu de navegação (visível em todos os dispositivos) -->
      <div class="nav-menu">
        <div class="nav-buttons">
          <button @click="goHome" class="nav-button" title="Liturgia do Dia">
            <span class="nav-icon">🙏</span>
            <span class="nav-text">Liturgia</span>
          </button>
          <button @click="goToBible" class="nav-button" title="Bíblia">
            <span class="nav-icon">📚</span>
            <span class="nav-text">Bíblia</span>
          </button>
          <button v-if="hasLastReading" @click="continueReading" class="nav-button continue-reading-btn" title="Continuar leitura">
            <span class="continue-icon">⏵</span>
            <span class="nav-text">Continuar</span>
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

.nav-text {
  margin-left: 0.5rem;
  display: inline-block;
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
  height: 36px;
  padding: 0 12px;
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
  padding: 0;
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

/* Estilos para desktop (padrão) */
.nav-button {
  min-width: 90px; /* Garante um tamanho mínimo para os botões em desktop */
}

/* Estilos para dispositivos móveis */
@media (max-width: 768px) {
  .bible-header {
    padding: 0.5rem 0;
  }
  
  .header-container {
    padding: 0 0.5rem;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .site-title {
    font-size: 1.1rem;
  }
  
  .book-icon {
    font-size: 1.2rem;
    width: 28px;
    height: 28px;
  }
  
  .nav-menu {
    margin-top: 0;
    gap: 0.5rem;
  }
  
  .nav-buttons {
    gap: 0.25rem;
    margin-right: 0.25rem;
  }
  
  .nav-button {
    min-width: unset; /* Remove o tamanho mínimo em dispositivos móveis */
    height: 32px;
    padding: 0 0.5rem;
  }
  
  .theme-toggle-btn {
    width: 32px;
    height: 32px;
  }
  
  .nav-text {
    font-size: 0.8rem;
  }
  
  .nav-icon, .theme-icon, .continue-icon {
    font-size: 0.9rem;
  }
}
</style>
