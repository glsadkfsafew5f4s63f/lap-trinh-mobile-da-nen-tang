import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../constants/theme';

type Props = {
  onPress: () => void;
};

export function HomeSearchBar({ onPress }: Props) {
  return (
    <Pressable style={styles.bar} onPress={onPress}>
      <Ionicons name="search-outline" size={20} color={colors.muted} />
      <View style={styles.copy}>
        <Text style={styles.placeholder}>Tìm áo, quần, giày...</Text>
        <Text style={styles.hint}>Thương hiệu · danh mục · giá</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  copy: {
    flex: 1,
  },
  placeholder: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
