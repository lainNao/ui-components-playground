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
  updateDoc,
} from "firebase/firestore";
import { useMemo, useRef } from "react";
import { SAMPLE_FIREBASE_PROJECT_ID } from "../consts";
import { RealtimeSyncTodo } from "./realtime-sync-todo";
import { isTodoPayload, type Todo, useOnMount } from "./util";

export default {};

const TODOS_COLLECTION_NAME = "todos";

export const Default = () => {
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

  useOnMount(() => {
    fetch("http://localhost:8080").catch(() => {
      alert(
        "このサンプルはローカルで Firestore エミュレータが起動している必要があります"
      );
    });
  });

  return (
    <RealtimeSyncTodo
      subscribe={(onChange) => {
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
    />
  );
};
