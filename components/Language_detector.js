import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    const isRTL = newLang === "ar";

    await i18n.changeLanguage(newLang);

    // Optional: Uncomment if you decide to manage RTL layout later
    // if (I18nManager.isRTL !== isRTL) {
    //   I18nManager.forceRTL(isRTL);
    //   Alert.alert("Restart the app to apply RTL layout.");
    // }
  };

  const getLabel = () => (i18n.language === "en" ? "العربية" : "English");

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
        <Text style={styles.buttonText}>{getLabel()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
