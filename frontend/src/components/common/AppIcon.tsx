import React from 'react';
import { StyleSheet, View } from 'react-native';

export type AppIconName = 'chatbubble-ellipses' | 'log-out-outline';

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, color, size = 20 }) => {
  if (name === 'chatbubble-ellipses') {
    const strokeWidth = Math.max(1.5, size * 0.08);

    return (
      <View style={[styles.icon, { width: size, height: size }]}>
        <View
          style={[
            styles.chatBubble,
            {
              width: size * 0.9,
              height: size * 0.68,
              borderColor: color,
              borderWidth: strokeWidth,
              borderRadius: size * 0.24,
            },
          ]}
        >
          <View style={styles.dots}>
            {[0, 1, 2].map(dot => (
              <View
                key={dot}
                style={{
                  width: size * 0.11,
                  height: size * 0.11,
                  borderRadius: size * 0.06,
                  backgroundColor: color,
                }}
              />
            ))}
          </View>
        </View>
        <View
          style={[
            styles.bubbleTail,
            {
              width: size * 0.22,
              height: size * 0.22,
              borderColor: color,
              borderRightWidth: strokeWidth,
              borderBottomWidth: strokeWidth,
              left: size * 0.15,
              bottom: size * 0.13,
            },
          ]}
        />
      </View>
    );
  }

  const strokeWidth = Math.max(1.5, size * 0.09);

  return (
    <View style={[styles.icon, { width: size, height: size }]}>
      <View
        style={[
          styles.doorFrame,
          {
            width: size * 0.48,
            height: size * 0.8,
            borderColor: color,
            borderTopWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
            left: size * 0.46,
            top: size * 0.1,
          },
        ]}
      />
      <View
        style={[
          styles.arrowLine,
          {
            height: strokeWidth,
            width: size * 0.62,
            backgroundColor: color,
            left: size * 0.04,
            top: size * 0.48,
          },
        ]}
      />
      <View
        style={[
          styles.arrowHead,
          {
            width: size * 0.27,
            height: strokeWidth,
            backgroundColor: color,
            left: size * 0.4,
            top: size * 0.31,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.arrowHead,
          {
            width: size * 0.27,
            height: strokeWidth,
            backgroundColor: color,
            left: size * 0.4,
            top: size * 0.65,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bubbleTail: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  doorFrame: {
    position: 'absolute',
  },
  arrowLine: {
    position: 'absolute',
    borderRadius: 1,
  },
  arrowHead: {
    position: 'absolute',
    borderRadius: 1,
  },
});
