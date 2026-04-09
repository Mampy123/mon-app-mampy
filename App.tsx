import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  Keyboard, Dimensions, Switch, Alert, KeyboardAvoidingView, Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get("window").width;
const STORAGE_KEY = "@pocket_expenses";
const MONTHLY_BUDGETS_KEY = "@pocket_monthly_budgets";

const categories = [
  { id: "Sakafo", en: "Food", fr: "Alimentation", mg: "Sakafo", color: "#f1c40f", icon: "restaurant" },
  { id: "Fitaterana", en: "Transport", fr: "Transport", mg: "Fitaterana", color: "#e67e22", icon: "directions-bike" },
  { id: "Fianarana", en: "Studies", fr: "Études", mg: "Fianarana", color: "#3498db", icon: "school" },
  { id: "Hafa", en: "Other", fr: "Autre", mg: "Hafa", color: "#95a5a6", icon: "more-horiz" }
];

const translations = {
  en: {
    home: "Home", add: "Add", settings: "Settings", lang: "Language", theme: "Dark Mode",
    search: "Search...", placeholder: "Item name...", amount: "Amount...", date: "Date",
    error: "Error", checkData: "Please check your data", save: "Save", edit: "Edit",
    delete: "Delete", cancel: "Cancel", deleteMsg: "Delete this expense?",
    availableThisMonth: "Available this month", spentThisMonth: "Spent this month",
    spentToday: "Spent today", remaining: "Remaining", baseBudget: "Base budget",
    rollover: "Rollover from previous month", budgetUpdated: "Budget updated",
    expensesByCategory: "Expenses by category", success: "Success", saved: "Saved!"
  },
  fr: {
    home: "Accueil", add: "Ajouter", settings: "Paramètres", lang: "Langue", theme: "Mode Sombre",
    search: "Rechercher...", placeholder: "Nom de l'article...", amount: "Montant...", date: "Date",
    error: "Erreur", checkData: "Vérifiez vos données", save: "Enregistrer", edit: "Modifier",
    delete: "Supprimer", cancel: "Annuler", deleteMsg: "Supprimer cette dépense ?",
    availableThisMonth: "Budget disponible ce mois", spentThisMonth: "Dépensé ce mois",
    spentToday: "Dépensé aujourd'hui", remaining: "Restant", baseBudget: "Budget de base",
    rollover: "Reporté du mois précédent", budgetUpdated: "Budget mis à jour",
    expensesByCategory: "Dépenses par catégorie", success: "Succès", saved: "Enregistré !"
  },
  mg: {
    home: "Trano", add: "Hampiditra", settings: "Safidy", lang: "Fiteny", theme: "Loko maizina",
    search: "Hikaroka...", placeholder: "Inona ny vidina...", amount: "Hoatrinona...", date: "Daty",
    error: "Tsy mety", checkData: "Azafady verifio", save: "Tehirizina", edit: "Ovaina",
    delete: "Hafafa", cancel: "Hanafoana", deleteMsg: "Hofafana ve ity fandaniana ity?",
    availableThisMonth: "Tetibola misy an'ity volana ity", spentThisMonth: "Lany ity volana ity",
    spentToday: "Lany androany", remaining: "Sisa", baseBudget: "Tetibola fototra",
    rollover: "Nampitaina avy amin'ny volana lasa", budgetUpdated: "Tetibola nohavaozina",
    expensesByCategory: "Lany isaky ny sokajy", success: "Vita", saved: "Voatahiry!"
  }
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState({});
  const [lang, setLang] = useState('mg');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = translations[lang];
  const theme = isDarkMode ? darkTheme : lightTheme;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedExp = await AsyncStorage.getItem(STORAGE_KEY);
        const savedBudgets = await AsyncStorage.getItem(MONTHLY_BUDGETS_KEY);
        if (savedExp) setExpenses(JSON.parse(savedExp));
        if (savedBudgets) setMonthlyBudgets(JSON.parse(savedBudgets));
      } catch (e) { console.error(e); }
      finally { setIsLoaded(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      AsyncStorage.setItem(MONTHLY_BUDGETS_KEY, JSON.stringify(monthlyBudgets));
    }
  }, [expenses, monthlyBudgets, isLoaded]);

  const getPreviousMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const prev = new Date(year, month - 2, 1);
    return prev.toISOString().slice(0, 7);
  };

  const previousMonth = getPreviousMonth(currentMonth);
  const baseBudget = monthlyBudgets[currentMonth] || 500000;

  const previousMonthSpent = useMemo(() =>
    expenses.filter(e => e.date.startsWith(previousMonth))
      .reduce((sum, e) => sum + e.amount, 0), [expenses, previousMonth]
  );

  const previousRemaining = (monthlyBudgets[previousMonth] || 500000) - previousMonthSpent;
  const rolloverAmount = Math.max(previousRemaining, 0);
  const effectiveMonthlyBudget = baseBudget + rolloverAmount;

  const currentMonthSpent = useMemo(() =>
    expenses.filter(e => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0), [expenses, currentMonth]
  );

  const dailyTotal = useMemo(() =>
    expenses.filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0), [expenses, todayStr]
  );

  const monthlyRemaining = effectiveMonthlyBudget - currentMonthSpent;

  const updateMonthlyBudget = (newBaseBudget) => {
    if (!newBaseBudget || newBaseBudget <= 0) return;
    setMonthlyBudgets(prev => ({ ...prev, [currentMonth]: newBaseBudget }));
    Alert.alert(t.budgetUpdated, `${t.baseBudget}: ${newBaseBudget.toLocaleString('fr-FR')} Ar`);
  };

  // HOME SCREEN ======================
  const HomeScreen = ({ navigation }) => {
    const [search, setSearch] = useState("");

    const filteredExpenses = useMemo(() =>
      expenses
        .filter(e => e.label.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
      [expenses, search]
    );

    const pieChartData = useMemo(() => {
      return categories.map(cat => {
        const total = expenses
          .filter(e => e.category === cat.id && e.date.startsWith(currentMonth))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          name: cat[lang],
          population: total,
          color: cat.color,
          legendFontColor: isDarkMode ? "#FFF" : "#333",
          legendFontSize: 12
        };
      }).filter(item => item.population > 0);
    }, [expenses, currentMonth, lang, isDarkMode]);

    return (
      <SafeAreaView style={[styles.container, theme.bg]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <FlatList
          data={filteredExpenses}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <>
              <View style={[styles.budgetCard, { backgroundColor: isDarkMode ? '#1F2A44' : '#2C3E50' }]}>
                <Text style={styles.whiteLabel}>{t.availableThisMonth} — {currentMonth}</Text>
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Text style={styles.effectiveBudgetText}>{effectiveMonthlyBudget.toLocaleString('fr-FR')} Ar</Text>
                  {rolloverAmount > 0 && (
                    <Text style={{ color: '#2ecc71', fontSize: 13 }}>+ {rolloverAmount.toLocaleString('fr-FR')} Ar {t.rollover}</Text>
                  )}
                </View>
                <View style={styles.budgetDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t.spentThisMonth}</Text>
                    <Text style={styles.detailValue}>{currentMonthSpent.toLocaleString('fr-FR')} Ar</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t.remaining}</Text>
                    <Text style={[styles.detailValue, monthlyRemaining < 0 && { color: '#e74c3c' }]}>{monthlyRemaining.toLocaleString('fr-FR')} Ar</Text>
                  </View>
                </View>
              </View>

              {currentMonthSpent > 0 && (
                <View style={[styles.card, theme.card]}>
                  <Text style={[styles.sectionTitle, theme.text]}>{t.expensesByCategory}</Text>
                  <PieChart
                    data={pieChartData}
                    width={screenWidth - 40}
                    height={180}
                    chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    absolute
                  />
                </View>
              )}

              <TextInput
                style={[styles.input, theme.input]}
                placeholder={t.search}
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
              />
            </>
          }
          renderItem={({ item }) => {
            const catInfo = categories.find(c => c.id === item.category);
            return (
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Add', { expense: item })}>
                <View style={[styles.item, theme.card]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MaterialIcons name={catInfo?.icon} size={30} color={catInfo?.color} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemLabel, theme.text]}>{item.label}</Text>
                      <Text style={styles.subText}>{catInfo ? catInfo[lang] : item.category} • {item.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>-{item.amount.toLocaleString('fr-FR')} Ar</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    );
  };

  // ====================== ADD / EDIT SCREEN ======================
  const AddEditScreen = ({ route, navigation }) => {
    const isEditing = route?.params?.expense;
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [cat, setCat] = useState("Sakafo");
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
      if (isEditing) {
        setLabel(isEditing.label);
        setAmount(isEditing.amount.toString());
        setCat(isEditing.category);
        setDate(new Date(isEditing.date));
      } else {
        resetForm();
      }
    }, [isEditing]);

    const resetForm = () => {
      setLabel(""); setAmount(""); setCat("Sakafo"); setDate(new Date());
      navigation.setParams({ expense: null });
    };

    const handleDelete = () => {
      Alert.alert(t.delete, t.deleteMsg, [
        { text: t.cancel, style: "cancel" },
        { text: t.delete, style: "destructive", onPress: () => {
          setExpenses(prev => prev.filter(e => e.id !== isEditing.id));
          resetForm();
          navigation.navigate('Home');
        }}
      ]);
    };

    const handleSave = () => {
      const num = parseFloat(amount);
      if (!label.trim() || isNaN(num) || num <= 0) {
        Alert.alert(t.error, t.checkData);
        return;
      }
      const newExpense = {
        id: isEditing?.id || Date.now().toString(),
        label: label.trim(),
        amount: num,
        category: cat,
        date: date.toISOString().split('T')[0]
      };
      if (isEditing) {
        setExpenses(prev => prev.map(e => e.id === isEditing.id ? newExpense : e));
      } else {
        setExpenses(prev => [newExpense, ...prev]);
      }
      Keyboard.dismiss();
      Alert.alert(t.success, t.saved);
      resetForm();
      navigation.navigate('Home');
    };

    return (
      <SafeAreaView style={[styles.container, theme.bg]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Text style={[styles.title, theme.text]}>{isEditing ? t.edit : t.add}</Text>
          <View style={[styles.card, theme.card]}>
            <TextInput style={[styles.input, theme.input]} placeholder={t.placeholder} value={label} onChangeText={setLabel} />
            <TextInput style={[styles.input, theme.input]} placeholder={t.amount} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TouchableOpacity style={[styles.input, theme.input, { justifyContent: 'center' }]} onPress={() => setShowPicker(true)}>
              <Text style={theme.text}>{t.date}: {date.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showPicker && <DateTimePicker value={date} mode="date" onChange={(e, s) => { setShowPicker(false); if (s) setDate(s); }} />}
            
            <View style={styles.rowAround}>
              {categories.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setCat(c.id)} style={[styles.catBtn, cat === c.id && styles.activeCat]}>
                  <MaterialIcons name={c.icon} size={24} color={cat === c.id ? "#FFF" : c.color} />
                  <Text style={[cat === c.id ? styles.whiteText : theme.text, {fontSize: 10}]}>{c[lang]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={handleSave}>
              <Text style={styles.whiteText}>{isEditing ? t.save : t.add}</Text>
            </TouchableOpacity>

            <View style={styles.rowBetween}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}><Text style={theme.text}>{t.cancel}</Text></TouchableOpacity>
              {isEditing && <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}><Text style={styles.whiteText}>{t.delete}</Text></TouchableOpacity>}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  // ====================== SETTINGS SCREEN ======================
  const SettingsScreen = () => {
    const [bInput, setBInput] = useState("");
    return (
      <SafeAreaView style={[styles.container, theme.bg]}>
        <Text style={[styles.title, theme.text]}>{t.settings}</Text>
        <View style={[styles.card, theme.card]}>
          <Text style={[styles.label, theme.text]}>{t.baseBudget} ({currentMonth})</Text>
          <View style={styles.rowBetween}>
            <TextInput style={[styles.input, theme.input, { width: '60%' }]} placeholder={baseBudget.toString()} keyboardType="numeric" value={bInput} onChangeText={setBInput} />
            <TouchableOpacity style={[styles.mainBtn, { marginTop: 0, paddingVertical: 12, width: '35%' }]} onPress={() => { if (bInput) { updateMonthlyBudget(parseFloat(bInput)); setBInput(""); Keyboard.dismiss(); } }}>
              <Text style={styles.whiteText}>{t.save}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.card, theme.card]}>
          <Text style={[styles.label, theme.text]}>{t.lang}</Text>
          <View style={styles.rowAround}>
            {['en', 'fr', 'mg'].map(l => (
              <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.langBtn, lang === l && styles.activeBtn]}>
                <Text style={lang === l ? styles.whiteText : theme.text}>{l.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.card, theme.card]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, theme.text]}>{t.theme}</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const icons = { Home: 'home', Add: 'add-circle', Settings: 'settings' };
              return <Ionicons name={icons[route.name]} size={size} color={color} />;
            },
            headerShown: false,
            tabBarStyle: { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF', height: 60 },
            tabBarActiveTintColor: '#3498db',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: t.home }} />
          <Tab.Screen name="Add" component={AddEditScreen} options={{ title: t.add }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t.settings }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const lightTheme = { bg: { backgroundColor: '#F0F2F5' }, text: { color: '#2C3E50' }, card: { backgroundColor: '#FFFFFF' }, input: { backgroundColor: '#F9F9F9', borderColor: '#DDD', color: '#000' } };
