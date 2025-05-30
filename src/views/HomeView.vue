<script setup>
import { ref, onMounted, inject } from 'vue'

const liturgyData = ref(null)
const loading = ref(true)
const error = ref(null)

// Injetar o tema atual do componente pai
const isDarkTheme = inject('isDarkTheme', ref(false))

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
    // Tentar usar dados de fallback em caso de erro
    useFallbackData()
  } finally {
    loading.value = false
  }
}

// Função para usar dados de fallback quando a API falha
const useFallbackData = () => {
  // Dados estáticos para garantir que sempre haja conteúdo
  liturgyData.value = {
    data: new Date().toLocaleDateString('pt-BR'),
    liturgia: 'Conteúdo Offline',
    cor: 'verde',
    evangelho: {
      referencia: 'João 3:16',
      titulo: 'Deus amou o mundo de tal maneira',
      texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.'
    },
    primeiraLeitura: {
      referencia: 'Gênesis 1:1',
      titulo: 'No princípio',
      texto: 'No princípio, Deus criou os céus e a terra. A terra era sem forma e vazia; e havia trevas sobre a face do abismo, mas o Espírito de Deus pairava sobre a face das águas.'
    },
    salmo: {
      referencia: 'Salmo 23',
      refrao: 'O Senhor é meu pastor, nada me faltará.',
      texto: 'O SENHOR é o meu pastor, nada me faltará.\nDeitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.\nRefrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.'
    },
    segundaLeitura: {
      referencia: '1 Coríntios 13:4-7',
      titulo: 'O amor',
      texto: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor. O amor não se alegra com a injustiça, mas se alegra com a verdade. Tudo sofre, tudo crê, tudo espera, tudo suporta.'
    },
    dia: 'Senhor nosso Deus, concedei-nos a graça de viver no teu amor todos os dias de nossa vida.',
    oferendas: 'Aceitai, ó Deus, as oferendas do vosso povo, para que possamos conseguir por este sacramento o que proclamamos pela fé.',
    comunhao: 'Alimentados com o Corpo e o Sangue de vosso Filho, nós vos suplicamos, ó Deus: dai-nos comungar de tal modo no Espírito Santo que sejamos em Cristo um só corpo e um só espírito.',
    antifonas: {
      entrada: 'Vinde, adoremos a Deus, prostrados o aclamemos, diante do Senhor que nos criou, pois ele é o nosso Deus.',
      comunhao: 'Felizes os que têm puro o coração, porque eles verão a Deus! Felizes os que promovem a paz, porque serão chamados filhos de Deus! Felizes os que são perseguidos por causa da justiça, porque deles é o Reino dos céus!'
    }
  }
}

onMounted(() => {
  fetchLiturgyData()
})
</script>

<template>
  <div class="home-container">
    <!-- Conteúdo estático sempre visível para garantir que a página tenha conteúdo valioso -->
    <div class="static-content">
      <h1>Bíblia Online</h1>
      <p>Bem-vindo ao nosso site de leitura da Bíblia. Aqui você pode ler a Bíblia Sagrada, acompanhar a liturgia do dia e marcar seu progresso de leitura.</p>
      
      <div class="features-section">
        <div class="feature-card">
          <h3>Leitura da Bíblia</h3>
          <p>Acesse todos os livros da Bíblia Sagrada em português, com interface intuitiva e de fácil navegação.</p>
        </div>
        <div class="feature-card">
          <h3>Liturgia Diária</h3>
          <p>Acompanhe as leituras e orações da liturgia católica do dia, atualizada diariamente.</p>
        </div>
        <div class="feature-card">
          <h3>Progresso de Leitura</h3>
          <p>Acompanhe seu progresso de leitura e continue de onde parou em qualquer dispositivo.</p>
        </div>
      </div>
    </div>
    
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
  padding: 0;
  width: 100%;
}

.static-content {
  background-color: var(--card-background);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: background-color 0.3s ease;
}

.static-content h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.static-content > p {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.05), rgba(var(--primary-color-rgb), 0.1));
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--accent-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-card p {
  line-height: 1.6;
  color: var(--text-color);
}

.liturgy-container {
  background-color: var(--card-background);
  overflow: hidden;
  transition: background-color 0.3s ease;
  width: 100%;
}

.liturgy-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: var(--light-text);
  padding: 2rem;
  text-align: center;
  transition: background 0.3s ease;
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
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
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
  color: var(--text-color);
  opacity: 0.8;
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
  background-color: var(--card-background);
  padding: 3rem;
  text-align: center;
  transition: background-color 0.3s ease;
  max-width: 800px;
  margin: 2rem auto;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: var(--primary-color);
  color: var(--light-text);
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
  .liturgy-header {
    padding: 1.25rem 1rem;
  }
  
  .liturgy-title {
    font-size: 1.8rem;
  }
  
  .liturgy-sections {
    padding: 1.25rem 1rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}
</style>
