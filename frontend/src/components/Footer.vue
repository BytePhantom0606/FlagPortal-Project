<template>
  <footer class="glass-card border-t border-dark-border mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">
            <span class="text-glow-cyan">Flag</span><span class="text-glow-magenta">Forge</span>
          </h3>
          <p class="text-gray-400">
            The ultimate CTF platform for hackers and security enthusiasts.
          </p>
        </div>
        <div>
          <h4 class="font-semibold mb-4 text-neon-cyan">Quick Links</h4>
          <ul class="space-y-2">
            <li><RouterLink to="/challenges" class="text-gray-400 hover:text-neon-cyan transition">Challenges</RouterLink></li>
            <li><RouterLink to="/scoreboard" class="text-gray-400 hover:text-neon-cyan transition">Scoreboard</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4 text-neon-magenta">Connect</h4>
          <p class="text-gray-400 text-sm">
            Built with Vue 3, Tailwind CSS, Node.js, and Prisma.
          </p>
        </div>
      </div>
      <div class="border-t border-dark-border mt-8 pt-8 text-center text-gray-500 text-sm">
        © 2025 FlagForge. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
