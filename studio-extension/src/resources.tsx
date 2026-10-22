import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
type Resources = { url: (path: string) => string; portal: HTMLElement | null };
const ResourcesContext = createContext<Resources>({ url: path => './' + path, portal: null });
export function ResourceProvider({ value, children }: { value: Resources; children: ReactNode }) {
  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}
export function useResource() { return useContext(ResourcesContext); }
