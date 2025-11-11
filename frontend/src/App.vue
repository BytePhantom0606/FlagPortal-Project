<template>
  <div id="app" class="min-h-screen flex flex-col">
    <Header v-if="!hideHeader" />

    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer v-if="!hideFooter" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()
const authStore = useAuthStore()

// Hide header/footer on certain routes
const hideHeader = computed(() => route.meta.hideHeader || false)
const hideFooter = computed(() => route.meta.hideFooter || false)

// Initialize app
onMounted(async () => {
  // Try to restore session if token exists
  if (authStore.isAuthenticated) {
    await authStore.fetchCurrentUser()
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
