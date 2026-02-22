/**
 * useReaderContext
 *
 * Convenience hook for consuming ReaderContext. Extracted to a separate file
 * so that ReaderContext.tsx can export only the ReaderProvider component,
 * satisfying the react-refresh/only-export-components lint rule.
 */

import { useContext } from 'react';
import { ReaderContext, type ReaderContextValue } from './readerContextDef';

export function useReaderContext(): ReaderContextValue {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error('useReaderContext must be used within ReaderProvider');
  return ctx;
}
