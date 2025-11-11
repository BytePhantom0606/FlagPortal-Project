<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8 text-glow-magenta">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="glass-card p-6">
        <h3 class="text-gray-400 text-sm mb-2">Total Users</h3>
        <p class="text-3xl font-bold text-neon-cyan">{{ stats.users }}</p>
      </div>
      <div class="glass-card p-6">
        <h3 class="text-gray-400 text-sm mb-2">Total Challenges</h3>
        <p class="text-3xl font-bold text-neon-magenta">{{ stats.challenges }}</p>
      </div>
      <div class="glass-card p-6">
        <h3 class="text-gray-400 text-sm mb-2">Total Submissions</h3>
        <p class="text-3xl font-bold text-neon-purple">{{ stats.submissions }}</p>
      </div>
    </div>

    <div class="glass-card p-8">
      <h2 class="text-2xl font-bold mb-6">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RouterLink to="/admin/challenges" class="btn-neon-outline text-center">
          Manage Challenges
        </RouterLink>
        <RouterLink to="/admin/users" class="btn-neon-outline text-center">
          Manage Users
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  users: 0,
  challenges: 5,
  submissions: 0,
})
</script>
