import { UserAccount } from './types';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export const AUTH_USERS_KEY = 'app_users_auth';

export const DEFAULT_SUPER_ADMIN: UserAccount = {
  id: 'super-admin-1',
  name: 'Super Admin Ayon',
  email: 'ayon@gmail.com',
  password: '445566',
  role: 'Super Admin'
};

function mergeArray(localArr: UserAccount[], serverArr: UserAccount[]): UserAccount[] {
  if (!Array.isArray(localArr)) return serverArr || [];
  if (!Array.isArray(serverArr)) return localArr || [];
  
  const serverMap = new Map(serverArr.map(item => [item.id, item]));
  const merged = [...serverArr];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  for (const localItem of localArr) {
    if (!serverMap.has(localItem.id)) {
      if (localItem.id === DEFAULT_SUPER_ADMIN.id) continue;

      const parts = localItem.id.split('_');
      let isRecent = false;
      if (parts.length >= 2) {
        const ts = parseInt(parts[1], 10);
        if (!isNaN(ts) && ts > 0) {
          if (now - ts < ONE_DAY_MS) {
            isRecent = true;
          }
        }
      } else {
        // Assume non-default-admin, non-timestamped items are local and should be preserved
        isRecent = true;
      }
      
      if (isRecent) {
        console.log(`Preserving unsynced local-only item: ${localItem.id}`);
        merged.push(localItem);
      }
    }
  }
  return merged;
}

export function subscribeToUsers(onUpdate: (users: UserAccount[]) => void): () => void {
  const docRef = doc(db, 'app_users', 'registered_users');
  return onSnapshot(
    docRef,
    (snapshot) => {
      console.log('--- onSnapshot registered_users ---');
      console.log('snapshot.exists():', snapshot.exists());
      console.log('hasPendingWrites:', snapshot.metadata.hasPendingWrites);
      console.log('fromCache:', snapshot.metadata.fromCache);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.users)) {
          const localUsers = getRegisteredUsers();
          const serverUsers = data.users || [];
          let users: UserAccount[] = mergeArray(localUsers, serverUsers);
          console.log('registered_users count in snapshot:', serverUsers.length, 'merged:', users.length);
          
          let changed = false;
          if (!users.some(u => u.email.toLowerCase() === 'ayon@gmail.com')) {
            users.unshift(DEFAULT_SUPER_ADMIN);
            changed = true;
          }
          if (users.length > serverUsers.length) {
            changed = true;
          }
          
          if (changed && !snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
            console.log('Super Admin Ayon missing or local-only users preserved, updating server...');
            const cleanUsers = JSON.parse(JSON.stringify(users));
            setDoc(docRef, { users: cleanUsers }).catch(() => {});
          }
          try {
            localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
          } catch (e) {}
          onUpdate(users);
        }
      } else {
        console.log('registered_users snapshot does not exist, initializing...');
        const currentUsers = getRegisteredUsers();
        const cleanUsers = JSON.parse(JSON.stringify(currentUsers));
        setDoc(docRef, { users: cleanUsers }).catch((err) => console.error('Error init firestore users:', err));
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_users/registered_users');
    }
  );
}

export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (raw) {
      let users: UserAccount[] = JSON.parse(raw);
      let changed = false;
      if (!users.some(u => u.email.toLowerCase() === 'ayon@gmail.com')) {
        users.unshift(DEFAULT_SUPER_ADMIN);
        changed = true;
      }
      if (changed) {
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      }
      return users;
    }
  } catch (e) {
    console.error('Error reading users auth db', e);
  }
  const defaultList = [DEFAULT_SUPER_ADMIN];
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultList));
  return defaultList;
}

export function saveRegisteredUsers(users: UserAccount[]): void {
  console.log('--- saveRegisteredUsers called ---');
  console.log('Users to save count:', users?.length);
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
  const docRef = doc(db, 'app_users', 'registered_users');
  const cleanUsers = JSON.parse(JSON.stringify(users));
  console.log('Calling setDoc for registered_users...');
  setDoc(docRef, { users: cleanUsers })
    .then(() => {
      console.log('setDoc for registered_users successfully completed');
    })
    .catch((err) => {
      console.error('Error saving users to Firestore:', err);
    });
}
