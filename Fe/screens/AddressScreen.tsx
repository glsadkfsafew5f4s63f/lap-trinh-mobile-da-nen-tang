import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ApiAddress, createAddressApi, deleteAddressApi, getApiAddresses, updateAddressApi } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Address'>;
type AddressFields = Omit<ApiAddress, 'MaDiaChi'>;

export default function AddressScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');

  async function loadAddresses(selectId?: number | null) {
    const rows = await getApiAddresses();
    setAddresses(rows);
    const selected = rows.find((row) => row.MaDiaChi === selectId) || rows[0];
    if (selected) selectAddress(selected);
    else setAddressId(null);
  }

  useEffect(() => {
    void loadAddresses().catch((error) => Alert.alert('Không tải được địa chỉ', error instanceof Error ? error.message : 'Vui lòng thử lại.'));
  }, []);

  function selectAddress(item: ApiAddress) {
    setAddressId(item.MaDiaChi);
    setName(item.TenNguoiNhan);
    setPhone(item.SoDienThoai);
    setAddress(item.DiaChiChiTiet);
    setWard(item.PhuongXa || '');
    setDistrict(item.QuanHuyen || '');
    setProvince(item.TinhThanh || '');
  }

  function createNewAddress() {
    setAddressId(null);
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setAddress('');
    setWard('');
    setDistrict('');
    setProvince('');
  }

  async function save() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Nhập đầy đủ tên, số điện thoại và địa chỉ.');
      return;
    }
    const payload: AddressFields = {
      TenNguoiNhan: name.trim(),
      SoDienThoai: phone.trim(),
      DiaChiChiTiet: address.trim(),
      PhuongXa: ward.trim(),
      QuanHuyen: district.trim(),
      TinhThanh: province.trim(),
      LaMacDinh: 1,
    };
    try {
      if (addressId) await updateAddressApi(addressId, payload);
      else {
        const result = await createAddressApi(payload);
        setAddressId(result.insertId);
      }
      await loadAddresses(addressId);
      Alert.alert('Đã lưu', 'Địa chỉ đã được cập nhật trên hệ thống.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Không thể lưu địa chỉ', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  }

  function confirmDelete(item: ApiAddress) {
    Alert.alert('Xóa địa chỉ', `Xóa địa chỉ của ${item.TenNguoiNhan}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddressApi(item.MaDiaChi);
            const remaining = await getApiAddresses();
            if (remaining.length && !remaining.some((row) => row.LaMacDinh)) {
              const nextDefault = remaining[0];
              await updateAddressApi(nextDefault.MaDiaChi, { ...nextDefault, LaMacDinh: 1 });
            }
            await loadAddresses(addressId === item.MaDiaChi ? null : addressId);
          } catch (error) {
            Alert.alert('Không thể xóa địa chỉ', error instanceof Error ? error.message : 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressTitle}>Địa chỉ đã lưu</Text>
        <Pressable onPress={createNewAddress}><Text style={styles.addAddress}>+ Thêm mới</Text></Pressable>
      </View>
      {addresses.map((item) => (
        <View key={item.MaDiaChi} style={[styles.addressCard, addressId === item.MaDiaChi && styles.addressSelected]}>
          <Pressable style={styles.addressBody} onPress={() => selectAddress(item)}>
            <Text style={styles.savedAddressName}>{item.TenNguoiNhan}{item.LaMacDinh ? ' · Mặc định' : ''}</Text>
            <Text style={styles.savedAddressText}>{item.SoDienThoai} · {item.DiaChiChiTiet}</Text>
            <Text style={styles.savedAddressText}>{[item.PhuongXa, item.QuanHuyen, item.TinhThanh].filter(Boolean).join(', ')}</Text>
          </Pressable>
          <Pressable onPress={() => confirmDelete(item)} hitSlop={8}><Text style={styles.deleteAddress}>Xóa</Text></Pressable>
        </View>
      ))}
      <AppInput value={name} onChangeText={setName} placeholder="Người nhận" label="Người nhận" />
      <View style={styles.gap} />
      <AppInput value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" label="Số điện thoại" />
      <View style={styles.gap} />
      <AppInput value={address} onChangeText={setAddress} placeholder="Địa chỉ chi tiết" multiline label="Địa chỉ chi tiết" style={styles.addressInput} />
      <View style={styles.gap} />
      <AppInput value={ward} onChangeText={setWard} placeholder="Phường / xã" label="Phường / xã" />
      <View style={styles.gap} />
      <AppInput value={district} onChangeText={setDistrict} placeholder="Quận / huyện" label="Quận / huyện" />
      <View style={styles.gap} />
      <AppInput value={province} onChangeText={setProvince} placeholder="Tỉnh / thành phố" label="Tỉnh / thành phố" />
      <View style={styles.gapLarge} />
      <AppButton label="LƯU ĐỊA CHỈ" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  gap: { height: 12 },
  gapLarge: { height: 20 },
  addressInput: { minHeight: 90, textAlignVertical: 'top' },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  addressTitle: { color: colors.ink, fontWeight: '700', fontSize: 15 },
  addAddress: { color: colors.accent, fontWeight: '700' },
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface },
  addressSelected: { borderColor: colors.accent },
  addressBody: { flex: 1, gap: 4 },
  savedAddressName: { color: colors.ink, fontWeight: '700' },
  savedAddressText: { color: colors.muted, fontSize: 12 },
  deleteAddress: { color: '#B42318', fontWeight: '700' },
});