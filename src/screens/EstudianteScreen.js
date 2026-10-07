import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import { TextInput, Button, Card, Text, IconButton, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// REEMPLAZA ESTA URL CON TU URL REAL DE MOCKAPI
const API_URL = 'https://66xxxxxx.mockapi.io/recursos';

export default function EstudianteScreen() {
  const { user, logout } = useContext(AuthContext);
  const [recursos, setRecursos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [verSoloFavoritos, setVerSoloFavoritos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecursos();
    loadFavoritos();
  }, []);

  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setRecursos(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los recursos.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritos = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem(`favs_${user?.username}`);
      if (storedFavs) {
        setFavoritos(JSON.parse(storedFavs));
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const toggleFavorito = async (recursoId) => {
    try {
      let updatedFavs;
      if (favoritos.includes(recursoId)) {
        updatedFavs = favoritos.filter((id) => id !== recursoId);
      } else {
        updatedFavs = [...favoritos, recursoId];
      }
      setFavoritos(updatedFavs);
      await AsyncStorage.setItem(`favs_${user?.username}`, JSON.stringify(updatedFavs));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la lista de favoritos.');
    }
  };

  const calificarRecurso = async (item, nuevaCalificacion) => {
    try {
      const votosActuales = item.votos || 0;
      const calificacionActual = item.calificacionPromedio || 0;
      
      const nuevosVotos = votosActuales + 1;
      const nuevoPromedio = parseFloat(
        ((calificacionActual * votosActuales + nuevaCalificacion) / nuevosVotos).toFixed(1)
      );

      await axios.put(`${API_URL}/${item.id}`, {
        ...item,
        calificacionPromedio: nuevoPromedio,
        votos: nuevosVotos,
      });

      Alert.alert('¡Gracias!', `Has calificado con ${nuevaCalificacion} estrellas.`);
      fetchRecursos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la calificación.');
    }
  };

  const recursosFiltrados = recursos.filter((item) => {
    const coincideBusqueda =
      item.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tipo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toString().includes(searchQuery);

    if (verSoloFavoritos) {
      return coincideBusqueda && favoritos.includes(item.id);
    }
    return coincideBusqueda;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Estudiante: {user?.username}</Text>
        <Button mode="outlined" compact onPress={logout}>Cerrar Sesión</Button>
      </View>

      <TextInput
        label="Buscar por título, tipo o ID..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        mode="outlined"
      />

      <View style={styles.filterRow}>
        <Chip
          selected={!verSoloFavoritos}
          onPress={() => setVerSoloFavoritos(false)}
          style={styles.chip}
        >
          Todos los Recursos
        </Chip>
        <Chip
          selected={verSoloFavoritos}
          onPress={() => setVerSoloFavoritos(true)}
          style={styles.chip}
          icon="star"
        >
          Mis Favoritos ({favoritos.length})
        </Chip>
      </View>

      <FlatList
        data={recursosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchRecursos}
        renderItem={({ item }) => {
          const esFavorito = favoritos.includes(item.id);
          return (
            <Card style={styles.card}>
              {item.imagen ? <Card.Cover source={{ uri: item.imagen }} /> : null}
              <Card.Title
                title={item.titulo}
                subtitle={`Tipo: ${item.tipo} | Rating: ⭐ ${item.calificacionPromedio || 0} (${item.votos || 0} votos)`}
                right={() => (
                  <IconButton
                    icon={esFavorito ? 'star' : 'star-outline'}
                    iconColor={esFavorito ? '#FFD700' : '#888'}
                    onPress={() => toggleFavorito(item.id)}
                  />
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium">{item.descripcion}</Text>
                
                <Text style={styles.ratingText}>Califica este recurso:</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={star}
                      icon="star"
                      size={20}
                      iconColor="#FFD700"
                      onPress={() => calificarRecurso(item, star)}
                    />
                  ))}
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => Linking.openURL(item.enlace)}>
                  Ver Recurso Completo
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  searchInput: { marginBottom: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 12 },
  chip: { marginRight: 8 },
  card: { marginBottom: 12 },
  ratingText: { marginTop: 10, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
});