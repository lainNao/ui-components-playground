import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useMemo, useRef, useState } from "react";
import { SAMPLE_FIREBASE_PROJECT_ID } from "../consts";
import { RealtimeSyncTodoWithPresence } from "./realtime-sync-todo-with-presence";
import {
  isTodoPayload,
  type Todo,
  type UserPresence,
  useOnMount,
} from "./util";

export default {};

const TODOS_COLLECTION_NAME = "todos";
const PRESENCE_COLLECTION_NAME = "presence";

// 現在のユーザーIDを生成（実際のアプリでは認証システムから取得）
const generateUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;

export const Default = () => {
  const [currentUserId] = useState(() => generateUserId());

  const app = useMemo(
    () => initializeApp({ projectId: SAMPLE_FIREBASE_PROJECT_ID }),
    []
  );
  const db = useMemo(() => getFirestore(app), [app]);

  // エミュレータ接続は初回のみ
  const emulatorConnected = useRef(false);
  if (!emulatorConnected.current) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    emulatorConnected.current = true;
  }

  const todosCollection = useMemo(
    () => collection(db, TODOS_COLLECTION_NAME),
    [db]
  );

  const presenceCollection = useMemo(
    () => collection(db, PRESENCE_COLLECTION_NAME),
    [db]
  );

  useOnMount(() => {
    fetch("http://localhost:8080").catch(() => {
      alert(
        "このサンプルはローカルで Firestore エミュレータが起動している必要があります"
      );
    });
  });

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#e9ecef",
          borderRadius: "5px",
        }}
      >
        <p>
          <strong>現在のユーザーID:</strong> {currentUserId}
        </p>
        <p style={{ fontSize: "14px", color: "#666" }}>
          複数のブラウザタブで開くか、別のブラウザでアクセスしてプレゼンス機能をテストできます
        </p>
      </div>

      <RealtimeSyncTodoWithPresence
        currentUserId={currentUserId}
        subscribeTodos={(onChange) => {
          const unsubscribe = onSnapshot(
            query(todosCollection, orderBy("createdAt", "asc")),
            (snap) => {
              const latestTodos: Todo[] = snap.docs.map((doc) => {
                const todoPayload = doc.data();
                if (!isTodoPayload(todoPayload)) {
                  alert("Invalid todo data");
                  throw new Error("Invalid todo data");
                }

                return {
                  id: doc.id,
                  title: todoPayload.title,
                  done: todoPayload.done,
                } satisfies Todo;
              });

              onChange(latestTodos);
            }
          );
          return () => unsubscribe();
        }}
        subscribePresence={(onChange) => {
          const unsubscribe = onSnapshot(presenceCollection, (snap) => {
            const presences: UserPresence[] = snap.docs.map(
              (doc) =>
                ({
                  userId: doc.id,
                  ...doc.data(),
                } as UserPresence)
            );

            onChange(presences);
          });
          return () => unsubscribe();
        }}
        createTodo={async (todo) => {
          await addDoc(todosCollection, {
            title: todo.title,
            done: !!todo.done,
            createdAt: serverTimestamp(),
          });
        }}
        updateTodo={async (id, todo) => {
          await updateDoc(doc(db, TODOS_COLLECTION_NAME, id), todo);
        }}
        deleteTodo={async (id) => {
          await deleteDoc(doc(db, TODOS_COLLECTION_NAME, id));
        }}
        updatePresence={async (userId, userName, action) => {
          await setDoc(doc(db, PRESENCE_COLLECTION_NAME, userId), {
            userName,
            action,
            lastUpdated: Date.now(),
          });
        }}
      />
    </div>
  );
};
