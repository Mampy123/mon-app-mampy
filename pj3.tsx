import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
      Touchz
  const loadTasks = async () => {
    const data = await AsyncStorage.getItem(Storage_key);
    if (data) setTasks(JSON.parse(data));
  };
  const addTask = () => {
    if (task.trim() === "") return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
    };
    setTasks((prev) => [...prev, newTask]);
    setTask("");
  };
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Ireo zavatra atao </Text>
      <TextInput
        style={styles.input}
        placeholder="Mampidira zavatra tokony atao ..."
        value={task}
        onChangeText={setTask}
      />
      <Button title="Hampiditra" onPress={addTask}/>
    <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <Text style={styles.task}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  task: {
    padding: 15,
    backgroundColor: '#eee',
    marginTop: 10,
    borderRadius: 5,
  },
});