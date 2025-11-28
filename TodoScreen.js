// screens/TodoScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  Alert,
} from "react-native";

import {
  db,
  auth,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  doc,
  getDocs,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "./firebaseConfig";   // ★★★ 경로 주의!!

/******** utils ********/
const pad = (n) => String(n).padStart(2, "0");

const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

function parseDateTimeOrNull(dateStr, timeStr) {
  const d = (dateStr || "").trim();
  const t = (timeStr || "").trim();
  if (!d && !t) return null;

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(d);
  const timeOk = /^\d{2}:\d{2}$/.test(t);
  if (!dateOk || !timeOk) return "INVALID_FORMAT";

  const [Y, M, D] = d.split("-").map((x) => parseInt(x, 10));
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  const jsDate = new Date(Y, M - 1, D, h, m, 0, 0);
  if (isNaN(jsDate.getTime())) return "INVALID_DATE";

  return jsDate.getTime();
}

export default function TodoScreen() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);

  // 기본 날짜/시간
  const now = new Date();
  const [dateStr, setDateStr] = useState(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  );
  const [timeStr, setTimeStr] = useState(
    `${pad(now.getHours())}:${pad(now.getMinutes())}`
  );

  /********** Authentication state watcher **********/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  /********** Realtime Firestore (onSnapshot) **********/
  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      list.sort((a, b) => b.createdAt - a.createdAt);
      setTodos(list);
    });

    return unsubscribe;
  }, [user]);

  /********** Login **********/
  const signIn = () =>
    signInWithEmailAndPassword(auth, email, password).catch((err) => {
      Alert.alert("로그인 오류", err.message);
    });

  const signOut = () => fbSignOut(auth);

  /********** CRUD **********/
  const addTodo = async () => {
    if (!text.trim()) return;
    if (!user) return Alert.alert("로그인 필요", "로그인이 필요합니다.");

    const parsed = parseDateTimeOrNull(dateStr, timeStr);
    if (parsed === "INVALID_FORMAT") {
      return Alert.alert("형식 오류", "날짜: YYYY-MM-DD, 시간: HH:mm");
    }
    if (parsed === "INVALID_DATE") {
      return Alert.alert("오류", "유효하지 않은 날짜입니다.");
    }

    const createdAt = parsed ?? Date.now();

    await addDoc(collection(db, "todos"), {
      uid: user.uid,
      text: text.trim(),
      done: false,
      createdAt,
      completedAt: null,
    });

    setText("");
  };

  const toggleTodo = async (item) => {
    if (!user) return;

    const newDone = !item.done;

    await updateDoc(doc(db, "todos", item.id), {
      done: newDone,
      completedAt: newDone ? Date.now() : null,
    });
  };

  const deleteTodo = async (id) => {
    if (!user) return;

    await deleteDoc(doc(db, "todos", id));
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>🔥 Firebase Todo</Text>

      {!user ? (
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          />
          <Button title="Login" onPress={signIn} />
        </View>
      ) : (
        <>
          <Text style={{ marginVertical: 10 }}>로그인됨: {user.email}</Text>
          <Button title="로그아웃" onPress={signOut} />

          {/* 날짜/시간 입력 */}
          <View style={{ marginBottom: 8, paddingTop: 20 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
              약속 시간(선택):
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 8,
                }}
              />
              <TextInput
                value={timeStr}
                onChangeText={setTimeStr}
                placeholder="HH:mm"
                style={{
                  width: 100,
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 8,
                }}
              />
            </View>
          </View>

          {/* 입력 */}
          <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="할 일 입력"
              style={{
                flex: 1,
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
              }}
            />
            <Button title="추가" onPress={addTodo} />
          </View>

          {/* 목록 */}
          <FlatList
            style={{ marginTop: 20 }}
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: item.done ? "#e7f6e7" : "#fff",
                  borderBottomWidth: 1,
                  marginVertical: 4,
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <Pressable
                  onPress={() => toggleTodo(item)}
                  style={{
                    width: 24,
                    height: 24,
                    borderWidth: 2,
                    borderColor: item.done ? "#2e7d32" : "#aaa",
                    borderRadius: 4,
                    backgroundColor: item.done ? "#2e7d32" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.done && <Text style={{ color: "white" }}>✓</Text>}
                </Pressable>

                <Pressable
                  onPress={() => toggleTodo(item)}
                  style={{ flex: 1, marginLeft: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      textDecorationLine: item.done
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12 }}>
                    일시: {fmt(item.createdAt)}
                    {item.completedAt ? ` · 완료 ${fmt(item.completedAt)}` : ""}
                  </Text>
                </Pressable>

                {item.done && (
                  <Pressable
                    onPress={() => deleteTodo(item.id)}
                    style={{
                      backgroundColor: "#ff6666",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>🗑</Text>
                  </Pressable>
                )}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}