import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DocenteScreen from './src/screens/DocenteScreen';
import EstudianteScreen from './src/screens/EstudianteScreen';

const Stack = createStackNavigator();

function MainNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Iniciar Sesión - ACAAI' }} 
          />
        ) : user.role === 'Docente' ? (
          <Stack.Screen 
            name="Docente" 
            component={DocenteScreen} 
            options={{ title: 'Panel Docente - Gestión de Recursos' }} 
          />
        ) : (
          <Stack.Screen 
            name="Estudiante" 
            component={EstudianteScreen} 
            options={{ title: 'Catálogo de Recursos - Estudiante' }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}