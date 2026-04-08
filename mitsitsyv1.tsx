import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
type Expense = {
  id: string;
  label: string;
  amount: number;
  categories: string; // Nouvelle donnée
  date: string; // Nouvelle donnée
};
const STORAGE_KEY = "my_express";
const CATEGORIES = ["Sakafo ", "Fitanterana ", "Fianarana", "Hafa"];
export default function App() {
  const [label, setLabel] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [categories, setCategories] = useState("Fianarana");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useEffect(() => {
    const loadExpress = async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setExpenses(JSON.parse(data));
    };
    loadExpress();
  }, []);
  useEffect(() => {
    const saveExpenses = async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    };
    saveExpenses();
  }, [expenses]);
  const addExpense = () => {
    const numericAmount = parseFloat(amount);
    if (label.trim() === "" || isNaN(numericAmount)) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      label: label,
      categories,
      date: new Date().toLocaleDateString("fr-FR"),

      amount: numericAmount,
    };
    setExpenses([newExpense, ...expenses]);
    setLabel("");
    setAmount("");
    Keyboard.dismiss();
  };
  const confirmationSupp = (id: string) => {
    Alert.alert("Ho Fafana", "Tinao ho fafana ve io ?", [
      { text: "Tsia" },
      {
        text: "Eny",
        onPress: () => setExpenses(expenses.filter((item) => item.id !== id)),
      },
    ]);
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitantanana Vola 💰</Text>
      <View style={styles.totalCard}>
        <Text style={styles.label}> Fitambarany Vola lany :</Text>
        <Text style={styles.value}> {total} AR</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Inona zavatra novidina ?"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={styles.input}
          placeholder="Vidiny ?"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <View style={styles.catContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, categories === cat && styles.catBtnActive]}
              onPress={() => setCategories(cat)}
            >
              <Text
                style={[
                  styles.catText,
                  categories === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addboutton} onPress={addExpense}>
          <Text style={styles.addButtontext}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View style={styles.item}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemSub}>
                {item.categories} • {item.date}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>{item.amount} AR</Text>
            <TouchableOpacity onPress={() => confirmationSupp(item.id)}>
              <Text style={styles.deleteText}>Hamafa</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "pink",
  },
  totalCard: {
    backgroundColor: "#36cd75",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
  },
  value: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  catContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  catBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F0F2F5" },
  catBtnActive: { backgroundColor: "#3498DB" },
  catText: { fontSize: 12, color: "#666" },
  catTextActive: { color: "#FFF", fontWeight: "bold" },
  form: { marginBottom: 20 },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addboutton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtontext: {
    color: "white",
    fontWeight: "bold",
  },
  item: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLabel: { fontSize: 16, fontWeight: "bold" },
  itemSub: { fontSize: 12, color: "#AAA" },
  expenseLabel: { fontSize: 16, flex: 1 },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginRight: 15,
  },
  deleteText: { color: "#999", fontSize: 12 },
});
