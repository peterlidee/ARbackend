import { ListAccessArgs } from './types';
// At it's simplest, the access controle return a yes or a no value depending on the users session

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}
