import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function AdminGuard({ children }) {
  return children;
}
