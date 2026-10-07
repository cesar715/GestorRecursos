import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import { TextInput, Button, Card, Text, IconButton } from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// REEMPLAZA ESTA URL CON TU URL REAL DE MOCKAPI
const API_URL = 'https://66xxxxxx.mockapi.io/recursos';

export default function DocenteScreen() {
  const { user, logout } = useContext(AuthContext);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Libro');
  const [enlace, setEnlace] = useState('');
  const [imagen, setImagen] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setRecursos(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los recursos desde la API.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setTipo('Libro');
    setEnlace('');
    setImagen('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!titulo.trim() || !descripcion.trim() || !enlace.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa al menos el título, la descripción y el enlace.');
      return;
    }

    const recursoPayload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo: tipo.trim(),
      enlace: enlace.trim(),
      imagen: imagen.trim() || 'https://via.placeholder.com/150',
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, recursoPayload);
        Alert.alert('Éxito', 'Recurso modificado correctamente.');
      } else {
        await axios.post(API_URL, {
          ...recursoPayload,
          calificacionPromedio: 0,
          votos: 0,
        });
        Alert.alert('Éxito', 'Recurso agregado correctamente.');
      }
      resetForm();
      fetchRecursos();
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el recurso.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitulo(item.titulo || '');
    setDescripcion(item.descripcion || '');
    setTipo(item.tipo || 'Libro');
    setEnlace(item.enlace || '');
    setImagen(item.imagen || '');
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este recurso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleDelete(id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      Alert.alert('Eliminado', 'El recurso fue eliminado correctamente.');
      fetchRecursos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el recurso.');
    }
  };

  const filteredRecursos = recursos.filter((r) =>
    r.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tipo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id?.toString().includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Docente: {user?.username}</Text>
        <Button mode="outlined" compact onPress={logout}>Cerrar Sesión</Button>
      </View>

      {/* Formulario de Registro / Edición */}
      <Card style={styles.formCard}>
        <Card.Title title={editingId ? 'Modificar Recurso' : 'Agregar Nuevo Recurso'} />
        <Card.Content>
          <TextInput label="Título" value={titulo} onChangeText={setTitulo} style={styles.input} mode="outlined" />
          <TextInput label="Descripción" value={descripcion} onChangeText={setDescripcion} multiline style={styles.input} mode="outlined" />
          <TextInput label="Tipo (ej. Libro, Video, Artículo)" value={tipo} onChangeText={setTipo} style={styles.input} mode="outlined" />
          <TextInput label="Enlace URL" value={enlace} onChangeText={setEnlace} style={styles.input} mode="outlined" />
          <TextInput label="Imagen URL" value={imagen} onChangeText={setImagen} style={styles.input} mode="outlined" />

          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
            {editingId && (
              <Button mode="text" onPress={resetForm}>
                Cancelar
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Búsqueda avanzada por ID, Título o Tipo */}
      <TextInput
        label="Buscar por ID, Título o Tipo..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        mode="outlined"
      />

      {/* Lista de Recursos */}
      <FlatList
        data={filteredRecursos}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchRecursos}
        renderItem={({ item }) => (
          <Card style={styles.resourceCard}>
            {item.imagen ? <Card.Cover source={{ uri: item.imagen }} /> : null}
            <Card.Title
              title={item.titulo}
              subtitle={`ID: ${item.id} | Tipo: ${item.tipo}`}
              right={() => (
                <View style={styles.cardActions}>
                  <IconButton icon="pencil" onPress={() => handleEdit(item)} />
                  <IconButton icon="delete" iconColor="red" onPress={() => confirmDelete(item.id)} />
                </View>
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">{item.descripcion}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => Linking.openURL(item.enlace)}>Abrir Enlace</Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  formCard: { marginBottom: 15 },
  input: { marginBottom: 8 },
  searchInput: { marginBottom: 10 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  saveBtn: { marginRight: 10 },
  resourceCard: { marginBottom: 10 },
  cardActions: { flexDirection: 'row' },
});