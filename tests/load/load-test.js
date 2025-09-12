import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be less than 10%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4200';

export default function () {
  // Test main page load
  let response = http.get(`${BASE_URL}/`);
  let result = check(response, {
    'main page status is 200': (r) => r.status === 200,
    'main page loads in <2s': (r) => r.timings.duration < 2000,
    'main page contains app': (r) => r.body.includes('app-root'),
  });
  
  errorRate.add(!result);
  sleep(1);

  // Test static assets
  const staticAssets = [
    '/assets/sounds/heavy-rain.mp3',
    '/assets/sounds/bells-tibetan.mp3',
    '/assets/sounds/large_waterfall_1.mp3',
  ];

  staticAssets.forEach(asset => {
    let assetResponse = http.get(`${BASE_URL}${asset}`, {
      timeout: '10s',
    });
    
    let assetResult = check(assetResponse, {
      [`${asset} status is 200 or 206`]: (r) => r.status === 200 || r.status === 206,
      [`${asset} loads in <5s`]: (r) => r.timings.duration < 5000,
    });
    
    errorRate.add(!assetResult);
  });

  sleep(2);

  // Test API endpoints (if any)
  // This would depend on your specific API structure
  
  sleep(1);
}

export function teardown(data) {
  console.log('Load test completed');
}