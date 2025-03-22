import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET - Fetch users with filtering options
router.get('/bulk', async (req: Request, res: Response):Promise<any> => {
  try {
    const { name, phoneno } = req.query;
    
    // Build filter conditions dynamically
    const filter: any = {};
    
    if (name) {
      filter.name = {
        contains: String(name),
        mode: 'insensitive' // Case-insensitive search
      };
    }
    
    if (phoneno) {
      filter.phoneno = {
        contains: String(phoneno),
        mode: 'insensitive'
      };
    }
    
    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true
      }
    });
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST - Create a new user with an account
router.post('/', async (req: Request, res: Response):Promise<any> => {
  try {
    const { name, email, phoneno, initialBalance = 0.0 } = req.body;
    
    // Validate input
    if (!name || !email || !phoneno) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone number'
      });
    }
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user with account in a transaction
    const newUser = await prisma.$transaction(async (prismaClient) => {
      // Create user
      const user = await prismaClient.user.create({
        data: {
          name,
          email,
          phoneno,
          account: {
            create: {
              balance: initialBalance
            }
          }
        },
        include: {
          account: true
        }
      });
      
      return user;
    });
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully with account',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneno: newUser.phoneno,
        account: {
          id: newUser.account?.id,
          balance: newUser.account?.balance
        }
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating user',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;