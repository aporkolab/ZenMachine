# 🏗️ Architecture Documentation

This document provides a comprehensive overview of the ZenMachine application architecture, designed following enterprise-level software engineering principles.

## Table of Contents
- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Frontend Architecture](#frontend-architecture)
- [Component Architecture](#component-architecture)
- [Service Layer](#service-layer)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)
- [Testing Architecture](#testing-architecture)
- [DevOps Architecture](#devops-architecture)
- [Scalability Considerations](#scalability-considerations)

## System Overview

ZenMachine is a modern, enterprise-grade Angular application following Domain-Driven Design (DDD) principles with a focus on maintainability, scalability, and performance.

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│                    User Interface                   │
│              (Angular Material + PWA)               │
├─────────────────────────────────────────────────────┤
│                 Component Layer                     │
│        (Smart/Dumb Components Pattern)             │
├─────────────────────────────────────────────────────┤
│                  Service Layer                      │
│    (Business Logic + External API Integration)     │
├─────────────────────────────────────────────────────┤
│                  Core Services                      │
│  (Audio Engine + Security + Monitoring + State)    │
├─────────────────────────────────────────────────────┤
│                External Services                    │
│        (Web Audio API + External APIs)             │
└─────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Separation of Concerns
- **Components**: UI logic and presentation only
- **Services**: Business logic and data management
- **Models**: Data structures and interfaces
- **Utils**: Shared utilities and helpers

### 2. Single Responsibility Principle
Each class, component, and service has one reason to change:
- `AudioService`: Audio processing and management
- `SecurityService`: Security monitoring and enforcement
- `MonitoringService`: Application telemetry and analytics
- `ApiService`: External API communication

### 3. Dependency Injection
Angular's DI container manages all dependencies:
```typescript
@Injectable({ providedIn: 'root' })
export class AudioService {
  private monitoring = inject(MonitoringService);
  private security = inject(SecurityService);
}
```

### 4. Reactive Programming
RxJS observables for state management and async operations:
```typescript
public readonly activeSounds$ = this.activeSoundsSubject.asObservable();
public readonly masterVolume$ = this.masterVolumeSubject.asObservable();
```

## Frontend Architecture

### Component Hierarchy
```
AppComponent
├── ZenPadComponent (Smart Component)
│   ├── VisualizerComponent (Dumb Component)
│   ├── PresetManagerComponent (Smart Component)
│   └── AudioControlsComponent (Dumb Component)
└── FooterComponent (Dumb Component)
```

### Smart vs Dumb Components Pattern

#### Smart Components (Container Components)
- Manage state and business logic
- Communicate with services
- Handle complex user interactions
- Examples: `ZenPadComponent`, `PresetManagerComponent`

#### Dumb Components (Presentational Components)
- Pure presentation logic
- Receive data via `@Input()`
- Emit events via `@Output()`
- Examples: `VisualizerComponent`, `FooterComponent`

### State Management Strategy

#### Local State
- Component-level state for UI-specific data
- Uses Angular's reactive forms where appropriate

#### Shared State
- Service-level BehaviorSubjects for cross-component communication
- Immutable state updates following Redux patterns

```typescript
// State management example
private activeSoundsSubject = new BehaviorSubject<ActiveSound[]>([]);
public readonly activeSounds$ = this.activeSoundsSubject.asObservable();

private updateActiveSounds() {
  const newState = [...this.computeActiveSounds()];
  this.activeSoundsSubject.next(newState);
}
```

## Component Architecture

### Component Lifecycle
```typescript
export class ZenPadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.setupSubscriptions();
    this.initializeAudio();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupResources();
  }
  
  private setupSubscriptions() {
    this.audioService.activeSounds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sounds => this.handleSoundsUpdate(sounds));
  }
}
```

### Component Communication

#### Parent → Child
```typescript
// Parent Component
<app-visualizer 
  [audioData]="audioData$ | async"
  [isEnabled]="audioEnabled">
</app-visualizer>

// Child Component
@Input() audioData: Float32Array | null = null;
@Input() isEnabled: boolean = false;
```

#### Child → Parent
```typescript
// Child Component
@Output() volumeChange = new EventEmitter<number>();

onVolumeChange(value: number) {
  this.volumeChange.emit(value);
}

// Parent Component
<app-audio-controls 
  (volumeChange)="handleVolumeChange($event)">
</app-audio-controls>
```

#### Service-Mediated Communication
```typescript
// Service acts as communication hub
@Injectable()
export class AudioService {
  private volumeSubject = new BehaviorSubject<number>(1);
  public readonly volume$ = this.volumeSubject.asObservable();
  
  setVolume(volume: number) {
    this.volumeSubject.next(volume);
  }
}
```

## Service Layer

### Service Architecture Pattern
```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                  │
│                   (Components)                      │
├─────────────────────────────────────────────────────┤
│                 Application Layer                   │
│              (Feature Services)                     │
├─────────────────────────────────────────────────────┤
│                  Domain Layer                       │
│               (Core Services)                       │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                  │
│            (External APIs, Storage)                 │
└─────────────────────────────────────────────────────┘
```

### Core Services

#### AudioService
**Responsibility**: Web Audio API management and audio processing
```typescript
@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx?: AudioContext;
  private masterGainNode?: GainNode;
  private analyser?: AnalyserNode;
  
  // Audio graph creation and management
  init(): void
  loadSound(url: string): Promise<AudioBuffer>
  playSound(name: string, path: string, buffer: AudioBuffer): void
  
  // Real-time audio control
  setMasterVolume(volume: number): void
  setEQ(type: 'bass' | 'mid' | 'treble', value: number): void
  setPan(pan: number): void
}
```

#### SecurityService
**Responsibility**: Application security and threat detection
```typescript
@Injectable({ providedIn: 'root' })
export class SecurityService {
  // Input validation and sanitization
  sanitizeInput(input: string): string
  validateInput(input: string, pattern?: RegExp): boolean
  
  // Security monitoring
  checkURLSafety(url: string): boolean
  checkRateLimit(action: string, maxAttempts: number): boolean
  
  // CSP and security headers
  generateCSP(): string
}
```

#### MonitoringService
**Responsibility**: Application telemetry and analytics
```typescript
@Injectable({ providedIn: 'root' })
export class MonitoringService {
  // Error tracking
  logError(error: Partial<ErrorInfo>): void
  
  // Performance monitoring
  trackMetric(name: string, value: number): void
  timeStart(name: string): void
  timeEnd(name: string): void
  
  // User analytics
  trackEvent(event: string, properties: Record<string, any>): void
  trackPageView(url: string): void
}
```

### Service Integration Pattern
```typescript
export class AudioService {
  private monitoring = inject(MonitoringService);
  private security = inject(SecurityService);
  
  async loadSound(url: string): Promise<AudioBuffer> {
    // Security check
    if (!this.security.checkURLSafety(url)) {
      throw new Error('Unsafe URL detected');
    }
    
    // Performance monitoring
    this.monitoring.timeStart('sound-loading');
    
    try {
      const buffer = await this.performSoundLoading(url);
      this.monitoring.trackEvent('sound-loaded', { url });
      return buffer;
    } catch (error) {
      this.monitoring.logError({ message: `Failed to load sound: ${url}` });
      throw error;
    } finally {
      this.monitoring.timeEnd('sound-loading');
    }
  }
}
```

## Data Flow

### Unidirectional Data Flow
```
User Action → Component → Service → State Update → UI Update
```

### Example: Volume Control Flow
```typescript
// 1. User interaction
onVolumeChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  
  // 2. Service call
  this.audioService.setMasterVolume(Number(value));
}

// 3. Service updates state
setMasterVolume(volume: number) {
  // 4. Security validation
  if (!this.security.validateInput(volume.toString())) return;
  
  // 5. State update
  this.masterVolumeSubject.next(volume);
  
  // 6. Audio API call
  if (this.masterGainNode) {
    this.masterGainNode.gain.value = volume;
  }
  
  // 7. Analytics tracking
  this.monitoring.trackEvent('volume-changed', { volume });
}

// 8. Component receives update
ngOnInit() {
  this.audioService.masterVolume$
    .pipe(takeUntil(this.destroy$))
    .subscribe(volume => {
      // 9. UI update
      this.currentVolume = volume;
    });
}
```

### Error Handling Flow
```typescript
// Global error handling
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // 1. Log to monitoring service
    this.monitoring.logError(error);
    
    // 2. Security check for suspicious errors
    if (this.security.isSuspiciousError(error)) {
      this.security.reportThreat(error);
    }
    
    // 3. User notification (if appropriate)
    this.notificationService.showError('An unexpected error occurred');
  }
}
```

## Security Architecture

### Multi-Layer Security Approach
```
┌─────────────────────────────────────────────────────┐
│              Network Security                       │
│        (HTTPS, CSP Headers, CORS)                  │
├─────────────────────────────────────────────────────┤
│            Application Security                     │
│     (Input Validation, XSS Protection)             │
├─────────────────────────────────────────────────────┤
│             Client Security                         │
│    (CSP Violations, Integrity Monitoring)          │
├─────────────────────────────────────────────────────┤
│           Monitoring & Response                     │
│      (Threat Detection, Rate Limiting)             │
└─────────────────────────────────────────────────────┘
```

### Content Security Policy Implementation
```typescript
generateCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: api.picsum.photos",
    "connect-src 'self' api.jamendo.com",
    "frame-src 'none'",
    "object-src 'none'"
  ].join('; ');
}
```

### Input Validation Architecture
```typescript
// Multi-level validation
class SecurityService {
  validateInput(input: string, pattern?: RegExp): boolean {
    // 1. Length validation
    if (input.length > this.config.maxInputLength) return false;
    
    // 2. XSS pattern detection
    if (this.hasXSSPatterns(input)) return false;
    
    // 3. Custom pattern validation
    if (pattern && !pattern.test(input)) return false;
    
    return true;
  }
}
```

## Performance Architecture

### Loading Strategy
```
┌─────────────────────────────────────────────────────┐
│                Initial Load                         │
│            (Critical Resources)                     │
├─────────────────────────────────────────────────────┤
│                 Lazy Loading                        │
│            (Feature Modules)                        │
├─────────────────────────────────────────────────────┤
│              Background Loading                     │
│              (Audio Assets)                         │
├─────────────────────────────────────────────────────┤
│                 On-Demand                           │
│            (Dynamic Content)                        │
└─────────────────────────────────────────────────────┘
```

### Bundle Optimization
```typescript
// Lazy loading implementation
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

// Tree-shaking optimization
// Only import what's needed
import { map, filter, takeUntil } from 'rxjs/operators';
```

### Performance Monitoring
```typescript
// Web Vitals tracking
private trackWebVitals() {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    this.trackMetric('largest_contentful_paint', lastEntry.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    this.trackMetric('cumulative_layout_shift', clsValue);
  }).observe({ type: 'layout-shift', buffered: true });
}
```

## Testing Architecture

### Testing Pyramid
```
┌─────────────────────────────────────────────────────┐
│                      E2E                            │
│                 (Playwright)                        │
│                   10-20%                            │
├─────────────────────────────────────────────────────┤
│                 Integration                         │
│                   (Jest)                            │
│                   20-30%                            │
├─────────────────────────────────────────────────────┤
│                    Unit                             │
│              (Jasmine/Karma)                        │
│                   60-70%                            │
└─────────────────────────────────────────────────────┘
```

### Test Organization
```
src/
├── app/
│   ├── services/
│   │   ├── audio.service.ts
│   │   └── audio.service.spec.ts        # Unit tests
│   └── components/
│       ├── zen-pad/
│       │   ├── zen-pad.component.ts
│       │   └── zen-pad.component.spec.ts # Unit tests
tests/
├── integration/
│   └── audio-service.integration.spec.ts  # Integration tests
├── e2e/
│   └── zen-pad.e2e.spec.ts               # E2E tests
└── smoke/
    └── app.smoke.spec.ts                  # Smoke tests
```

### Testing Strategies

#### Unit Testing
```typescript
describe('AudioService', () => {
  let service: AudioService;
  let mockMonitoring: jasmine.SpyObj<MonitoringService>;
  
  beforeEach(() => {
    const monitoringSpy = jasmine.createSpyObj('MonitoringService', ['trackEvent']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: MonitoringService, useValue: monitoringSpy }
      ]
    });
    
    service = TestBed.inject(AudioService);
    mockMonitoring = TestBed.inject(MonitoringService) as jasmine.SpyObj<MonitoringService>;
  });
  
  it('should track volume changes', () => {
    service.setMasterVolume(0.5);
    
    expect(mockMonitoring.trackEvent).toHaveBeenCalledWith(
      'volume-changed', 
      { volume: 0.5 }
    );
  });
});
```

#### E2E Testing
```typescript
test('should enable audio and play sound', async ({ page }) => {
  await page.goto('/');
  
  // Enable audio
  await page.getByRole('button', { name: /enable audio/i }).click();
  
  // Select and add sound
  await page.locator('mat-select').first().click();
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: /add sound/i }).click();
  
  // Verify sound is active
  const activeSound = page.locator('.active-sound').first();
  await expect(activeSound).toBeVisible();
});
```

## DevOps Architecture

### CI/CD Pipeline Architecture
```
┌─────────────────────────────────────────────────────┐
│                Source Control                       │
│                   (GitHub)                          │
├─────────────────────────────────────────────────────┤
│                 CI Pipeline                         │
│              (GitHub Actions)                       │
│    Build → Test → Security → Quality → Package     │
├─────────────────────────────────────────────────────┤
│               Artifact Storage                      │
│              (Container Registry)                   │
├─────────────────────────────────────────────────────┤
│                CD Pipeline                          │
│           Staging → Production                      │
├─────────────────────────────────────────────────────┤
│                 Monitoring                          │
│         (Logs, Metrics, Alerts)                    │
└─────────────────────────────────────────────────────┘
```

### Deployment Strategies

#### Blue-Green Deployment
```yaml
# Kubernetes deployment strategy
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: zenmachine
        image: zenmachine:${VERSION}
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
```

### Infrastructure as Code
```typescript
// Terraform configuration example
resource "kubernetes_deployment" "zenmachine" {
  metadata {
    name = "zenmachine"
    labels = {
      app = "zenmachine"
    }
  }
  
  spec {
    replicas = var.replica_count
    
    selector {
      match_labels = {
        app = "zenmachine"
      }
    }
    
    template {
      metadata {
        labels = {
          app = "zenmachine"
        }
      }
      
      spec {
        container {
          name  = "zenmachine"
          image = "zenmachine:${var.image_tag}"
          
          resources {
            requests = {
              memory = "64Mi"
              cpu    = "50m"
            }
            limits = {
              memory = "128Mi"
              cpu    = "100m"
            }
          }
        }
      }
    }
  }
}
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side state dependencies
- **Load Balancing**: Multiple container instances behind load balancer
- **CDN Integration**: Static assets served from CDN
- **Caching Strategy**: Aggressive browser and proxy caching

### Performance Scaling
- **Bundle Splitting**: Route-based code splitting
- **Lazy Loading**: Feature modules loaded on demand
- **Resource Optimization**: Compressed assets and optimized images
- **Service Worker**: Background caching and offline capabilities

### Monitoring Scaling
- **Metrics Collection**: Automated performance and error metrics
- **Alerting**: Proactive issue detection and notification
- **Log Aggregation**: Centralized logging with correlation IDs
- **Health Checks**: Automated health monitoring and recovery

---

This architecture documentation provides the foundation for understanding, maintaining, and extending the ZenMachine application. For implementation details, refer to the individual service and component documentation.