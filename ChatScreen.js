// ChatScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

// Firebase 관련 함수들 import
import {
  db,
  auth,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "./firebaseConfig";

import { serverTimestamp } from "firebase/firestore";

// AuthContext에서 로그인 상태 가져오기
import { useAuth } from "./login.js";

function ChatScreenApp() {
  // 메시지 배열
  const [messages, setMessages] = useState([]);
  // 입력창 텍스트 상태
  const [text, setText] = useState("");
  // 로그인 사용자 정보 및 초기 로딩 여부
  const { user, initializing } = useAuth();

  // Firestore의 messages 컬렉션을 실시간으로 구독
  useEffect(() => {
    // 1) 로그인 체크가 진행 중이면 아무것도 하지 않음
    if (initializing) return;

    // 2) 로그인이 안 되어 있으면 구독 취소 및 메시지 초기화
    if (!user) {
      setMessages([]);
      return;
    }

    // 3) createdAt 내림차순으로 메시지 정렬하여 실시간으로 가져오기
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    // Firestore 실시간 구독
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id, // 문서 ID
        ...doc.data(), // 문서 데이터
      }));
      setMessages(list);
    });

    // 화면을 벗어나면 구독 해제
    return unsubscribe;
  }, [user, initializing]);

  // 메시지 전송 함수
  const sendMessage = async () => {
    const user = auth.currentUser;

    // 로그인 안 되어 있거나 입력창이 비어 있으면 무시
    if (!user || !text.trim()) return;

    try {
      // Firestore messages 컬렉션에 새 문서 추가
      await addDoc(collection(db, "messages"), {
        text: text.trim(),           // 보낼 메시지 내용
        createdAt: serverTimestamp(), // Firestore 서버시간
        userId: user.uid,             // 보낸 사용자 ID
        userName: user.email ?? "익명", // 사용자 이메일 (없으면 익명)
      });

      // 입력창 비우기
      setText("");
    } catch (e) {
      console.log("sendMessage error:", e);
    }
  };

  // FlatList의 각 메시지 렌더링
  const renderItem = ({ item }) => {
    const isMe = item.userId === auth.currentUser?.uid; // 내가 작성한 메시지인지 체크

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage, // 스타일 분리
        ]}
      >
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80} // 키보드가 입력창을 가리지 않게 offset 설정
    >
      {/* 메시지 목록 */}
      <FlatList
        style={styles.list}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted // 최신 메시지를 아래가 아닌 위로 정렬 (채팅 UX)
      />

      {/* 메시지 입력창 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지를 입력하세요"
        />
        <Button title="전송" onPress={sendMessage} />
      </View>

      {/* 입력창과 화면 하단이 가까울 경우 여백 */}
      <View style={{ marginBottom: 50 }} />
    </KeyboardAvoidingView>
  );
}

export default ChatScreenApp;

// ==============================
// 스타일 정의
// ==============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    padding: 8,
  },
  messageContainer: {
    maxWidth: "70%",   // 한 줄 메시지가 너무 길어지지 않도록 제한
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  // 내가 보내는 메시지 스타일
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6", // WhatsApp 스타일 초록 배경
  },
  // 다른 사람이 보내는 메시지 스타일
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
  },
  userName: {
    fontSize: 10,
    marginBottom: 2,
    color: "#555",
  },
  messageText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row", // 입력창 + 버튼 수평 정렬
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,              // 입력창 넓게
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
});