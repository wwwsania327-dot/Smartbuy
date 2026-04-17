import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // We unified Login & Registration through OTP
  redirect('/login');
}
