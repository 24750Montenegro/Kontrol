<template>
  <section class="hero">
    <!-- Badge -->
    <div class="hero-badge">
      <span class="badge-dot"></span>
      <span class="badge-text">THE FUTURE OF BUSINESS OS</span>
    </div>

    <!-- Heading -->
    <h1 class="hero-heading">
      Take control of your<br>business.
    </h1>

    <!-- Subtitle -->
    <p class="hero-subtitle">
      Manage projects, finances, marketing and communication from one<br>
      centralized platform. Designed for the ambitious.
    </p>

    <!-- CTAs -->
    <div class="hero-ctas">
      <a href="#" class="cta-primary">Start managing your business →</a>
      <a href="#" class="cta-secondary">See how it works</a>
    </div>

    <!-- Dashboard Mockup -->
    <div class="mockup-container">
      <div class="mockup-glow"></div>
      <div class="mockup-card">
        <div class="window-controls">
          <span class="wc-dot wc-red"></span>
          <span class="wc-dot wc-yellow"></span>
          <span class="wc-dot wc-green"></span>
        </div>
        <div class="mockup-body">
          <div class="mockup-sidebar">
            <p class="rt-label">REAL-TIME</p>
            <p class="rt-value">$12,402.10</p>
            <div class="rt-bars">
              <div class="rt-bar-track">
                <div class="rt-bar-fill" style="width: 72%"></div>
              </div>
              <div class="rt-bar-track">
                <div class="rt-bar-fill" style="width: 48%"></div>
              </div>
            </div>
          </div>

          <div class="mockup-main">
            <div class="m-header">
              <div class="m-header-bar"></div>
            </div>
            <div class="m-row-top">
              <div class="m-block m-large"></div>
              <div class="m-stack">
                <div class="m-block m-medium"></div>
                <div class="m-block m-medium"></div>
              </div>
            </div>
            <div class="m-row-bottom">
              <div class="m-text-lines">
                <div class="m-line m-line-long"></div>
                <div class="m-line m-line-medium"></div>
              </div>
              <div class="m-block m-wide"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="mockup-fade"></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3.5rem 2rem 0;
  overflow: hidden;
}

/* Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(201, 168, 76, 0.45);
  border-radius: 100px;
  padding: 0.38rem 0.9rem;
  margin-bottom: 2.25rem;
  background: rgba(201, 168, 76, 0.06);
}

.badge-dot {
  width: 7px;
  height: 7px;
  background: #e8921a;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #C9A84C;
}

/* Heading */
.hero-heading {
  font-family: 'Syne', 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(3.25rem, 7vw, 5.5rem);
  line-height: 1.06;
  color: #C9A84C;
  margin-bottom: 1.75rem;
  letter-spacing: -0.02em;
}

/* Subtitle */
.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.48);
  max-width: 530px;
  line-height: 1.7;
  margin-bottom: 2.75rem;
}

/* CTAs */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 4rem;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  background: #C9A84C;
  color: #0d0b08;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.93rem;
  font-weight: 600;
  padding: 0.82rem 1.8rem;
  border-radius: 100px;
  transition: background 0.2s, transform 0.15s;
}

.cta-primary:hover {
  background: #d6b55e;
  transform: translateY(-1px);
}

.cta-secondary {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.93rem;
  font-weight: 400;
  padding: 0.82rem 1.8rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transition: border-color 0.2s, color 0.2s;
}

.cta-secondary:hover {
  border-color: rgba(255, 255, 255, 0.38);
  color: #fff;
}

/* Dashboard Mockup */
.mockup-container {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.mockup-glow {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 70px;
  background: rgba(201, 168, 76, 0.22);
  border-radius: 50%;
  filter: blur(38px);
  pointer-events: none;
  z-index: 1;
}

.mockup-card {
  position: relative;
  z-index: 2;
  background: #161310;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.1rem 1.25rem 1.25rem;
  overflow: hidden;
}

.window-controls {
  display: flex;
  gap: 6px;
  margin-bottom: 1rem;
}

.wc-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wc-red    { background: #ff5f57; }
.wc-yellow { background: #febc2e; }
.wc-green  { background: #28c840; }

.mockup-body {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

/* Sidebar */
.mockup-sidebar {
  width: 190px;
  flex-shrink: 0;
  padding-right: 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.rt-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.rt-value {
  font-family: 'Inter', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  margin-bottom: 1.4rem;
}

.rt-bars {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.rt-bar-track {
  height: 7px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.rt-bar-fill {
  height: 100%;
  background: rgba(201, 168, 76, 0.32);
  border-radius: 4px;
}

/* Main area */
.mockup-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
}

.m-header {
  margin-bottom: 0.1rem;
}

.m-header-bar {
  height: 9px;
  width: 52%;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 5px;
}

.m-row-top {
  display: flex;
  gap: 0.6rem;
}

.m-stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.m-block {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  flex-shrink: 0;
}

.m-large {
  width: 42%;
  aspect-ratio: 1 / 1;
}

.m-medium {
  flex: 1;
  min-height: 56px;
}

.m-row-bottom {
  display: flex;
  gap: 0.6rem;
  align-items: flex-end;
}

.m-text-lines {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 32%;
  padding-bottom: 0.2rem;
}

.m-line {
  height: 7px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.m-line-long   { width: 100%; }
.m-line-medium { width: 62%; }

.m-wide {
  flex: 1;
  height: 88px;
}

/* Bottom fade-out */
.mockup-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(to top, #0d0b08 0%, transparent 100%);
  pointer-events: none;
  z-index: 3;
  border-radius: 0 0 16px 16px;
}
</style>
