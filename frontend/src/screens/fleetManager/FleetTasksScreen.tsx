import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FleetManagerStackParamList, FleetTask } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Input, Button, EmptyState } from '../../components/common';

type FleetTasksNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetTasks'
>;

interface Props {
  navigation: FleetTasksNavProp;
}

export const FleetTasksScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { tasks, toggleTask, addTask } = useFleet();

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskVehicle] = useState('Toyota Corolla');
  const [newTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    try {
      await addTask({
        title: newTaskTitle.trim(),
        description: 'Operational dispatch task created by fleet manager.',
        vehicleName: newTaskVehicle,
        priority: newTaskPriority,
        dueTime: 'Today 06:00 PM',
        status: 'Pending',
        category: 'Preparation',
      });
      setNewTaskTitle('');
      setShowAddModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const renderTask = ({ item }: { item: FleetTask }) => {
    const isDone = item.status === 'Completed';

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[
          styles.taskCard,
          {
            borderColor: colors.border,
            opacity: isDone ? 0.7 : 1,
          },
        ]}
        onPress={() => toggleTask(item.id)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Check Circle */}
          <TouchableOpacity
            onPress={() => toggleTask(item.id)}
            style={[
              styles.checkbox,
              {
                borderColor: isDone ? colors.accent : colors.border,
                backgroundColor: isDone ? colors.accent : 'transparent',
              },
            ]}
          >
            {isDone ? <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>✓</Text> : null}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                color: isDone ? colors.textMuted : colors.textPrimary,
                fontSize: typography.fontSizes.sm + 1,
                fontWeight: '700',
                textDecorationLine: isDone ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {item.vehicleName ? `${item.vehicleName} • ` : ''}Due {item.dueTime}
            </Text>
          </View>

          <View
            style={[
              styles.priorityPill,
              {
                backgroundColor:
                  item.priority === 'High'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : item.priority === 'Medium'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text
              style={{
                color:
                  item.priority === 'High'
                    ? colors.danger
                    : item.priority === 'Medium'
                    ? colors.warning
                    : colors.accent,
                fontSize: 10,
                fontWeight: '800',
              }}
            >
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Daily Ops Task Checklist"
          subtitle={`${tasks.filter(t => t.status === 'Pending').length} Pending Tasks`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="+ Task"
              size="small"
              variant="primary"
              onPress={() => setShowAddModal(!showAddModal)}
            />
          }
        />
      }
    >
      {/* Quick Add Form Drawer */}
      {showAddModal ? (
        <Card variant="flat" padding="medium" style={[styles.addCard, { borderColor: colors.primary }]}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>
            Add Operational Task
          </Text>
          <Input
            placeholder="e.g. Relocate vehicle to Terminal 2 bay"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Cancel"
              variant="outline"
              size="small"
              style={{ flex: 1 }}
              onPress={() => setShowAddModal(false)}
            />
            <Button
              title="Add Task"
              variant="primary"
              size="small"
              style={{ flex: 1 }}
              onPress={handleCreateTask}
            />
          </View>
        </Card>
      ) : null}

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        {(['All', 'Pending', 'Completed'] as const).map(tab => {
          const isSelected = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              style={[
                styles.tabBtn,
                { borderBottomColor: isSelected ? colors.primary : 'transparent' },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? colors.primary : colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: 12,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="All Caught Up!"
            message="No active operational tasks under this view."
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  addCard: {
    margin: 12,
    borderWidth: 1.5,
  },
  filterBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  listContent: {
    paddingBottom: 32,
    gap: 8,
  },
  taskCard: {
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
