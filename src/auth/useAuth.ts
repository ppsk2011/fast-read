/**
 * useAuth
 * Convenience hook for accessing auth state from AuthContext.
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
