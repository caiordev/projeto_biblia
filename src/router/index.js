import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BooksView from '../views/BooksView.vue'
import ChaptersView from '../views/ChaptersView.vue'
import ReaderView from '../views/ReaderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/biblia',
      name: 'books',
      component: BooksView
    },
    {
      path: '/livro/:book',
      name: 'chapters',
      component: ChaptersView
    },
    {
      path: '/livro/:book/capitulo/:chapter',
      name: 'reader',
      component: ReaderView
    },
    // Redirecionar qualquer rota não encontrada para a página inicial
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
