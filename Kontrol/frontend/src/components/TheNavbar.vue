<template>
  <nav class="nav-outer">
    <div class="nav-inner">
      <a href="#" class="nav-logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z" fill="#C9A84C" opacity="0.9"/>
          <path d="M9 12L11 14L15 10" stroke="#0d0b08" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">KONTROL</span>
      </a>

      <ul class="nav-links">
        <li><a href="#">Features</a></li>
        <li><a href="#">How it works</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">About</a></li>
      </ul>

      <div class="nav-actions">
        <a href="#" class="nav-login">Login</a>
        <a href="#" class="nav-cta">Get Started</a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-outer {
  width: 100%;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 0.55rem 0.55rem 0.55rem 1.5rem;
  background: rgba(15, 13, 9, 0.5);
  backdrop-filter: blur(12px);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.logo-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.12em;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2.25rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #fff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-login {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  padding: 0.55rem 1.1rem;
  transition: color 0.2s;
}

.nav-login:hover {
  color: #fff;
}

.nav-cta {
  background: #C9A84C;
  color: #0d0b08;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1.35rem;
  border-radius: 100px;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.nav-cta:hover {
  background: #d6b55e;
  transform: translateY(-1px);
}
</style>
