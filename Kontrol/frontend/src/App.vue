<script setup>
import TheNavbar from './components/TheNavbar.vue'
import TheHero from './components/TheHero.vue'
</script>

<template>
  <div class="landing">
    <TheNavbar />
    <TheHero />
  </div>
</template>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #0d0b08;
  color: #fff;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

.landing {
  min-height: 100vh;
  background: radial-gradient(ellipse 90% 55% at 50% -5%, #2c1d04 0%, #0d0b08 58%);
}
</style>
