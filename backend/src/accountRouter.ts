import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const accountrouter = Router();
const prisma = new PrismaClient();

// GET - Get user balance
accountrouter.get('/balance', async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const account = await prisma.account.findFirst({
      where: {
        userId: Number(userId)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found for this user'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        accountId: account.id,
        balance: account.balance,
        user: account.user
      }
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching balance',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST - Deposit money to account
accountrouter.post('/deposit', async (req: Request, res: Response) : Promise<any> => {
  try {
    const { userId, amount } = req.body;
    
    // Input validation
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be positive'
      });
    }
    
    // Perform atomic transaction
    const updatedAccount = await prisma.$transaction(async (prismaClient) => {
      // Get account with a lock for update
      const account = await prismaClient.account.findFirst({
        where: { userId: Number(userId) }
      });
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Update balance
      return prismaClient.account.update({
        where: { id: account.id },
        data: { 
          balance: { increment: amount } 
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });
    });
    
    return res.status(200).json({
      success: true,
      message: `Successfully deposited ${amount} to account`,
      data: {
        accountId: updatedAccount.id,
        newBalance: updatedAccount.balance,
        userName: updatedAccount.user.name
      }
    });
  } catch (error) {
    console.error('Error depositing to account:', error);
    
    if ((error as Error).message === 'Account not found') {
      return res.status(404).json({
        success: false,
        message: 'Account not found for this user'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while depositing to account',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST - Withdraw money from account
accountrouter.post('/withdraw', async (req: Request, res: Response) : Promise<any> => {
  try {
    const { userId, amount } = req.body;
    
    // Input validation
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount must be positive'
      });
    }
    
    // Perform atomic transaction
    const updatedAccount = await prisma.$transaction(async (prismaClient) => {
      // Get account with a lock for update
      const account = await prismaClient.account.findFirst({
        where: { userId: Number(userId) }
      });
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Check sufficient balance
      if (account.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Update balance
      return prismaClient.account.update({
        where: { id: account.id },
        data: { 
          balance: { decrement: amount } 
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });
    });
    
    return res.status(200).json({
      success: true,
      message: `Successfully withdrew ${amount} from account`,
      data: {
        accountId: updatedAccount.id,
        newBalance: updatedAccount.balance,
        userName: updatedAccount.user.name
      }
    });
  } catch (error) {
    console.error('Error withdrawing from account:', error);
    
    if ((error as Error).message === 'Account not found') {
      return res.status(404).json({
        success: false,
        message: 'Account not found for this user'
      });
    } else if ((error as Error).message === 'Insufficient balance') {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while withdrawing from account',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST - Transfer money between accounts
accountrouter.post('/transfer', async (req: Request, res: Response) : Promise<any> => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    
    // Input validation
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Source user ID, destination user ID, and amount are required'
      });
    }
    
    if (fromUserId === toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same account'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be positive'
      });
    }
    
    // Perform atomic transaction
    const result = await prisma.$transaction(async (prismaClient) => {
      // Get source account with a lock for update
      const sourceAccount = await prismaClient.account.findFirst({
        where: { userId: Number(fromUserId) },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });
      
      if (!sourceAccount) {
        throw new Error('Source account not found');
      }
      
      // Check sufficient balance
      if (sourceAccount.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Get destination account with a lock for update
      const destAccount = await prismaClient.account.findFirst({
        where: { userId: Number(toUserId) },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });
      
      if (!destAccount) {
        throw new Error('Destination account not found');
      }
      
      // Deduct from source account
      const updatedSourceAccount = await prismaClient.account.update({
        where: { id: sourceAccount.id },
        data: { 
          balance: { decrement: amount } 
        }
      });
      
      // Add to destination account
      const updatedDestAccount = await prismaClient.account.update({
        where: { id: destAccount.id },
        data: { 
          balance: { increment: amount } 
        }
      });
      
      return {
        source: {
          ...updatedSourceAccount,
          userName: sourceAccount.user.name
        },
        destination: {
          ...updatedDestAccount,
          userName: destAccount.user.name
        }
      };
    });
    
    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${amount} from ${result.source.userName} to ${result.destination.userName}`,
      data: {
        source: {
          userId: Number(fromUserId),
          accountId: result.source.id,
          newBalance: result.source.balance,
          userName: result.source.userName
        },
        destination: {
          userId: Number(toUserId),
          accountId: result.destination.id,
          newBalance: result.destination.balance,
          userName: result.destination.userName
        }
      }
    });
  } catch (error) {
    console.error('Error transferring between accounts:', error);
    
    if ((error as Error).message === 'Source account not found') {
      return res.status(404).json({
        success: false,
        message: 'Source account not found'
      });
    } else if ((error as Error).message === 'Destination account not found') {
      return res.status(404).json({
        success: false,
        message: 'Destination account not found'
      });
    } else if ((error as Error).message === 'Insufficient balance') {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for transfer'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while transferring between accounts',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default accountrouter;