const darkTheme = { bg: { backgroundColor: '#121212' }, text: { color: '#FFFFFF' }, card: { backgroundColor: '#1E1E1E' }, input: { backgroundColor: '#2C2C2C', borderColor: '#444', color: '#FFFFFF' } };

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginVertical: 15, textAlign: 'center' },
  card: { padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  budgetCard: { padding: 20, borderRadius: 20, marginVertical: 10, elevation: 4 },
  whiteLabel: { color: '#BDC3C7', fontSize: 14 },
  effectiveBudgetText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  budgetDetails: { marginTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { color: '#BDC3C7', fontSize: 14 },
  detailValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  rowAround: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15 },
  mainBtn: { backgroundColor: '#3498db', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  secondaryBtn: { borderWidth: 1, borderColor: '#95a5a6', padding: 14, borderRadius: 10, flex: 1, marginRight: 5, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, flex: 1, marginLeft: 5, alignItems: 'center' },
  langBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  activeBtn: { backgroundColor: '#3498db', borderColor: '#3498db' },
  catBtn: { padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', width: 75 },
  activeCat: { backgroundColor: '#3498db', borderColor: '#3498db' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  item: { padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 16, fontWeight: '600' },
  subText: { fontSize: 12, color: '#888' },
  itemPrice: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 }
});
