import { useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChatMessage, Comment, AdminStatus, SiteStats } from '../types';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export function useFirebase() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [stats, setStats] = useState<SiteStats>({ visitorCount: 0, commentCount: 0, projectCount: 25 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    // Visitor Count (increment once per session)
    const trackVisitor = async () => {
      const visitorId = localStorage.getItem('visitorId') || Math.random().toString(36).substring(7);
      if (!localStorage.getItem('visitorId')) {
        localStorage.setItem('visitorId', visitorId);
      }
      
      if (!localStorage.getItem('visitorCounted')) {
        localStorage.setItem('visitorCounted', 'true');
        const statsRef = doc(db, 'stats', 'global');
        try {
          const statsSnap = await getDoc(statsRef);
          if (!statsSnap.exists()) {
            await setDoc(statsRef, { visitorCount: 1, commentCount: 0, projectCount: 25 });
          } else {
            await updateDoc(statsRef, { visitorCount: increment(1) });
          }
        } catch (e) {
          console.error("Stats update failed:", e);
        }
      }
    };
    trackVisitor();

    // Listeners
    const unsubscribeStats = onSnapshot(doc(db, 'stats', 'global'), (doc) => {
      if (doc.exists()) setStats(doc.data() as SiteStats);
    });

    const unsubscribeChat = onSnapshot(
      query(collection(db, 'chat'), orderBy('timestamp', 'asc'), limit(50)),
      (snapshot) => {
        setChatMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      }
    );

    const unsubscribeComments = onSnapshot(
      query(collection(db, 'comments'), orderBy('timestamp', 'desc'), limit(20)),
      (snapshot) => {
        setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
      }
    );

    const unsubscribeAdmin = onSnapshot(doc(db, 'adminStatus', 'status'), (doc) => {
      if (doc.exists()) setAdminStatus(doc.data() as AdminStatus);
    });

    // Update admin status if current user is admin
    const updateAdminStatus = async () => {
      if (auth.currentUser?.email === "muhaned76995@gmail.com") {
        const adminRef = doc(db, 'adminStatus', 'status');
        await setDoc(adminRef, {
          lastSeen: serverTimestamp(),
          isOnline: true
        }, { merge: true });

        // Set offline on disconnect (simplified for this environment)
        window.addEventListener('beforeunload', () => {
          updateDoc(adminRef, { isOnline: false, lastSeen: serverTimestamp() });
        });
      }
    };
    updateAdminStatus();

    return () => {
      unsubscribeAuth();
      unsubscribeStats();
      unsubscribeChat();
      unsubscribeComments();
      unsubscribeAdmin();
    };
  }, []);

  const sendMessage = async (text: string, senderName: string, isAdmin = false) => {
    const visitorId = localStorage.getItem('visitorId') || 'anonymous';
    await addDoc(collection(db, 'chat'), {
      text,
      senderName,
      timestamp: serverTimestamp(),
      isAdmin,
      uid: user?.uid || visitorId
    });
  };

  const addComment = async (text: string, userName: string) => {
    await addDoc(collection(db, 'comments'), {
      text,
      userName,
      timestamp: serverTimestamp()
    });
    await updateDoc(doc(db, 'stats', 'global'), { commentCount: increment(1) });
  };

  return { stats, chatMessages, comments, adminStatus, user, sendMessage, addComment };
}
