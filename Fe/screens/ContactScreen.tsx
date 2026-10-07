import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { createContactApi } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Contact'>;

export default function ContactScreen(_props: Props) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [contactCode, setContactCode] = useState<number | null>(null);

  async function submit() {
    setError('');
    setContactCode(null);
    setSending(true);
    try {
      const result = await createContactApi({
        HoTen: name.trim(),
        Email: email.trim() || undefined,
        SoDienThoai: phone.trim() || undefined,
        ChuDe: subject.trim() || undefined,
        NoiDung: message.trim(),
      });
      setContactCode(result.MaLienHe);
      setSubject('');
      setMessage('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được yêu cầu. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>HỖ TRỢ KHÁCH HÀNG</Text>
      <Text style={styles.title}>Liên hệ với cửa hàng</Text>
      <Text style={styles.description}>Gửi câu hỏi hoặc yêu cầu của bạn. Nhân viên sẽ liên hệ lại qua email hoặc số điện thoại.</Text>

      <View style={styles.form}>
        <AppInput label="Họ tên *" value={name} onChangeText={setName} autoCapitalize="words" maxLength={100} />
        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" maxLength={100} />
        <AppInput label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} />
        <AppInput label="Chủ đề" value={subject} onChangeText={setSubject} maxLength={255} />
        <AppInput
          label="Nội dung *"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={5000}
          textAlignVertical="top"
          style={styles.message}
        />
        <Text style={styles.hint}>Cần cung cấp email hoặc số điện thoại để cửa hàng phản hồi.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {contactCode ? (
          <Text accessibilityRole="alert" style={styles.success}>Đã gửi yêu cầu LH-{String(contactCode).padStart(5, '0')}.</Text>
        ) : null}
        <AppButton label={sending ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU'} onPress={() => void submit()} disabled={sending} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 36 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '600' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  form: { gap: 16, padding: 16, backgroundColor: colors.surface, borderRadius: radius.md },
  message: { minHeight: 132 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: -8 },
  error: { color: '#A52D25', fontSize: 13 },
  success: { color: '#28734D', fontSize: 13, fontWeight: '600' },
});