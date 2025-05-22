import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';


export async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
    
  if (!token) {
    throw new Error('No token found');
  }
  
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
}