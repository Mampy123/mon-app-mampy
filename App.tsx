import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [counter, setCounter] = useState<number>(0);

  // Charger la valeur sauvegardée
  useEffect(() => {
    loadCounter();
  }, []);

  const loadCounter = async (): Promise<void> => {
    const value = await AsyncStorage.getItem('counter');
    if (value !== null) {
      setCounter(parseInt(value));
    }
  };

  // Sauvegarder à chaque changement
  useEffect(() => {
    saveCounter();
  }, [counter]);

  const saveCounter = async (): Promise<void> => {
    await AsyncStorage.setItem('counter', counter.toString());
  };

  const increment = (): void => setCounter(counter + 1);
  const decrement = (): void => setCounter(counter - 1);
  const reset = (): void => setCounter(0);

  // 🎨 Couleur dynamique
  const getColor = (): string => {
    if (counter > 0) return 'green';
    if (counter < 0) return 'red';
    return 'black';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compteur Intelligent 🚀</Text>

      <Text style={[styles.counter, { color: getColor() }]}>
        {counter}
      </Text>

      <View style={styles.buttons}>
        <Button title="➕" onPress={increment} />
        <Button title="➖" onPress={decrement} />
        <Button title="🔄 Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
  },
  counter: {
    fontSize: 50,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
});