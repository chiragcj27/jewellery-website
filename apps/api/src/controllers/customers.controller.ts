import { Request, Response } from 'express';
import { connectToDatabase, User } from '@jewellery-website/db';
import { getErrorMessage } from '../utils/errors';

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();

    const users = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error: unknown) {
    console.error('List customers error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
