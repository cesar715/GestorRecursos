import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, RadioButton, Card } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudiante');

  // Validación estricta según requerimientos del documento
  const validarPassword = (pass) => {
    const minLongitud = pass.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(pass);
    const tieneMinuscula = /[a-z]/.test(pass);
    const tieneNumero = /\d/.test(pass);
    const tieneEspecial = /[!@#$%^&*]/.test(pass);

    return minLongitud && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
  };

  const handleAuth = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre de usuario o correo.");
      return;
    }

    if (!validarPassword(password)) {
      Alert.alert(
        "Contraseña no válida",
        "La contraseña debe cumplir con los siguientes requisitos:\n\n" +
        "• Mínimo 12 caracteres\n" +
        "• Al menos una letra mayúscula\n" +
        "• Al menos una letra minúscula\n" +
        "• Al menos un número\n" +
        "• Al menos un carácter especial (!@#$%^&*)"
      );
      return;
    }

    login(username, role);
    Alert.alert("Éxito", `Bienvenido ${username} (${role})`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Recursos de Aprendizaje" subtitle="Sistema de Gestión ACAAI - UDB" />
        <Card.Content>
          <Text variant="titleMedium" style={styles.subtitle}>Iniciar Sesión / Registro</Text>
          
          <TextInput
            label="Usuario / Correo"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.roleLabel}>Selecciona tu rol:</Text>
          <RadioButton.Group onValueChange={newValue => setRole(newValue)} value={role}>
            <View style={styles.radioRow}>
              <RadioButton value="Estudiante" />
              <Text>Estudiante</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="Docente" />
              <Text>Docente</Text>
            </View>
          </RadioButton.Group>

          <Button mode="contained" onPress={handleAuth} style={styles.button}>
            Ingresar
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 10,
  },
  subtitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  roleLabel: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  button: {
    marginTop: 15,
  },
});