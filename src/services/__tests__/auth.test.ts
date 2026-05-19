import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authApi } from '../modules/auth';

const mock = new MockAdapter(axios, { delayResponse: 10 });

describe('authApi', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.removeItem('access_token');
  });

  afterAll(() => {
    mock.restore();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const responseData = { access_token: 'test_token_123', token_type: 'bearer' };
      mock.onPost('/api/auth/login').reply(200, responseData);

      const result = await authApi.login({ username: 'testuser', password: 'password123' });
      expect(result.access_token).toBe('test_token_123');
    });

    it('should handle login error', async () => {
      mock.onPost('/api/auth/login').reply(401, { detail: 'Invalid credentials' });

      await expect(authApi.login({ username: 'wrong', password: 'wrong' }))
        .rejects.toMatchObject({ code: 401 });
    });

    it('should store token in localStorage on successful login', async () => {
      const responseData = { access_token: 'stored_token' };
      mock.onPost('/api/auth/login').reply(200, responseData);

      await authApi.login({ username: 'test', password: 'test' });
      expect(localStorage.getItem('access_token')).toBe('stored_token');
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', async () => {
      localStorage.setItem('access_token', 'some_token');
      authApi.logout();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'valid_token');
      expect(authApi.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      localStorage.removeItem('access_token');
      expect(authApi.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return the stored token', () => {
      localStorage.setItem('access_token', 'my_token');
      expect(authApi.getToken()).toBe('my_token');
    });

    it('should return null when no token is stored', () => {
      localStorage.removeItem('access_token');
      expect(authApi.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user info', async () => {
      const userData = { id: '1', username: 'testuser', email: 'test@example.com' };
      mock.onGet('/api/auth/me').reply(200, userData);

      const result = await authApi.getCurrentUser();
      expect(result.username).toBe('testuser');
    });
  });
});
