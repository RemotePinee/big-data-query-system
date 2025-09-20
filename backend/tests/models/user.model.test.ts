import { UserModel, User } from '../../src/models/user.model';
import { pool } from '../../src/config/database';
import { RowDataPacket } from 'mysql2';

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

const mockPool = pool as jest.Mocked<typeof pool>;
const bcrypt = require('bcryptjs');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const mockUser: User = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        phone: '13812345678',
        balance: 0,
        role: 'user'
      };

      const mockResult = {
        insertId: 123,
        fieldCount: 0,
        affectedRows: 1,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const userId = await UserModel.create(mockUser);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['testuser', 'hashedPassword', 'test@example.com', '13812345678', null, 0, 'user'])
      );
      expect(userId).toBe(123);
    });

    it('should create user with default values when optional fields are missing', async () => {
      const mockUser: User = {
        username: 'testuser',
        password: 'password123',
        balance: 0,
        role: 'user'
      };

      const mockResult = {
        insertId: 456,
        fieldCount: 0,
        affectedRows: 1,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const userId = await UserModel.create(mockUser);

      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['testuser', 'hashedPassword', null, null, null, 0, 'user'])
      );
      expect(userId).toBe(456);
    });

    it('should throw error when database operation fails', async () => {
      const mockUser: User = {
        username: 'testuser',
        password: 'password123',
        balance: 0,
        role: 'user'
      };

      mockPool.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(UserModel.create(mockUser)).rejects.toThrow('Database error');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      const mockUserData: User & RowDataPacket = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        balance: 100,
        role: 'user'
      } as User & RowDataPacket;

      mockPool.execute.mockResolvedValueOnce([[mockUserData], []]);

      const user = await UserModel.findByUsername('testuser');

      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['testuser']
      );
      expect(user).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      mockPool.execute.mockResolvedValueOnce([[], []]);

      const user = await UserModel.findByUsername('nonexistent');

      expect(user).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      mockPool.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(UserModel.findByUsername('testuser')).rejects.toThrow('Database error');
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone successfully', async () => {
      const mockUserData: User & RowDataPacket = {
        id: 1,
        username: 'testuser',
        phone: '13812345678',
        balance: 100,
        role: 'user'
      } as User & RowDataPacket;

      mockPool.execute.mockResolvedValueOnce([[mockUserData], []]);

      const user = await UserModel.findByPhone('13812345678');

      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['13812345678']
      );
      expect(user).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      mockPool.execute.mockResolvedValueOnce([[], []]);

      const user = await UserModel.findByPhone('13800000000');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      const mockUserData: User & RowDataPacket = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 100,
        role: 'user'
      } as User & RowDataPacket;

      mockPool.execute.mockResolvedValueOnce([[mockUserData], []]);

      const user = await UserModel.findById(1);

      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(user).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      mockPool.execute.mockResolvedValueOnce([[], []]);

      const user = await UserModel.findById(999);

      expect(user).toBeNull();
    });
  });

  describe('updateBalance', () => {
    it('should update user balance successfully', async () => {
      const mockResult = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 1,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const result = await UserModel.updateBalance(1, 150.50);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [150.50, 1]
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      const mockResult = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 0,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const result = await UserModel.updateBalance(999, 100);

      expect(result).toBe(false);
    });

    it('should throw error when database operation fails', async () => {
      mockPool.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(UserModel.updateBalance(1, 100)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        email: 'newemail@example.com',
        phone: '13900000000'
      };

      const mockResult = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 1,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const result = await UserModel.update(1, updateData);

      expect(mockPool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining([1])
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      const mockResult = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 0,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]);

      const result = await UserModel.update(999, { email: 'test@example.com' });

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const mockResult = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 1,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };
      
      // Mock both execute calls - first for orders, second for user
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]); // Delete orders
      mockPool.execute.mockResolvedValueOnce([mockResult as any, []]); // Delete user

      const result = await UserModel.delete(1);

      expect(mockPool.execute).toHaveBeenCalledTimes(2);
      expect(mockPool.execute).toHaveBeenNthCalledWith(1,
        'DELETE FROM orders WHERE user_id = ?',
        [1]
      );
      expect(mockPool.execute).toHaveBeenNthCalledWith(2,
        'DELETE FROM users WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      const mockResultOrders = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 0,
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };

      const mockResultUser = {
        insertId: 0,
        fieldCount: 0,
        affectedRows: 0, // User not found
        changedRows: 0,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      };

      mockPool.execute.mockResolvedValueOnce([mockResultOrders as any, []]);
      mockPool.execute.mockResolvedValueOnce([mockResultUser as any, []]);

      const result = await UserModel.delete(999);

      expect(result).toBe(false);
    });
  });
});