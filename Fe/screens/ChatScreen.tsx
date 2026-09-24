import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
type ChatMessage = { id: string; sender: string; message: string; date: string };

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  async function send() {
    const message = text.trim();
    if (!user?.id || !message) return;
    try {
      setText('');
      setMessages((current) => [...current, { id: `${Date.now()}`, sender: 'NguoiDung', message, date: new Date().toISOString() }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      Alert.alert('Không thể gửi tin nhắn', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.avatar}><Ionicons name="headset-outline" size={22} color={colors.accent} /></View>
        <View><Text style={styles.title}>Tư vấn cùng Admin</Text><Text style={styles.subtitle}>Phản hồi trong giờ làm việc</Text></View>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'NguoiDung' ? styles.mine : styles.theirs]}>
            <Text style={[styles.message, item.sender === 'NguoiDung' && styles.mineText]}>{item.message}</Text>
            <Text style={[styles.time, item.sender === 'NguoiDung' && styles.mineTime]}>{new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Hãy để lại câu hỏi về sản phẩm, size hoặc đơn hàng.</Text>}
      />
      <View style={styles.composer}>
        <TextInput value={text} onChangeText={setText} placeholder="Viết tin nhắn..." placeholderTextColor="#9A9188" style={styles.input} multiline />
        <Pressable style={[styles.send, !text.trim() && styles.sendDisabled]} onPress={send} disabled={!text.trim()}><Ionicons name="send" size={18} color="#fff" /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F2E1D4', alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  messages: { padding: 16, gap: 10, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { color: colors.muted, textAlign: 'center', padding: 28, lineHeight: 20 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: radius.md, gap: 5 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  message: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  mineText: { color: '#fff' },
  time: { color: colors.muted, fontSize: 10, alignSelf: 'flex-end' },
  mineTime: { color: 'rgba(255,255,255,0.75)' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, maxHeight: 100, minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, color: colors.ink, backgroundColor: colors.bg },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
});
