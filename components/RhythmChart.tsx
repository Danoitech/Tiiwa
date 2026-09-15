import type { DayStats } from '@/db/queries';
import { colors } from '@/theme/colors';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

function depthForHour(hour: number, bands: DayStats['sleepBands']) {
  for (const band of bands) {
    if (hour >= band.start && hour < band.end) return 9;
    if (Math.abs(hour - band.start) < 0.6 || Math.abs(hour - band.end) < 0.6) return 7;
  }
  return 3;
}

export function RhythmChart({ stats }: { stats: DayStats }) {
  const [width, setWidth] = useState(0);
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const values = hours.map((h) => depthForHour(h, stats.sleepBands));
  const h = 72;
  const max = 10;
  const path = width
    ? values
        .map((v, i) => {
          const x = (i / 23) * width;
          const y = h - (v / max) * (h - 8);
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ') + ` L ${width} ${h} L 0 ${h} Z`
    : '';

  return (
    <View style={styles.card} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 24)}>
      <Text style={styles.title}>Today's rhythm</Text>
      <View style={{ height: h }}>
        {width > 0 && (
          <Svg width={width} height={h}>
            <Defs>
              <LinearGradient id="rhythmFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.mint} stopOpacity={0.5} />
                <Stop offset="100%" stopColor={colors.mint} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            <Path d={path} fill="url(#rhythmFill)" stroke={colors.mint} strokeWidth={2} />
          </Svg>
        )}
      </View>
      <View style={styles.dots}>
        {stats.feedHours.map((hour, i) => (
          <View key={`f${hour}-${i}`} style={[styles.feedDot, { left: `${(hour / 23) * 100}%` }]} />
        ))}
        {stats.nappyHours.map((hour, i) => (
          <View key={`n${hour}-${i}`} style={[styles.nappyDot, { left: `${(hour / 23) * 100}%` }]} />
        ))}
      </View>
      <View style={styles.axis}>
        <Text style={styles.axisText}>12am</Text>
        <Text style={styles.axisText}>6am</Text>
        <Text style={styles.axisText}>12pm</Text>
        <Text style={styles.axisText}>6pm</Text>
        <Text style={styles.axisText}>12am</Text>
      </View>
      <View style={styles.legend}>
        <Legend color={colors.mint} label="Sleep depth" />
        <Legend color={colors.amber} label="Feed" />
        <Legend color={colors.peach} label="Nappy" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    color: colors.inkDim,
    marginBottom: 6,
  },
  dots: {
    height: 14,
    marginTop: 2,
    position: 'relative',
  },
  feedDot: {
    position: 'absolute',
    top: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.amber,
    marginLeft: -3.5,
  },
  nappyDot: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.peach,
    marginLeft: -3,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  axisText: {
    fontSize: 9,
    color: colors.inkDim,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.inkDim,
  },
});
