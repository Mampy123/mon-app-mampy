import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
export default function App() {
  const [message, setMessage] = useState("Hello Everyone !");

  return (
    <View style={styles.container}>
      <Text style={styles.text}> {message}</Text>
      <Button
        title="Clic me "
        onPress={() => setMessage("Vous avez cliqué !")}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});