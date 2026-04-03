import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';

interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchHeader({
  value,
  onChangeText,
  placeholder = 'Search documents...',
}: SearchHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.input}
        iconColor={theme.colors.onSurfaceVariant}
        elevation={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    borderRadius: 14,
    height: 48,
  },
  input: {
    fontSize: 15,
  },
});
