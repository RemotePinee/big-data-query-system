import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/user.routes';
import { UserController } from '../../src/controllers/user.controller';
import { authenticate } from '../../src/middlewares/auth.middleware';

// Mock the controller
jest.mock('../../src/controllers/user.controller', () => ({
  UserController: {
    register: jest.fn(),
    login: jest.fn(),
    getUserInfo: jest.fn(),
    updateUserInfo: jest.fn(),
    getUserStats: jest.fn(),
    getUnreadCount: jest.fn(),
    changePassword: jest.fn(),
    getLoginRecords: jest.fn(),
    requestAccountDeletion: jest.fn()
  }
}));

// Mock the auth middleware
jest.mock('../../src/middlewares/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    // Mock successful authentication by default
    req.user = { id: 1, username: 'testuser', role: 'user' };
    next();
  })
}));

describe('User Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/user', userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset authenticate mock to default behavior
    (authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 1, username: 'testuser', role: 'user' };
      next();
    });
  });

  describe('Public Routes', () => {
    describe('POST /api/user/register', () => {
      it('should call UserController.register', async () => {
        const mockRegister = UserController.register as jest.Mock;
        mockRegister.mockImplementation((req, res) => {
          res.status(201).json({ success: true });
        });

        const userData = {
          username: 'newuser',
          password: 'password123',
          email: 'test@example.com'
        };

        const response = await request(app)
          .post('/api/user/register')
          .send(userData);

        expect(mockRegister).toHaveBeenCalled();
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ success: true });
      });

      it('should handle registration errors', async () => {
        const mockRegister = UserController.register as jest.Mock;
        mockRegister.mockImplementation((req, res) => {
          res.status(400).json({ error: 'Username already exists' });
        });

        const userData = {
          username: 'existinguser',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/user/register')
          .send(userData);

        expect(mockRegister).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Username already exists' });
      });

      it('should accept POST requests with JSON content', async () => {
        const mockRegister = UserController.register as jest.Mock;
        mockRegister.mockImplementation((req, res) => {
          expect(req.body.username).toBe('testuser');
          res.status(201).json({ success: true });
        });

        await request(app)
          .post('/api/user/register')
          .set('Content-Type', 'application/json')
          .send({ username: 'testuser', password: 'test123' });

        expect(mockRegister).toHaveBeenCalled();
      });
    });

    describe('POST /api/user/login', () => {
      it('should call UserController.login', async () => {
        const mockLogin = UserController.login as jest.Mock;
        mockLogin.mockImplementation((req, res) => {
          res.status(200).json({ token: 'jwt-token', user: { id: 1, username: 'user' } });
        });

        const loginData = {
          username: 'user',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/user/login')
          .send(loginData);

        expect(mockLogin).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ 
          token: 'jwt-token', 
          user: { id: 1, username: 'user' } 
        });
      });

      it('should handle login failures', async () => {
        const mockLogin = UserController.login as jest.Mock;
        mockLogin.mockImplementation((req, res) => {
          res.status(401).json({ error: 'Invalid credentials' });
        });

        const loginData = {
          username: 'user',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/user/login')
          .send(loginData);

        expect(mockLogin).toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
      });
    });
  });

  describe('Protected Routes', () => {
    describe('GET /api/user/profile', () => {
      it('should call authenticate middleware and UserController.getUserInfo', async () => {
        const mockGetUserInfo = UserController.getUserInfo as jest.Mock;
        mockGetUserInfo.mockImplementation((req, res) => {
          res.status(200).json({ id: 1, username: 'testuser', email: 'test@example.com' });
        });

        const response = await request(app)
          .get('/api/user/profile')
          .set('Authorization', 'Bearer valid-token');

        expect(authenticate).toHaveBeenCalled();
        expect(mockGetUserInfo).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
      });

      it('should handle authentication failure', async () => {
        (authenticate as jest.Mock).mockImplementation((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const response = await request(app)
          .get('/api/user/profile');

        expect(authenticate).toHaveBeenCalled();
        expect(UserController.getUserInfo).not.toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('PUT /api/user/profile', () => {
      it('should call authenticate middleware and UserController.updateUserInfo', async () => {
        const mockUpdateUserInfo = UserController.updateUserInfo as jest.Mock;
        mockUpdateUserInfo.mockImplementation((req, res) => {
          res.status(200).json({ success: true });
        });

        const updateData = {
          email: 'newemail@example.com',
          phone: '1234567890'
        };

        const response = await request(app)
          .put('/api/user/profile')
          .set('Authorization', 'Bearer valid-token')
          .send(updateData);

        expect(authenticate).toHaveBeenCalled();
        expect(mockUpdateUserInfo).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('GET /api/user/stats', () => {
      it('should call authenticate middleware and UserController.getUserStats', async () => {
        const mockGetUserStats = UserController.getUserStats as jest.Mock;
        mockGetUserStats.mockImplementation((req, res) => {
          res.status(200).json({ 
            totalOrders: 10, 
            totalSpent: 1000, 
            memberSince: '2023-01-01' 
          });
        });

        const response = await request(app)
          .get('/api/user/stats')
          .set('Authorization', 'Bearer valid-token');

        expect(authenticate).toHaveBeenCalled();
        expect(mockGetUserStats).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ 
          totalOrders: 10, 
          totalSpent: 1000, 
          memberSince: '2023-01-01' 
        });
      });
    });

    describe('GET /api/user/unread-count', () => {
      it('should call authenticate middleware and UserController.getUnreadCount', async () => {
        const mockGetUnreadCount = UserController.getUnreadCount as jest.Mock;
        mockGetUnreadCount.mockImplementation((req, res) => {
          res.status(200).json({ unreadCount: 5 });
        });

        const response = await request(app)
          .get('/api/user/unread-count')
          .set('Authorization', 'Bearer valid-token');

        expect(authenticate).toHaveBeenCalled();
        expect(mockGetUnreadCount).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ unreadCount: 5 });
      });
    });

    describe('PUT /api/user/change-password', () => {
      it('should call authenticate middleware and UserController.changePassword', async () => {
        const mockChangePassword = UserController.changePassword as jest.Mock;
        mockChangePassword.mockImplementation((req, res) => {
          res.status(200).json({ success: true });
        });

        const passwordData = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        };

        const response = await request(app)
          .put('/api/user/change-password')
          .set('Authorization', 'Bearer valid-token')
          .send(passwordData);

        expect(authenticate).toHaveBeenCalled();
        expect(mockChangePassword).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
      });

      it('should handle password change failure', async () => {
        const mockChangePassword = UserController.changePassword as jest.Mock;
        mockChangePassword.mockImplementation((req, res) => {
          res.status(400).json({ error: 'Current password is incorrect' });
        });

        const passwordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        };

        const response = await request(app)
          .put('/api/user/change-password')
          .set('Authorization', 'Bearer valid-token')
          .send(passwordData);

        expect(authenticate).toHaveBeenCalled();
        expect(mockChangePassword).toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Current password is incorrect' });
      });
    });

    describe('GET /api/user/login-records', () => {
      it('should call authenticate middleware and UserController.getLoginRecords', async () => {
        const mockGetLoginRecords = UserController.getLoginRecords as jest.Mock;
        mockGetLoginRecords.mockImplementation((req, res) => {
          res.status(200).json({ 
            records: [
              { ip: '127.0.0.1', timestamp: '2023-01-01T10:00:00Z', success: true },
              { ip: '192.168.1.1', timestamp: '2023-01-02T11:00:00Z', success: false }
            ]
          });
        });

        const response = await request(app)
          .get('/api/user/login-records')
          .set('Authorization', 'Bearer valid-token');

        expect(authenticate).toHaveBeenCalled();
        expect(mockGetLoginRecords).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body.records).toHaveLength(2);
      });
    });

    describe('POST /api/user/request-deletion', () => {
      it('should call authenticate middleware and UserController.requestAccountDeletion', async () => {
        const mockRequestDeletion = UserController.requestAccountDeletion as jest.Mock;
        mockRequestDeletion.mockImplementation((req, res) => {
          res.status(200).json({ 
            success: true, 
            message: 'Account deletion request submitted' 
          });
        });

        const deletionData = {
          reason: 'No longer needed',
          confirmPassword: 'userpassword'
        };

        const response = await request(app)
          .post('/api/user/request-deletion')
          .set('Authorization', 'Bearer valid-token')
          .send(deletionData);

        expect(authenticate).toHaveBeenCalled();
        expect(mockRequestDeletion).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ 
          success: true, 
          message: 'Account deletion request submitted' 
        });
      });
    });
  });

  describe('Route Configuration', () => {
    it('should handle invalid routes with 404', async () => {
      const response = await request(app)
        .get('/api/user/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should only accept POST for register route', async () => {
      const response = await request(app)
        .get('/api/user/register');

      expect(response.status).toBe(404);
    });

    it('should only accept POST for login route', async () => {
      const response = await request(app)
        .get('/api/user/login');

      expect(response.status).toBe(404);
    });

    it('should only accept GET for profile route', async () => {
      const mockGetUserInfo = UserController.getUserInfo as jest.Mock;
      mockGetUserInfo.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app)
        .post('/api/user/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(mockGetUserInfo).not.toHaveBeenCalled();
    });

    it('should only accept PUT for profile update route', async () => {
      const mockUpdateUserInfo = UserController.updateUserInfo as jest.Mock;
      mockUpdateUserInfo.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200); // This should call getUserInfo, not updateUserInfo
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
      expect(UserController.getUserInfo).toHaveBeenCalled();
    });
  });

  describe('Middleware Integration', () => {
    it('should pass user data from authenticate middleware to controller', async () => {
      const mockGetUserInfo = UserController.getUserInfo as jest.Mock;
      mockGetUserInfo.mockImplementation((req, res) => {
        expect(req.user).toEqual({ id: 1, username: 'testuser', role: 'user' });
        res.status(200).json({ success: true });
      });

      await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(mockGetUserInfo).toHaveBeenCalled();
    });

    it('should handle middleware errors properly', async () => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        const error = new Error('Token expired');
        next(error);
      });

      // Express will handle the error and typically return 500 or similar
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer expired-token');

      expect(authenticate).toHaveBeenCalled();
      expect(UserController.getUserInfo).not.toHaveBeenCalled();
    });

    it('should maintain request context through middleware chain', async () => {
      const mockUpdateUserInfo = UserController.updateUserInfo as jest.Mock;
      mockUpdateUserInfo.mockImplementation((req, res) => {
        // Verify that request data is preserved
        expect(req.body.email).toBe('test@example.com');
        expect(req.user.id).toBe(1);
        res.status(200).json({ success: true });
      });

      await request(app)
        .put('/api/user/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ email: 'test@example.com' });

      expect(mockUpdateUserInfo).toHaveBeenCalled();
    });
  });

  describe('HTTP Methods Validation', () => {
    const protectedRoutes = [
      { path: '/api/user/profile', method: 'get' },
      { path: '/api/user/profile', method: 'put' },
      { path: '/api/user/stats', method: 'get' },
      { path: '/api/user/unread-count', method: 'get' },
      { path: '/api/user/change-password', method: 'put' },
      { path: '/api/user/login-records', method: 'get' },
      { path: '/api/user/request-deletion', method: 'post' }
    ];

    protectedRoutes.forEach(({ path, method }) => {
      it(`should require authentication for ${method.toUpperCase()} ${path}`, async () => {
        (authenticate as jest.Mock).mockImplementation((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const response = await (request(app) as any)[method](path);

        expect(authenticate).toHaveBeenCalled();
        expect(response.status).toBe(401);
      });
    });
  });
});
