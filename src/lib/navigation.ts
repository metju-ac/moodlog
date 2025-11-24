import { goto as svelteGoto } from '$app/navigation';
import { base } from '$app/paths';

export function goto(path: string) {
  return svelteGoto(`${base}${path}`);
}
