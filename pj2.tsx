import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
export default function App() {
  const [counter, setCounter] = useState<number>(0);
  const increment = (): void => setCounter(counter + 1);
  const decrement = (): void => setCounter(counter - 1);
  const reset = (): void => setCounter(0);
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Compteur de Button</Text>
      <Text style={styles.counter}> {counter}</Text>
      <View style={styles.buttonContainer}>
        <Button title="➕" onPress={increment} />
        <Button title="➖" onPress={decrement} />
        <Button title="🔄" onPress={reset} />
      </View>
    </View>
  );
}
const styles=StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    backgroundColor:'pink',
    justifyContent:'center',
    padding:20,

  },
  title:{
    fontSize:25,
    color:'yellow',
    fontWeight:'bold',
    marginBottom:20,
  },
   counter: {
    fontSize: 48,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },

});