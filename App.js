import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DocenteScreen from './src/screens/DocenteScreen';
import EstudianteScreen from './src/screens/EstudianteScreen';

function MainNavigator() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <LoginScreen />;
  }

  return user.role === 'Docente' ? <DocenteScreen /> : <EstudianteScreen />;
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <View style={styles.root}>
          <MainNavigator />
        </View>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    // Esto habilita el scroll con la rueda del mouse en navegadores web de forma nativa
    ...(typeof document !== 'undefined' ? {
      height: '100vh',
      overflowY: 'auto',
    } : {}),
  },
});