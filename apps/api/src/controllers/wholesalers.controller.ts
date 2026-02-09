import { Request, Response } from 'express';
import { connectToDatabase, User, IUser } from '@jewellery-website/db';
import { getErrorMessage } from '../utils/errors';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const status = req.query.status as string | undefined; // 'pending' | 'approved' | 'rejected' | undefined (all)

    const query: Record<string, unknown> = { role: 'wholesaler' };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.approvalStatus = status;
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error: unknown) {
    console.error('List wholesalers error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function approve(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const user = await User.findOne({
      _id: req.params.id,
      role: 'wholesaler',
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Wholesaler account not found' });
      return;
    }

    user.approvalStatus = 'approved';
    user.approvedAt = new Date();
    user.rejectedAt = undefined;
    user.rejectedReason = undefined;
    await user.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passwordHash excluded from response
    const { passwordHash, ...rest } = user.toObject() as IUser & { passwordHash?: string };
    res.json({ success: true, data: rest });
  } catch (error: unknown) {
    console.error('Approve wholesaler error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function reject(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const user = await User.findOne({
      _id: req.params.id,
      role: 'wholesaler',
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Wholesaler account not found' });
      return;
    }

    const { reason } = req.body as { reason?: string };
    user.approvalStatus = 'rejected';
    user.rejectedAt = new Date();
    user.rejectedReason = reason?.trim();
    user.approvedAt = undefined;
    await user.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passwordHash excluded from response
    const { passwordHash, ...rest } = user.toObject() as IUser & { passwordHash?: string };
    res.json({ success: true, data: rest });
  } catch (error: unknown) {
    console.error('Reject wholesaler error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
