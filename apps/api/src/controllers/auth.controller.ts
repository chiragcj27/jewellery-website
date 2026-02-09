import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase, User, IUser, type UserRole, type WholesalerApprovalStatus } from '@jewellery-website/db';
import { getErrorMessage, isMongoDuplicateKeyError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SALT_ROUNDS = 10;

function sanitizeUser(user: IUser): Record<string, unknown> {
  const obj = user.toObject ? user.toObject() : (user as unknown as Record<string, unknown>);
  const { passwordHash, ...rest } = obj as Record<string, unknown> & { passwordHash?: string };
  return rest;
}

function signToken(userId: string, role: UserRole): string {
  return jwt.sign(
    { sub: userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function registerCustomer(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password and name are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      role: 'customer',
    });

    const token = signToken(user._id.toString(), 'customer');
    res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), token },
    });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }
    console.error('Register customer error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function registerWholesaler(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const {
      email,
      password,
      name,
      firmName,
      city,
      visitingCardImage,
      mobNumber,
      gstCertificateFiles,
      businessName,
      gstNo,
    } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      firmName?: string;
      city?: string;
      visitingCardImage?: string;
      mobNumber?: string;
      gstCertificateFiles?: string[];
      businessName?: string;
      gstNo?: string;
    };

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password and name are required' });
      return;
    }

    if (!firmName?.trim()) {
      res.status(400).json({ success: false, error: 'Firm name is required' });
      return;
    }

    if (!city?.trim()) {
      res.status(400).json({ success: false, error: 'City is required' });
      return;
    }

    if (!visitingCardImage?.trim()) {
      res.status(400).json({ success: false, error: 'Visiting card image is required' });
      return;
    }

    if (!mobNumber?.trim()) {
      res.status(400).json({ success: false, error: 'Mobile number is required' });
      return;
    }

    const gstUrls = Array.isArray(gstCertificateFiles) ? gstCertificateFiles.filter((u): u is string => typeof u === 'string' && u.trim().length > 0) : [];
    if (gstUrls.length === 0) {
      res.status(400).json({ success: false, error: 'At least one GST certificate file is required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      role: 'wholesaler',
      firmName: firmName.trim(),
      city: city.trim(),
      visitingCardImage: visitingCardImage.trim(),
      mobNumber: mobNumber.trim(),
      gstCertificateFiles: gstUrls,
      businessName: businessName?.trim() || firmName.trim(),
      gstNo: gstNo?.trim(),
      approvalStatus: 'pending' as WholesalerApprovalStatus,
    });

    const token = signToken(user._id.toString(), 'wholesaler');
    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
        message: 'Your business account has been created. It will be reviewed by our team and you will be notified once approved.',
      },
    });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }
    console.error('Register wholesaler error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    if (user.role === 'wholesaler' && user.approvalStatus !== 'approved') {
      res.status(403).json({
        success: false,
        error: 'Your business account is pending approval. You will be able to sign in once approved.',
        code: 'WHOLESALER_PENDING_APPROVAL',
      });
      return;
    }

    const token = signToken(user._id.toString(), user.role as UserRole);
    res.json({
      success: true,
      data: { user: sanitizeUser(user), token },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing or invalid authorization' });
      return;
    }

    const token = authHeader.slice(7);
    let payload: { sub: string; role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    } catch {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    await connectToDatabase();
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.role === 'wholesaler' && user.approvalStatus !== 'approved') {
      res.status(403).json({
        success: false,
        error: 'Account pending approval',
        code: 'WHOLESALER_PENDING_APPROVAL',
      });
      return;
    }

    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error: unknown) {
    console.error('Me error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
