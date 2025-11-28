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
  orderBy,
  where,
  doc,
  getDocs,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "./firebaseConfig";

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

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);

  // 일정 시간 입력용 초기값
  const now = new Date();
  const [dateStr, setDateStr] = useState(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  );
  const [timeStr, setTimeStr] = useState(
    `${pad(now.getHours())}:${pad(now.getMinutes())}`
  );

  /********** 인증 상태 감시 **********/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  /********** 실시간(onSnapshot) **********/
  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("uid", "==", user.uid),
    //  orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

       // 최신이 위로 오게 (내림차순)
      list.sort((a, b) => b.createdAt - a.createdAt);
      setTodos(list);
    });

    return unsubscribe;
  }, [user]);

  /********** 로그인 **********/
    const signIn = () =>
    signInWithEmailAndPassword(auth, email, password).catch((err) => {
      console.error(err);
      Alert.alert("로그인 오류", err.message);
    });

  const signOut = () => fbSignOut(auth);

  /********** 강제 새로고침 (선택 사항) **********/
  const loadTodos = async (currentUser) => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "todos"),
        where("uid", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTodos(list);
    } catch (error) {
      console.log("강제 새로고침 오류:", error);
    }
  };

  /********** CRUD **********/
  const addTodo = async () => {
    if (!text.trim()) return;
    if (!user) {
      Alert.alert("알림", "먼저 로그인해 주세요.");
      return;
    }

    // 날짜/시간 파싱
    const parsed = parseDateTimeOrNull(dateStr, timeStr);
    if (parsed === "INVALID_FORMAT") {
      Alert.alert(
        "형식 오류",
        "날짜는 YYYY-MM-DD, 시간은 HH:mm 형식으로 입력하세요."
      );
      return;
    }
    if (parsed === "INVALID_DATE") {
      Alert.alert("날짜 오류", "존재하지 않는 날짜/시간입니다.");
      return;
    }

    const createdAt = parsed ?? Date.now();

    try {
      await addDoc(collection(db, "todos"), {
        uid: user.uid,
        text: text.trim(),
        done: false,
        createdAt,
        completedAt: null,
      });

      setText("");
      // 필요하면 수동 새로고침 (onSnapshot 쓰고 있으므로 없어도 됨)
      // await loadTodos(user);
    } catch (e) {
      console.error(e);
      Alert.alert("저장 오류", "할 일을 저장하는 중 오류가 발생했습니다.");
    }
  };

  const toggleTodo = async (item) => {
    if (!user) return;
    const newDone = !item.done;

    try {
      await updateDoc(doc(db, "todos", item.id), {
        done: newDone,
        completedAt: newDone ? Date.now() : null,
      });

      // onSnapshot 이 알아서 목록 갱신
      // 필요시 강제 새로고침도 가능: await loadTodos(user);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTodo = async (id) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "todos", id));
      // onSnapshot 이 알아서 목록 갱신
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>🔥 Firebase Sample</Text>

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

          {/* 생성 시간 선택/입력 */}
          <View style={{ marginBottom: 8, paddingTop: 20 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
              약속 시간(선택):
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                autoCorrect={false}
                autoCapitalize="none"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#aaa",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  height: 40,
                }}
              />
              <TextInput
                value={timeStr}
                onChangeText={setTimeStr}
                placeholder="HH:mm"
                autoCorrect={false}
                autoCapitalize="none"
                style={{
                  width: 100,
                  borderWidth: 1,
                  borderColor: "#aaa",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  height: 40,
                }}
              />
            </View>
            <Text style={{ color: "#888", marginTop: 4 }}>
              입력 없으면 현재 시간으로 저장됩니다.
            </Text>
          </View>

          {/* 할 일 입력창 */}
          <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="할 일 입력"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#aaa",
                borderRadius: 8,
                paddingHorizontal: 10,
                height: 40,
              }}
            />
            <Button title="추가" onPress={addTodo} />
          </View>

          {/* 타이틀 박스 */}
          <View
            style={{
              backgroundColor: "#f2f2f2",
              padding: 12,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "#ccc",
              marginBottom: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              일정 관리
            </Text>
          </View>

          {/* 목록 */}
          <FlatList
            style={{ marginTop: 20 }}
            data={todos}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={{ color: "#777", marginVertical: 16 }}>
                아직 등록된 할 일이 없습니다.
              </Text>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: item.done ? "#e7f6e7" : "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                  borderRadius: 8,
                  marginVertical: 4,
                  padding: 8,
                }}
              >
                {/* 커스텀 체크박스 */}
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
                  {item.done && (
                    <Text style={{ color: "white", fontWeight: "bold" }}>✓</Text>
                  )}
                </Pressable>

                {/* 텍스트 */}
                <Pressable
                  style={{ flex: 1, marginLeft: 10 }}
                  onPress={() => toggleTodo(item)}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      textDecorationLine: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12 }}>
                    일시: {fmt(item.createdAt)}
                    {item.completedAt
                      ? ` · 완료 ${fmt(item.completedAt)}`
                      : ""}
                  </Text>
                </Pressable>

                {/* 체크된 항목만 삭제 버튼 표시 */}
                {item.done && (
                  <Pressable
                    onPress={() => deleteTodo(item.id)}
                    style={{
                      backgroundColor: "#ff6666",
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>🗑</Text>
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