# 🧘 Zen Machine - Enterprise Audio Relaxation Platform

<p align="center">
  <a href="https://angular.dev/"><img height="20" src="https://img.shields.io/badge/built_with-Angular_20-dd0031.svg?logo=angular" alt="Built with Angular"></a>
  <a href="https://www.typescriptlang.org/"><img height="20" src="https://img.shields.io/badge/built_with-TypeScript_5.9-3178c6.svg?logo=typescript" alt="Built with TypeScript"></a>
  <a href="https://material.angular.io/"><img height="20" src="https://img.shields.io/badge/built_with-Angular_Material-ff4081.svg?logo=angular" alt="Built with Angular Material"></a>
  <a href="https://docker.com/"><img height="20" src="https://img.shields.io/badge/containerized-Docker-2496ed.svg?logo=docker" alt="Docker"></a>
  <a href="https://github.com/features/actions"><img height="20" src="https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088ff.svg?logo=github-actions" alt="GitHub Actions"></a>
  <a href="https://www.sonarcloud.io/"><img height="20" src="https://img.shields.io/badge/quality-SonarCloud-f3702a.svg?logo=sonarcloud" alt="SonarCloud"></a>
  <a href="https://playwright.dev/"><img height="20" src="https://img.shields.io/badge/testing-Playwright-45ba4b.svg?logo=playwright" alt="Playwright"></a>
  <a href="./LICENSE"><img height="20" src="https://img.shields.io/badge/license-CC_BY--NC--SA_4.0-blue.svg?logo=creative-commons" alt="License"></a>
</p>

**Zen Machine** is an enterprise-grade, web-based audio relaxation platform built with modern Angular architecture. This application demonstrates senior+++ level software engineering practices including comprehensive CI/CD pipelines, automated testing, security hardening, performance optimization, and monitoring.

## 🎯 Project Overview

Zen Machine transforms the way users create personalized audio environments through:
- **Advanced Web Audio API** integration for professional-grade audio processing
- **Real-time Visualization** with interactive audio analysis
- **Cloud Integration** with external APIs for dynamic content
- **Enterprise Security** with CSP, XSS protection, and threat monitoring
- **Production-Ready Infrastructure** with Docker, monitoring, and observability

**Author**: [Adam Dr. Porkolab (APorkolab)](https://www.adamporkolab.hu)
**Architecture Level**: Senior+++ Enterprise Application

## 🚀 Enterprise Features

### 🎵 Advanced Audio Engine
- **Professional Web Audio API** processing with real-time effects
- **3-Band Equalizer** (Bass, Mid, Treble) with precise frequency control
- **Stereo Panning** for immersive spatial audio experience
- **Dynamic Playback Rate** adjustment with buffer management
- **Loop Control** with seamless audio transitions
- **Master Volume Control** with gain staging

### 📊 Real-time Analytics & Monitoring
- **Audio Visualization** with FFT analysis and waveform display
- **Performance Metrics** tracking with Web Vitals integration
- **Error Monitoring** with automatic reporting and alerting
- **User Analytics** with event tracking and behavioral analysis
- **Security Monitoring** with threat detection and CSP reporting

### 🔒 Enterprise Security
- **Content Security Policy** (CSP) with violation reporting
- **XSS Protection** with input sanitization and validation
- **Rate Limiting** to prevent abuse and DDoS attacks
- **Security Headers** (HSTS, X-Frame-Options, etc.)
- **Integrity Monitoring** for script injection detection

### 🌍 Cloud Integration
- **Jamendo API** integration for dynamic music streaming
- **Picsum Photos API** for randomized background imagery
- **CDN Support** for optimized asset delivery
- **External API Security** with domain whitelisting

### 📱 Modern UX/UI
- **Material Design 3** with custom theming
- **Dark Mode** with system preference detection
- **Responsive Design** optimized for all devices
- **Progressive Web App** (PWA) capabilities
- **Accessibility** (a11y) compliant with WCAG guidelines

### ⚙️ Data Management
- **LocalStorage Integration** for settings persistence
- **State Management** with RxJS observables
- **Preset Management** for user configurations
- **Import/Export** functionality for user data

## 🏢 Enterprise Architecture

### Frontend Stack
- **Angular 20** - Modern component-based architecture
- **TypeScript 5.9** - Type-safe development with strict mode
- **Angular Material 20** - Enterprise UI component library
- **RxJS 7.8** - Reactive programming and state management
- **Web Audio API** - Professional audio processing

### Development & DevOps
- **Docker** - Containerized deployment with multi-stage builds
- **GitHub Actions** - Comprehensive CI/CD pipeline
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for automated checks
- **SonarCloud** - Static code analysis and quality gates

### Testing Strategy
- **Unit Tests** - Jasmine + Karma for component testing
- **Integration Tests** - Jest for service integration
- **E2E Tests** - Playwright for cross-browser testing
- **Performance Tests** - Lighthouse CI for optimization
- **Load Tests** - K6 for scalability testing
- **Security Tests** - Automated vulnerability scanning

### Monitoring & Observability
- **Error Tracking** - Real-time error monitoring and alerting
- **Performance Monitoring** - Core Web Vitals and custom metrics
- **User Analytics** - Behavioral tracking and insights
- **Security Monitoring** - Threat detection and reporting
- **Logging** - Structured logging with correlation IDs

## 🚀 Getting Started

### Prerequisites
- [Node.js and npm](https://nodejs.org/en/)
- [Angular CLI](https://angular.io/cli)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zen-machine.git
   ```
2. Navigate to the project directory:
   ```bash
   cd zen-machine
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Development Server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the `ISSUES` page if you want to contribute.

## 📜 License

Zen Machine is licensed under the [CC BY-NC-SA 4.0 DEED](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en) License. For more info please visit the https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en page.
