import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../constants/theme';
import { Category } from '../data/products';

type Props = {
  category: Category;
  onPress: () => void;
  variant?: 'tile' | 'story' | 'chip';
};

export function CategoryCard({ category, onPress, variant = 'tile' }: Props) {
  if (variant === 'chip') {
    return (
      <Pressable style={styles.chip} onPress={onPress}>
        <Image source={{ uri: category.image }} style={styles.chipImage} contentFit="cover" />
        <Text style={styles.chipName}>{category.name}</Text>
      </Pressable>
    );
  }

  if (variant === 'story') {
    return (
      <Pressable style={styles.story} onPress={onPress}>
        <Image source={{ uri: category.image }} style={styles.storyImage} contentFit="cover" />
        <View style={styles.storyOverlay} />
        <View style={styles.storyCopy}>
          <Text style={styles.storyKicker}>BỘ SƯU TẬP</Text>
          <Text style={styles.storyName}>{category.name}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <Text style={styles.name}>{category.name.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    borderRadius: radius.md,
    overflow: 'hidden',
    margin: 6,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EDE6DC',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  name: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1.8,
    fontSize: 13,
    padding: 14,
  },
  chip: {
    width: 86,
    alignItems: 'center',
    marginRight: 14,
  },
  chipImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EDE6DC',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  chipName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  story: {
    height: 210,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'flex-end',
  },
  storyImage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EDE6DC',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,8,6,0.32)',
  },
  storyCopy: {
    padding: 20,
  },
  storyKicker: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 2,
    opacity: 0.85,
    marginBottom: 4,
  },
  storyName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
