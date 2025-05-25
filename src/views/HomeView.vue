<script setup>
import { ref, onMounted } from 'vue'

const liturgyData = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchLiturgyData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('https://liturgia.up.railway.app/')
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`)
    }
    
    liturgyData.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('Erro ao carregar liturgia:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLiturgyData()
})
</script>

<template>
  <div class="home-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando liturgia do dia...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>Erro ao carregar dados</h2>
      <p>{{ error }}</p>
      <button @click="fetchLiturgyData" class="retry-button">Tentar novamente</button>
    </div>
    
    <div v-else-if="liturgyData" class="liturgy-container">
      <div class="liturgy-header">
        <h2 class="liturgy-title">Liturgia do Dia</h2>
        <div class="liturgy-date-info">
          <div class="date-badge">{{ liturgyData.data }}</div>
          <div class="liturgy-badge" :class="liturgyData.cor.toLowerCase()">{{ liturgyData.liturgia }}</div>
        </div>
      </div>
      
      <div class="liturgy-sections">
        <section class="liturgy-section">
          <h3 class="section-title">Evangelho do Dia</h3>
          <div class="section-content gospel">
            <div class="reference">{{ liturgyData.evangelho.referencia }}</div>
            <div class="title">{{ liturgyData.evangelho.titulo }}</div>
            <div class="text">{{ liturgyData.evangelho.texto }}</div>
          </div>
        </section>
        
        <section class="liturgy-section">
          <h3 class="section-title">Primeira Leitura</h3>
          <div class="section-content">
            <div class="reference">{{ liturgyData.primeiraLeitura.referencia }}</div>
            <div class="title">{{ liturgyData.primeiraLeitura.titulo }}</div>
            <div class="text">{{ liturgyData.primeiraLeitura.texto }}</div>
          </div>
        </section>
        
        <section class="liturgy-section">
          <h3 class="section-title">Salmo</h3>
          <div class="section-content">
            <div class="reference">{{ liturgyData.salmo.referencia }}</div>
            <div class="refrao"><strong>{{ liturgyData.salmo.refrao }}</strong></div>
            <div class="text salmo-text">{{ liturgyData.salmo.texto }}</div>
          </div>
        </section>
        
        <section class="liturgy-section">
          <h3 class="section-title">Segunda Leitura</h3>
          <div class="section-content">
            <div class="reference">{{ liturgyData.segundaLeitura.referencia }}</div>
            <div class="title">{{ liturgyData.segundaLeitura.titulo }}</div>
            <div class="text">{{ liturgyData.segundaLeitura.texto }}</div>
          </div>
        </section>
        
        <section class="liturgy-section">
          <h3 class="section-title">Orações do Dia</h3>
          <div class="section-content prayers">
            <div class="prayer">
              <h4>Oração do Dia</h4>
              <p>{{ liturgyData.dia }}</p>
            </div>
            <div class="prayer">
              <h4>Oração das Oferendas</h4>
              <p>{{ liturgyData.oferendas }}</p>
            </div>
            <div class="prayer">
              <h4>Oração após a Comunhão</h4>
              <p>{{ liturgyData.comunhao }}</p>
            </div>
          </div>
        </section>
        
        <section class="liturgy-section">
          <h3 class="section-title">Antífonas</h3>
          <div class="section-content antifonas">
            <div class="antifona">
              <h4>Antífona de Entrada</h4>
              <p>{{ liturgyData.antifonas.entrada }}</p>
            </div>
            <div class="antifona">
              <h4>Antífona de Comunhão</h4>
              <p>{{ liturgyData.antifonas.comunhao }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.liturgy-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.liturgy-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: white;
  padding: 2rem;
  text-align: center;
}

.liturgy-title {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.liturgy-date-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-badge, .liturgy-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.date-badge {
  background-color: rgba(255, 255, 255, 0.2);
}

.liturgy-badge {
  background-color: var(--accent-color);
}

.liturgy-badge.branco {
  background-color: #f8f9fa;
  color: #333;
}

.liturgy-badge.verde {
  background-color: #28a745;
}

.liturgy-badge.vermelho {
  background-color: #dc3545;
}

.liturgy-badge.roxo {
  background-color: #6f42c1;
}

.liturgy-badge.rosa {
  background-color: #e83e8c;
}

.liturgy-sections {
  padding: 2rem;
}

.liturgy-section {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2rem;
}

.liturgy-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
}

.section-content {
  line-height: 1.7;
}

.reference {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--primary-color-dark);
}

.title {
  font-style: italic;
  margin-bottom: 1rem;
  color: #555;
}

.text {
  margin-bottom: 1rem;
  text-align: justify;
}

.refrao {
  margin: 1rem 0;
  font-size: 1.1rem;
  color: var(--primary-color);
  text-align: center;
}

.salmo-text {
  white-space: pre-line;
}

.prayers, .antifonas {
  display: grid;
  gap: 1.5rem;
}

.prayer h4, .antifona h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.error-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 3rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  .liturgy-header {
    padding: 1.5rem 1rem;
  }
  
  .liturgy-title {
    font-size: 1.8rem;
  }
  
  .liturgy-sections {
    padding: 1.5rem 1rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}
</style>
