import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountInfo'>;

export default function AccountInfoScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  function save() {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Họ tên không được trống.');
      return;
    }
    updateUser({ name: name.trim() });
    Alert.alert('Đã lưu', 'Thông tin tài khoản đã cập nhật (local).', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      <AppInput value={name} onChangeText={setName} placeholder="Họ tên" label="Họ tên" />
      <View style={{ height: 12 }} />
      <AppInput
        value={phone}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        label="Số điện thoại"
        editable={false}
      />
      <View style={{ height: 20 }} />
      <AppButton label="LƯU" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
});
