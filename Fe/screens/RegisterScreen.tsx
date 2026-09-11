import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  async function submit() {
    const error = await register(name, phone, password);
    if (error) {
      Alert.alert('Không đăng ký được', error);
      return;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <Text style={styles.hint}>Mỗi số điện thoại chỉ được đăng ký một tài khoản.</Text>
      <AppInput value={name} onChangeText={setName} placeholder="Họ tên" label="Họ tên" />
      <View style={{ height: 12 }} />
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
      <AppButton label="ĐĂNG KÝ" onPress={submit} />
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
  },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
  },
});
