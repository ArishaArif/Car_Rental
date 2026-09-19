import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface CalendarPickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onSelectRange: (start: string, end: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  startDate,
  endDate,
  onSelectRange,
}) => {
  const { colors, typography, borderRadius } = useTheme();

  // Initial month view based on startDate or current date
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Build days for current month view
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDayPress = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const clickedDateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const clickedTime = new Date(clickedDateStr).getTime();
    const startTime = startDate ? new Date(startDate).getTime() : 0;
    const endTime = endDate ? new Date(endDate).getTime() : 0;

    // Selection logic:
    // 1. If no start date or both already selected, start a new range
    if (!startDate || (startDate && endDate && startTime !== endTime)) {
      // Set start date, temporary end date same day
      onSelectRange(clickedDateStr, clickedDateStr);
    } else if (startDate && (!endDate || startTime === endTime)) {
      // Second click: completing range
      if (clickedTime >= startTime) {
        onSelectRange(startDate, clickedDateStr);
      } else {
        // Clicked before start, make it new start
        onSelectRange(clickedDateStr, clickedDateStr);
      }
    }
  };

  // Render day cells
  const renderDays = () => {
    const cells = [];

    // Blank cells before day 1
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`blank-${i}`} style={styles.dayCell} />);
    }

    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate).getTime() : 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      const cellDate = new Date(currentYear, currentMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = cellDate.getTime() < today.getTime();
      const isStart = startDate === dateStr;
      const isEnd = endDate === dateStr;
      const cellTime = cellDate.getTime();
      const isInRange =
        startTimestamp &&
        endTimestamp &&
        cellTime > startTimestamp &&
        cellTime < endTimestamp;

      let cellBackground = 'transparent';
      let textColor = colors.textPrimary;
      let fontWeight: '400' | '700' | '800' = '400';

      if (isStart || isEnd) {
        cellBackground = colors.primary;
        textColor = colors.textInverse;
        fontWeight = '800';
      } else if (isInRange) {
        cellBackground = 'rgba(0, 229, 255, 0.15)';
        textColor = colors.primary;
        fontWeight = '700';
      } else if (isPast) {
        textColor = colors.textMuted;
      }

      cells.push(
        <TouchableOpacity
          key={`day-${d}`}
          disabled={isPast}
          activeOpacity={0.7}
          onPress={() => handleDayPress(d)}
          style={[
            styles.dayCell,
            {
              backgroundColor: cellBackground,
              borderRadius: isStart || isEnd ? borderRadius.md : 0,
              opacity: isPast ? 0.35 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              {
                color: textColor,
                fontSize: typography.fontSizes.sm,
                fontWeight,
              },
            ]}
          >
            {d}
          </Text>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const isCurrentMonthOrPast =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      {/* Month Header Navigation */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          disabled={isCurrentMonthOrPast}
          onPress={handlePrevMonth}
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              opacity: isCurrentMonthOrPast ? 0.3 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>‹</Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.monthTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
            },
          ]}
        >
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekdaysRow}>
        {WEEK_DAYS.map((wd, i) => (
          <View key={i} style={styles.dayCell}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: i === 0 || i === 6 ? colors.primary : colors.textMuted,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '600',
                },
              ]}
            >
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>{renderDays()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    padding: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitle: {
    letterSpacing: -0.2,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  dayText: {
    textAlign: 'center',
  },
});
