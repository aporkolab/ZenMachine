# 🚀 Deployment Guide

This guide covers all deployment scenarios for the ZenMachine application, from local development to production enterprise environments.

## Table of Contents
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Local Development
```bash
# Clone and setup
git clone https://github.com/yourusername/zenmachine.git
cd zenmachine

# Install dependencies
npm install

# Start development server
npm run start

# Open browser to http://localhost:4200
```

### Docker Quick Start
```bash
# Development
docker-compose up zenmachine-dev

# Production
docker-compose up zenmachine-prod
```

## Development Environment

### Prerequisites
- **Node.js**: 20.11+ (LTS recommended)
- **npm**: 10+
- **Angular CLI**: 20+
- **Git**: Latest version
- **Docker**: 20+ (optional)

### Setup Steps

1. **Environment Setup**
   ```bash
   # Install Node.js via nvm (recommended)
   nvm install 20.11
   nvm use 20.11
   
   # Install Angular CLI globally
   npm install -g @angular/cli@20
   ```

2. **Project Installation**
   ```bash
   git clone <repository-url>
   cd zenmachine
   npm install
   ```

3. **Development Scripts**
   ```bash
   # Start development server
   npm run start
   
   # Run tests
   npm run test:all
   
   # Lint and format code
   npm run lint:fix
   npm run prettier
   
   # Build for production
   npm run build:prod
   ```

### Development Tools

- **Hot Module Replacement**: Enabled by default
- **Source Maps**: Available in development mode
- **Debugging**: VS Code configuration included
- **Testing**: Watch mode available with `npm run test:unit:watch`

## Production Deployment

### Build Process

1. **Production Build**
   ```bash
   npm run build:prod
   ```
   
   This creates optimized bundles in `dist/` with:
   - Tree-shaking for smaller bundles
   - Minification and compression
   - Source maps for debugging
   - Service worker for caching

2. **Build Analysis**
   ```bash
   npm run analyze
   ```
   
   Generates bundle analysis report for optimization insights.

### Static File Hosting

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zenmachine;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/zenmachine
    
    # Enable mod_rewrite
    RewriteEngine On
    
    # Handle Angular routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

## Docker Deployment

### Single Container
```bash
# Build production image
docker build -f Dockerfile.prod -t zenmachine:latest .

# Run container
docker run -p 80:8080 zenmachine:latest
```

### Multi-Container with Docker Compose

#### Development
```bash
docker-compose -f docker-compose.yml up zenmachine-dev
```

#### Production
```bash
docker-compose -f docker-compose.yml up zenmachine-prod
```

#### Full Stack with Reverse Proxy
```bash
docker-compose up
```

This starts:
- ZenMachine application
- Nginx reverse proxy
- Redis cache
- Traefik load balancer

### Docker Configuration Files

#### Dockerfile.prod
- Multi-stage build for minimal image size
- Security hardening with non-root user
- Health checks included
- Alpine Linux base for security

#### docker-compose.yml
- Development and production services
- Networking configuration
- Volume management
- Health checks and restart policies

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3+ (optional)

### Basic Deployment

1. **Create Namespace**
   ```bash
   kubectl create namespace zenmachine
   ```

2. **Deploy Application**
   ```bash
   kubectl apply -f k8s/
   ```

### Kubernetes Resources

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zenmachine
  namespace: zenmachine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zenmachine
  template:
    metadata:
      labels:
        app: zenmachine
    spec:
      containers:
      - name: zenmachine
        image: zenmachine:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: zenmachine-service
  namespace: zenmachine
spec:
  selector:
    app: zenmachine
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zenmachine-ingress
  namespace: zenmachine
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: zenmachine.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: zenmachine-service
            port:
              number: 80
```

## CI/CD Pipeline

### GitHub Actions Workflow

The included `.github/workflows/ci.yml` provides:

1. **Security Audit**
   - npm audit
   - Vulnerability scanning
   - License compliance

2. **Code Quality**
   - ESLint analysis
   - Prettier formatting check
   - TypeScript compilation
   - SonarCloud analysis

3. **Testing**
   - Unit tests with coverage
   - Integration tests
   - E2E tests with Playwright
   - Performance tests with Lighthouse

4. **Build & Package**
   - Production build
   - Docker image creation
   - Multi-architecture support
   - Image scanning

5. **Deployment**
   - Staging deployment
   - Production deployment
   - Smoke tests
   - Rollback capability

### Pipeline Configuration

#### Required Secrets
```bash
# GitHub repository secrets
GITHUB_TOKEN=<automatic>
SONAR_TOKEN=<sonarcloud-token>
SNYK_TOKEN=<snyk-token>
LHCI_GITHUB_APP_TOKEN=<lighthouse-token>
SLACK_WEBHOOK=<slack-webhook-url>
```

#### Environment Protection Rules
- **Staging**: Automatic deployment on `develop` branch
- **Production**: Manual approval required, `main` branch only

## Environment Configuration

### Environment Files

#### Development (.env.development)
```properties
NODE_ENV=development
API_BASE_URL=http://localhost:3000
ENABLE_DEBUG=true
ENABLE_MONITORING=false
```

#### Production (.env.production)
```properties
NODE_ENV=production
API_BASE_URL=https://api.yourdomain.com
ENABLE_DEBUG=false
ENABLE_MONITORING=true
SENTRY_DSN=your-sentry-dsn
```

### Angular Environment Configuration

#### src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  monitoring: {
    enabled: false,
    sentry: {
      dsn: '',
    },
  },
  security: {
    enableCSP: true,
    allowedDomains: ['localhost:4200', 'api.jamendo.com'],
  },
};
```

## Performance Optimization

### Bundle Optimization
- **Lazy Loading**: Route-based code splitting
- **Tree Shaking**: Removes unused code
- **Compression**: Gzip and Brotli support
- **Caching**: Aggressive caching strategy

### Monitoring
- **Web Vitals**: Core performance metrics
- **Error Tracking**: Real-time error reporting
- **User Analytics**: Behavioral insights
- **Performance Budget**: Automated performance checks

## Security Considerations

### Content Security Policy
```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline' fonts.googleapis.com; 
  img-src 'self' data: api.picsum.photos;
  connect-src 'self' api.jamendo.com;
```

### Security Headers
- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables XSS filtering

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
npm ci
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 20.11+
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Docker Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f Dockerfile.prod -t zenmachine:latest .
```

### Performance Debugging
```bash
# Analyze bundle size
npm run analyze

# Run Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:4200 --output html --output-path ./lighthouse-report.html
```

### Security Testing
```bash
# Run security audit
npm audit

# Test with OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://your-app-url
```

## Monitoring and Maintenance

### Health Checks
- **Application**: `/health` endpoint
- **Dependencies**: API connectivity checks
- **Performance**: Response time monitoring
- **Security**: Vulnerability scanning

### Backup Strategy
- **Code**: Git repository with multiple remotes
- **Configuration**: Infrastructure as Code
- **Data**: LocalStorage export functionality
- **Assets**: CDN with versioning

### Update Strategy
- **Dependencies**: Automated updates via Dependabot
- **Security Patches**: Immediate deployment
- **Feature Updates**: Staged rollout
- **Rollback Plan**: Blue-green deployment ready

---

For additional support or questions, please refer to the [Architecture Documentation](./ARCHITECTURE.md) or open an issue in the repository.