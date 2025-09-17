import { useCallback, useEffect, useRef, useState } from "react";
import type { PresenceAction, Todo, UserPresence } from "./util";
import { type TodoPayload, useOnMount } from "./util";

const PRESENCE_CLEANUP_INTERVAL = 5000; // 5秒
const PRESENCE_TIMEOUT = 30000; // 30秒

export function RealtimeSyncTodoWithPresence({
  subscribeTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  subscribePresence,
  updatePresence,
  currentUserId,
}: {
  subscribeTodos: (callback: (todos: Todo[]) => void) => () => void;
  createTodo: (todo: TodoPayload) => void;
  updateTodo: (id: string, todo: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  subscribePresence: (
    callback: (presences: UserPresence[]) => void
  ) => () => void;
  updatePresence: (
    userId: string,
    userName: string,
    action: PresenceAction
  ) => void;
  currentUserId: string;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [userName, setUserName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const timeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // プレゼンスの自動クリーンアップ
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setPresences((prev) =>
        prev.filter((p) => now - p.lastUpdated < PRESENCE_TIMEOUT)
      );
    }, PRESENCE_CLEANUP_INTERVAL);

    return () => clearInterval(cleanup);
  }, []);

  useOnMount(() => {
    const unsubscribeTodos = subscribeTodos((todos) => {
      setTodos(todos);
    });

    const unsubscribePresence = subscribePresence((presences) => {
      setPresences(presences);
    });

    return () => {
      unsubscribeTodos();
      unsubscribePresence();
    };
  });

  const updateUserPresence = useCallback(
    (action: PresenceAction) => {
      if (userName.trim()) {
        updatePresence(currentUserId, userName, action);
      }
    },
    [userName, currentUserId, updatePresence]
  );

  const handleClickCreate = async (data: FormData) => {
    const title = data.get("title")?.toString() || "";
    if (title.trim() === "") return;

    createTodo({
      title,
      done: false,
    });

    updateUserPresence({ type: "idle" });
  };

  const handleClickComplete = (id: string, done: boolean) => {
    updateTodo(id, { done });
  };

  const handleClickDelete = (id: string) => {
    deleteTodo(id);
  };

  const handleTodoEdit = (todoId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingTodoId(todoId);
      updateUserPresence({ type: "editing-title", todoId });

      // タイムアウトで自動的にアイドル状態にする
      if (timeoutRef.current[todoId]) {
        clearTimeout(timeoutRef.current[todoId]);
      }

      timeoutRef.current[todoId] = setTimeout(() => {
        setEditingTodoId(null);
        updateUserPresence({ type: "idle" });
        delete timeoutRef.current[todoId];
      }, 10000);
    } else {
      if (timeoutRef.current[todoId]) {
        clearTimeout(timeoutRef.current[todoId]);
        delete timeoutRef.current[todoId];
      }
      setEditingTodoId(null);
      updateUserPresence({ type: "idle" });
    }
  };

  const handleAddingTodo = (isAdding: boolean) => {
    if (isAdding) {
      updateUserPresence({ type: "adding-todo" });
    } else {
      updateUserPresence({ type: "idle" });
    }
  };

  // 指定したTodoまたはアクションに対するプレゼンスを取得
  const getPresenceForTodo = (todoId: string) => {
    return presences.filter(
      (p) =>
        p.userId !== currentUserId &&
        p.action.type === "editing-title" &&
        p.action.todoId === todoId
    );
  };

  const getPresenceForAdding = () => {
    return presences.filter(
      (p) => p.userId !== currentUserId && p.action.type === "adding-todo"
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      {/* ユーザー名入力 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#f5f5f5",
          borderRadius: "5px",
        }}
      >
        <label>
          <strong>ユーザー名: </strong>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="あなたの名前を入力"
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </label>
      </div>

      {/* Todo追加フォーム */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleClickCreate(formData);
            e.currentTarget.reset();
          }}
        >
          <input
            name="title"
            type="text"
            placeholder="新しいTodoを入力"
            onFocus={() => handleAddingTodo(true)}
            onBlur={() => handleAddingTodo(false)}
            style={{
              padding: "8px",
              marginRight: "10px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 15px",
              borderRadius: "3px",
              border: "1px solid #007bff",
              background: "#007bff",
              color: "white",
            }}
          >
            Add Todo
          </button>
        </form>

        {/* 新規追加中のプレゼンス表示 */}
        {getPresenceForAdding().map((presence) => (
          <div
            key={presence.userId}
            style={{
              position: "absolute",
              top: "-25px",
              left: "0",
              background: "#007bff",
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              zIndex: 10,
              pointerEvents: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {presence.userName} が入力中...
          </div>
        ))}
      </div>

      {/* Todoリスト */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => {
          const todoPresences = getPresenceForTodo(todo.id);

          return (
            <li
              key={todo.id}
              style={{
                position: "relative",
                padding: "10px",
                marginBottom: "5px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                background: editingTodoId === todo.id ? "#fff3cd" : "white",
              }}
            >
              {/** biome-ignore lint/a11y/noStaticElementInteractions: ボタンのみでなくまとめてマウスイベントをつけたいので親でやる */}
              <div
                style={{ display: "flex", alignItems: "center" }}
                onMouseEnter={() => handleTodoEdit(todo.id, true)}
                onMouseLeave={() => handleTodoEdit(todo.id, false)}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={(e) =>
                    handleClickComplete(todo.id, e.target.checked)
                  }
                  style={{ marginRight: "10px" }}
                />
                <button
                  type="button"
                  style={{
                    flex: 1,
                    textDecoration: todo.done ? "line-through" : "none",
                    color: todo.done ? "#666" : "inherit",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => handleTodoEdit(todo.id, !editingTodoId)}
                >
                  {todo.title}
                </button>
                <button
                  type="button"
                  onClick={() => handleClickDelete(todo.id)}
                  style={{
                    padding: "5px 10px",
                    marginLeft: "10px",
                    borderRadius: "3px",
                    border: "1px solid #dc3545",
                    background: "#dc3545",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>

              {/* このTodoを編集中の他のユーザーのプレゼンス表示 */}
              {todoPresences.map((presence, index) => (
                <div
                  key={presence.userId}
                  style={{
                    position: "absolute",
                    top: `${-25 - index * 20}px`,
                    left: "50px",
                    background: "#28a745",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    zIndex: 10,
                    pointerEvents: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {presence.userName} が編集中
                </div>
              ))}
            </li>
          );
        })}
      </ul>

      {/* アクティブユーザー一覧 */}
      {presences.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            アクティブユーザー:
          </h3>
          <div>
            {presences
              .filter((p) => p.userId !== currentUserId)
              .map((presence) => (
                <div
                  key={presence.userId}
                  style={{ marginBottom: "5px", fontSize: "14px" }}
                >
                  <strong>{presence.userName}</strong>:{" "}
                  {presence.action.type === "adding-todo" &&
                    "新しいTodoを追加中"}
                  {presence.action.type === "editing-title" &&
                    `Todo「${
                      todos.find(
                        (t) =>
                          presence.action.type === "editing-title" &&
                          t.id === presence.action.todoId
                      )?.title || "不明"
                    }」を編集中`}
                  {presence.action.type === "idle" && "アイドル"}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
