import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CreditCard from '../components/CreaditCard';

export default function Payment() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Payment Information</Text>
      <CreditCard />
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity style={styles.button}>
          <Text style={{ textAlign: 'center' }}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    justifyContent: "center",
    backgroundColor: "orange",
    width: 250,
    height: 50,
    borderRadius: 20
  }
});
