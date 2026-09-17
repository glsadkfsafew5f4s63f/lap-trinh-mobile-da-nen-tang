import { Image } from 'expo-image';
import { useState } from 'react';
import {
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors, radius } from '../constants/theme';
import { banners } from '../data/products';

const { width } = Dimensions.get('window');
const HEIGHT = 440;

type Props = {
  onShop?: () => void;
};

export function HomeBanner({ onShop }: Props) {
  const [index, setIndex] = useState(0);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.page}>
            <Pressable style={styles.slide} onPress={onShop}>
              <Image
                source={{ uri: banner.image }}
                style={styles.image}
                contentFit="cover"
                transition={450}
              />
              <View style={styles.overlay} />
              <View style={styles.copy}>
                <View style={styles.eyebrow}>
                  <View style={styles.eyebrowLine} />
                  <Text style={styles.kicker}>ATELIER LOOKBOOK</Text>
                </View>
                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.subtitle}</Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{banner.cta.toUpperCase()}</Text>
                </View>
              </View>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.sliderFooter}>
        <Text style={styles.counter}>{String(index + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}</Text>
        <View style={styles.dots}>
        {banners.map((banner, i) => (
          <View key={banner.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width,
    paddingHorizontal: 20,
  },
  slide: {
    height: HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1A1A1A',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,6,4,0.34)',
  },
  copy: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eyebrowLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.gold,
  },
  kicker: {
    color: '#fff',
    letterSpacing: 3.2,
    fontSize: 11,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#fff',
    marginTop: 8,
    fontSize: 15,
    opacity: 0.92,
  },
  cta: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  ctaText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  sliderFooter: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  counter: {
    position: 'absolute',
    left: 20,
    top: 11,
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D4CEC4',
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
});
