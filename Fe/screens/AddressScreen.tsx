import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { createAddressApi, getApiAddresses, updateAddressApi } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Address'>;

export default function AddressScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [addressId, setAddressId] = useState<number | null>(null);

  useEffect(() => {
    getApiAddresses().then((addresses) => {
      const current = addresses[0];
      if (!current) return;
      setAddressId(current.MaDiaChi);
      setName(current.TenNguoiNhan);
      setPhone(current.SoDienThoai);
      setAddress(current.DiaChiChiTiet);
    }).catch(() => undefined);
  }, []);

  async function save() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Nhập đầy đủ tên, SĐT và địa chỉ.');
      return;
    }
    const payload = { TenNguoiNhan: name.trim(), SoDienThoai: phone.trim(), DiaChiChiTiet: address.trim(), LaMacDinh: 1 };
    try {
      if (addressId) await updateAddressApi(addressId, payload);
      else { const result = await createAddressApi(payload); setAddressId(result.insertId); }
      updateUser({ name: payload.TenNguoiNhan, phone: payload.SoDienThoai, address: payload.DiaChiChiTiet });
      Alert.alert('Đã lưu', 'Địa chỉ nhận hàng đã được cập nhật.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Không thể lưu địa chỉ', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  }

  return (
    <View style={styles.container}>
      <AppInput value={name} onChangeText={setName} placeholder="Người nhận" label="Người nhận" />
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
        value={address}
        onChangeText={setAddress}
        placeholder="Địa chỉ"
        multiline
        label="Địa chỉ"
        style={styles.address}
      />
      <View style={{ height: 20 }} />
      <AppButton label="LƯU ĐỊA CHỈ" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  address: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
