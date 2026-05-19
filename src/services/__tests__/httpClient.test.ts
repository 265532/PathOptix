import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HttpClient } from '../api/httpClient';
import { loadingStateManager } from '../api/loadingState';

const mock = new MockAdapter(axios, { delayResponse: 10 });

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
    mock.reset();
    loadingStateManager.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('GET requests', () => {
    it('should successfully fetch data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mock.onGet('/test').reply(200, mockData);

      const result = await httpClient.get<typeof mockData>('/test');
      expect(result).toEqual(mockData);
    });

    it('should include auth token in headers', async () => {
      localStorage.setItem('access_token', 'test_token');
      let capturedHeaders: Record<string, string> = {};
      mock.onGet('/auth-test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>;
        return [200, {}];
      });

      await httpClient.get('/auth-test');
      expect(capturedHeaders.Authorization).toBe('Bearer test_token');
      localStorage.removeItem('access_token');
    });
  });

  describe('POST requests', () => {
    it('should successfully send POST request with data', async () => {
      const requestData = { username: 'test', password: '123456' };
      const responseData = { success: true, token: 'abc123' };
      mock.onPost('/login').reply(200, responseData);

      const result = await httpClient.post<typeof responseData>('/login', requestData);
      expect(result).toEqual(responseData);
    });

    it('should handle POST request with form-urlencoded content type', async () => {
      let capturedHeaders: Record<string, string> = {};
      mock.onPost('/login').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>;
        return [200, { access_token: 'test' }];
      });

      await httpClient.post('/login', { username: 'test' }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      expect(capturedHeaders['Content-Type']).toBe('application/x-www-form-urlencoded');
    });
  });

  describe('Error handling', () => {
    it('should handle 401 unauthorized error', async () => {
      mock.onGet('/unauthorized').reply(401, { detail: 'Unauthorized' });

      await expect(httpClient.get('/unauthorized')).rejects.toMatchObject({
        code: 401,
        message: 'Unauthorized'
      });
    });

    it('should handle 404 not found error', async () => {
      mock.onGet('/notfound').reply(404, { detail: 'Resource not found' });

      await expect(httpClient.get('/notfound')).rejects.toMatchObject({
        code: 404,
      });
    });

    it('should handle 500 server error', async () => {
      mock.onGet('/server-error').reply(500, { message: 'Internal server error' });

      await expect(httpClient.get('/server-error')).rejects.toMatchObject({
        code: 500,
      });
    });

    it('should handle network errors', async () => {
      mock.onGet('/network-error').networkError();

      await expect(httpClient.get('/network-error')).rejects.toMatchObject({
        message: expect.stringContaining('网络'),
      });
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/timeout').timeout();

      await expect(httpClient.get('/timeout')).rejects.toMatchObject({
        message: expect.stringContaining('超时'),
      });
    });
  });

  describe('Request cancellation', () => {
    it('should cancel specific request by key', async () => {
      mock.onGet('/cancel-test').reply(() => new Promise(() => {}));

      const requestPromise = httpClient.get('/cancel-test');
      httpClient.cancelRequest('GET:/cancel-test:{}');

      await expect(requestPromise).rejects.toMatchObject({
        message: '请求已被手动取消',
      });
    });

    it('should cancel all pending requests', async () => {
      mock.onGet('/request1').reply(() => new Promise(() => {}));
      mock.onGet('/request2').reply(() => new Promise(() => {}));

      const promise1 = httpClient.get('/request1');
      const promise2 = httpClient.get('/request2');

      httpClient.cancelAllRequests();

      await expect(promise1).rejects.toMatchObject({
        message: '所有请求已被取消',
      });
      await expect(promise2).rejects.toMatchObject({
        message: '所有请求已被取消',
      });
    });
  });

  describe('Retry mechanism', () => {
    it('should retry on 503 error when retry is enabled', async () => {
      let attemptCount = 0;
      mock.onGet('/retry-test').reply(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return [503, { message: 'Service Unavailable' }];
        }
        return [200, { success: true }];
      });

      const result = await httpClient.get('/retry-test', { retry: 2, retryDelay: 10 });
      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);
    });

    it('should not retry on 404 error', async () => {
      let attemptCount = 0;
      mock.onGet('/no-retry-404').reply(() => {
        attemptCount++;
        return [404, { message: 'Not Found' }];
      });

      await expect(httpClient.get('/no-retry-404', { retry: 2 })).rejects.toMatchObject({
        code: 404,
      });
      expect(attemptCount).toBe(1);
    });
  });

  describe('Loading state management', () => {
    it('should increment loading count on request start', async () => {
      mock.onGet('/loading-test').reply(200, { data: 'test' });

      const callback = jest.fn();
      loadingStateManager.subscribe(callback);

      const promise = httpClient.get('/loading-test');
      expect(loadingStateManager.isLoading()).toBe(true);

      await promise;
      expect(loadingStateManager.isLoading()).toBe(false);
    });
  });

  describe('Request with parameters', () => {
    it('should send query parameters correctly', async () => {
      let capturedParams: Record<string, string> = {};
      mock.onGet('/with-params').reply((config) => {
        capturedParams = config.params as Record<string, string>;
        return [200, {}];
      });

      await httpClient.get('/with-params', {
        params: { keyword: 'test', status: 'active' }
      });

      expect(capturedParams.keyword).toBe('test');
      expect(capturedParams.status).toBe('active');
    });
  });
});
