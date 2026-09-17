import { colors } from '@/theme/colors';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

export type WeekPoint = {
  key: string;
  day: string;
  feeds: number;
  nappies: number;
  sleep: number;
};

export function WeekChart({
  data,
  selectedKey,
  onSelect,
}: {
  data: WeekPoint[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
}) {
  const [width, setWidth] = useState(0);
  const height = 150;
  const padLeft = 22;
  const padRight = 22;
  const padTop = 8;
  const padBottom = 22;
  const innerW = Math.max(0, width - padLeft - padRight);
  const innerH = height - padTop - padBottom;
  const maxCount = Math.max(10, ...data.map((d) => Math.max(d.feeds, d.nappies)));
  const maxSleep = Math.max(16, ...data.map((d) => d.sleep));
  const groupW = innerW / Math.max(data.length, 1);

  return (
    <View style={styles.card} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 20)}>
      <View style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {[0, 0.5, 1].map((t) => (
              <Line
                key={t}
                x1={padLeft}
                x2={width - padRight}
                y1={padTop + innerH * (1 - t)}
                y2={padTop + innerH * (1 - t)}
                stroke={colors.divider}
              />
            ))}
            {data.map((d, i) => {
              const x = padLeft + i * groupW + groupW / 2;
              const feedH = (d.feeds / maxCount) * innerH;
              const nappyH = (d.nappies / maxCount) * innerH;
              const selected = d.key === selectedKey;
              return (
                <G key={d.key}>
                  {selected ? (
                    <Rect
                      x={x - groupW / 2 + 4}
                      y={padTop}
                      width={Math.max(8, groupW - 8)}
                      height={innerH}
                      rx={8}
                      fill={colors.mintDeep}
                    />
                  ) : null}
                  <Rect x={x - 10} y={padTop + innerH - feedH} width={8} height={feedH} rx={4} fill={colors.amber} />
                  <Rect x={x + 2} y={padTop + innerH - nappyH} width={8} height={nappyH} rx={4} fill={colors.peach} />
                </G>
              );
            })}
            {data.map((d, i) => {
              const x = padLeft + i * groupW + groupW / 2;
              const y = padTop + innerH - (d.sleep / maxSleep) * innerH;
              const prev = i > 0 ? data[i - 1] : null;
              const prevX = padLeft + (i - 1) * groupW + groupW / 2;
              const prevY = prev ? padTop + innerH - (prev.sleep / maxSleep) * innerH : y;
              return (
                <G key={`s${d.key}`}>
                  {prev && <Line x1={prevX} y1={prevY} x2={x} y2={y} stroke={colors.mint} strokeWidth={2} />}
                  <Circle cx={x} cy={y} r={3} fill={colors.mint} />
                </G>
              );
            })}
          </Svg>
        )}
        {width > 0 && onSelect ? (
          <View style={[styles.hitRow, { left: padLeft, right: padRight }]}>
            {data.map((d) => (
              <Pressable key={`hit-${d.key}`} style={styles.hit} onPress={() => onSelect(d.key)} />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.days}>
        {data.map((d) => (
          <Pressable key={d.key} onPress={() => onSelect?.(d.key)} style={styles.dayHit} disabled={!onSelect}>
            <Text style={[styles.day, d.key === selectedKey && styles.daySelected]}>{d.day}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.legend}>
        <Legend color={colors.amber} label="Feeds" square />
        <Legend color={colors.peach} label="Nappies" square />
        <Legend color={colors.mint} label="Sleep (h)" />
      </View>
    </View>
  );
}

function Legend({ color, label, square }: { color: string; label: string; square?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color, borderRadius: square ? 2 : 4 }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 14,
  },
  hitRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  hit: {
    flex: 1,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -18,
    marginBottom: 8,
    paddingHorizontal: 18,
  },
  dayHit: {
    width: 28,
    alignItems: 'center',
  },
  day: {
    fontSize: 10,
    color: colors.inkDim,
    textAlign: 'center',
  },
  daySelected: {
    color: colors.mint,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 7,
    height: 7,
  },
  legendText: {
    fontSize: 10,
    color: colors.inkDim,
  },
});
