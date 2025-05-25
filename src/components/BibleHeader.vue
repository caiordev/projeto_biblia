<script setup>
// Componente de cabeçalho para o site da Bíblia
import { ref, onMounted } from 'vue'
const emit = defineEmits(['continue-reading'])

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
</script>

<template>
  <header class="bible-header">
    <div class="header-container">
      <div class="logo-container">
        <div class="logo-icon">
          <span class="book-icon">📖</span>
        </div>
        <div class="logo-text">
          <h1 class="site-title">Bíblia Online</h1>
          <p class="site-subtitle">Leitura e estudo da palavra de Deus</p>
        </div>
      </div>
      
      <div class="header-actions" v-if="hasLastReading">
        <button @click="continueReading" class="continue-reading-btn">
          <span class="continue-icon">⏵</span>
          Continuar leitura
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.bible-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: var(--light-text);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.bible-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.header-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1rem;
  display: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-icon {
  background-color: rgba(255, 255, 255, 0.15);
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.logo-icon:hover {
  transform: translateY(-5px) rotate(5deg);
}

.book-icon {
  font-size: 2.5rem;
}

.logo-text {
  text-align: left;
}

.site-title {
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.site-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.2rem;
}

.header-actions {
  display: flex;
  align-items: center;
}

.continue-reading-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.continue-reading-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.continue-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .bible-header {
    padding: 1.5rem 1rem;
  }
  
  .logo-container {
    gap: 1rem;
    text-align: center;
  }
  
  .logo-text {
    text-align: center;
  }
  
  .site-title {
    font-size: 2rem;
  }
  
  .site-subtitle {
    font-size: 1rem;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
  }
  
  .book-icon {
    font-size: 2rem;
  }
}
</style>
