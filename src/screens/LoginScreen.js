import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Card, HelperText, Icon } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudiante');

  // Validaciones de seguridad
  const tieneLongitud = password.length >= 12;
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneMinuscula = /[a-z]/.test(password);
  const tieneNumero = /\d/.test(password);
  const tieneEspecial = /[!@#$%^&*]/.test(password);
  const passwordValido = tieneLongitud && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;

  const mostrarMensaje = (titulo, mensaje) => {
    if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensaje}`);
    else Alert.alert(titulo, mensaje);
  };

  const handleAuth = () => {
    if (!username.trim()) {
      mostrarMensaje("Campo requerido", "Ingresa tu usuario o correo electrónico.");
      return;
    }
    if (!passwordValido) {
      mostrarMensaje("Seguridad", "La contraseña no cumple con los requisitos mínimos.");
      return;
    }
    login(username, role);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerBackground}>
        <Text style={styles.headerTitle}>ACAAI</Text>
        <Text style={styles.headerSubtitle}>Sistema de Gestión de Recursos</Text>
      </View>

      <Card style={styles.card} elevation={5}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Bienvenido de nuevo</Text>
          
          <TextInput
            label="Usuario o Correo"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="account" color="#64748B" />}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="lock" color="#64748B" />}
          />
          
          <HelperText type="error" visible={password.length > 0 && !passwordValido} style={styles.helperText}>
            Requiere: 12+ caracteres, mayúscula, minúscula, número y símbolo (!@#$%^&*).
          </HelperText>

          <Text style={styles.roleLabel}>Selecciona tu perfil de acceso:</Text>
          
          {/* Selector de Rol Personalizado (100% seguro en Android) */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'Estudiante' && styles.roleButtonActive]} 
              onPress={() => setRole('Estudiante')}
              activeOpacity={0.8}
            >
              <Icon source="school" size={24} color={role === 'Estudiante' ? '#fff' : '#64748B'} />
              <Text style={[styles.roleText, role === 'Estudiante' && styles.roleTextActive]}>Estudiante</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleButton, role === 'Docente' && styles.roleButtonActive]} 
              onPress={() => setRole('Docente')}
              activeOpacity={0.8}
            >
              <Icon source="briefcase" size={24} color={role === 'Docente' ? '#fff' : '#64748B'} />
              <Text style={[styles.roleText, role === 'Docente' && styles.roleTextActive]}>Docente</Text>
            </TouchableOpacity>
          </View>

          <Button 
            mode="contained" 
            onPress={handleAuth} 
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            labelStyle={styles.loginButtonText}
            icon="login"
            buttonColor="#2563EB"
          >
            Iniciar Sesión
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', paddingBottom: 30 },
  headerBackground: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  headerSubtitle: { fontSize: 16, color: '#E0E7FF', marginTop: 5 },
  card: { marginHorizontal: 20, marginTop: -50, borderRadius: 20, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 5, backgroundColor: '#FFFFFF' },
  helperText: { fontSize: 11, marginBottom: 10 },
  roleLabel: { marginTop: 10, marginBottom: 12, fontSize: 14, fontWeight: '600', color: '#475569' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  roleButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, marginHorizontal: 5, borderRadius: 12,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0'
  },
  roleButtonActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  roleText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#64748B' },
  roleTextActive: { color: '#FFFFFF' },
  loginButton: { borderRadius: 12, elevation: 2 },
  loginButtonContent: { paddingVertical: 10 },
  loginButtonText: { fontSize: 16, fontWeight: 'bold' }
});