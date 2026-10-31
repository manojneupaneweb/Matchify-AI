'use server'

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import { encrypt } from '../../lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    await dbConnect();
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return { error: 'Invalid email or password.' };
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'Invalid email or password.' };
    }
    
    // Create JWT
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    const sessionToken = await encrypt(payload);
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
  
  // Redirect outside try-catch to avoid swallowing redirect errors
  redirect('/dashboard');
}

export async function registerAction(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { error: 'Please provide all required fields.' };
  }

  try {
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: 'Email already registered.' };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    // Create JWT
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    const sessionToken = await encrypt(payload);
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

  } catch (error) {
    console.error('Registration action error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
  
  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
