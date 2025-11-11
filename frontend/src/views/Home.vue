<template>
  <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <section class="text-center py-20">
      <h1 class="text-6xl font-bold mb-6">
        <span class="text-glow-cyan">Welcome to</span>
        <br>
        <span class="text-glow-magenta text-7xl">FlagForge</span>
      </h1>
      <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        The ultimate Capture The Flag platform for hackers and cybersecurity enthusiasts.
        Solve challenges, earn points, and climb the leaderboard!
      </p>
      <div class="flex justify-center space-x-4">
        <RouterLink to="/challenges" class="btn-neon">
          View Challenges
        </RouterLink>
        <RouterLink to="/scoreboard" class="btn-neon-outline">
          Scoreboard
        </RouterLink>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 py-12">
      <div class="glass-card p-6 text-center">
        <div class="text-4xl font-bold text-neon-cyan mb-2">{{ stats.challenges }}</div>
        <div class="text-gray-400">Challenges</div>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl font-bold text-neon-magenta mb-2">{{ stats.users }}</div>
        <div class="text-gray-400">Hackers</div>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl font-bold text-neon-purple mb-2">{{ stats.solves }}</div>
        <div class="text-gray-400">Solves</div>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl font-bold text-neon-green mb-2">{{ stats.points }}</div>
        <div class="text-gray-400">Total Points</div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-12">
      <h2 class="text-3xl font-bold text-center mb-12 text-glow-cyan">Challenge Categories</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="category in categories" :key="category.name" class="glass-card-hover p-6">
          <div class="text-3xl mb-4">{{ category.icon }}</div>
          <h3 class="text-xl font-bold mb-2">{{ category.name }}</h3>
          <p class="text-gray-400">{{ category.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  challenges: 5,
  users: 0,
  solves: 0,
  points: 675,
})

const categories = [
  {
    name: 'Web Exploitation',
    icon: '🌐',
    description: 'SQL injection, XSS, CSRF, and web vulnerabilities',
  },
  {
    name: 'Binary Exploitation',
    icon: '💥',
    description: 'Buffer overflows, ROP chains, and pwning binaries',
  },
  {
    name: 'Cryptography',
    icon: '🔐',
    description: 'Classical and modern cryptography challenges',
  },
  {
    name: 'Reverse Engineering',
    icon: '🔍',
    description: 'Analyze binaries and understand their behavior',
  },
  {
    name: 'Forensics',
    icon: '🔬',
    description: 'Memory dumps, packet captures, and digital forensics',
  },
  {
    name: 'Miscellaneous',
    icon: '🎯',
    description: 'OSINT, steganography, and other unique challenges',
  },
]
</script>
