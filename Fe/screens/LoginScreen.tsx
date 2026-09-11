import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  async function submit() {
    const error = await login(phone, password);
    if (error) {
      Alert.alert('Không đăng nhập được', error);
      return;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng trở lại</Text>
      <Text style={styles.hint}>Đăng nhập bằng số điện thoại của bạn.</Text>
      <AppInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        label="Số điện thoại"
      />
      <View style={{ height: 12 }} />
      <AppInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu"
        secureTextEntry
        label="Mật khẩu"
      />
      <View style={{ height: 20 }} />
      <AppButton label="ĐĂNG NHẬP" onPress={submit} />
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
    marginBottom: 8,
  },
  hint: {
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
  },
});
