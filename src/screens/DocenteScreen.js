import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Platform, Alert, TouchableOpacity, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'https://6ac6bc47bea0e72cf5c9393d.mockapi.io/api/v1/recursos';

export default function DocenteScreen() {
  const { logout, user } = useContext(AuthContext);
  const [recursos, setRecursos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('documento');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [enlaceUrl, setEnlaceUrl] = useState('');
  const [editId, setEditId] = useState(null);

  const mostrarMensaje = (tituloMsg, mensaje) => {
    if (Platform.OS === 'web') window.alert(`${tituloMsg}\n\n${mensaje}`);
    else Alert.alert(tituloMsg, mensaje);
  };

  const confirmarSalida = () => {
    if (Platform.OS === 'web') {
      const resp = window.confirm("Cerrar Sesión\n\n¿Estás seguro de que deseas salir del portal?");
      if (resp) logout();
    } else {
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que deseas salir del portal?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sí, salir", onPress: logout, style: "destructive" }
        ]
      );
    }
  };

  const fetchRecursos = async () => {
    try {
      const response = await axios.get(API_URL);
      setRecursos(response.data);
    } catch (error) {
      mostrarMensaje("Error", "No se pudieron cargar los recursos de la API.");
    }
  };

  useEffect(() => { fetchRecursos(); }, []);

  const seleccionarArchivo = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setArchivoSeleccionado(result.assets[0]);
      }
    } catch (error) {
      mostrarMensaje("Error", "No se pudo seleccionar el archivo.");
    }
  };

  const handleGuardar = async () => {
    if (!titulo || !descripcion) {
      mostrarMensaje("Campos vacíos", "El título y la descripción son obligatorios.");
      return;
    }

    let recursoData = {
      titulo,
      descripcion,
      tipo: tipoRecurso === 'documento' ? 'Documento PDF' : 'Enlace Web',
      enlace: tipoRecurso === 'documento' ? (archivoSeleccionado?.uri || 'archivo_local.pdf') : enlaceUrl,
      nombreArchivo: archivoSeleccionado?.name || null,
      docente: user?.username || 'Docente UDB'
    };

    if (tipoRecurso === 'documento' && !archivoSeleccionado && !editId) {
      mostrarMensaje("Archivo requerido", "Por favor selecciona un documento.");
      return;
    }
    if (tipoRecurso === 'enlace' && !enlaceUrl.trim()) {
      mostrarMensaje("Enlace requerido", "Por favor ingresa una URL válida.");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, recursoData);
        mostrarMensaje("Actualizado", "El recurso ha sido modificado.");
      } else {
        await axios.post(API_URL, recursoData);
        mostrarMensaje("Creado", "Nuevo recurso publicado con éxito.");
      }
      resetForm();
      fetchRecursos();
    } catch (error) {
      mostrarMensaje("Error", "Hubo un problema al conectar con la API.");
    }
  };

  const handleEditar = (item) => {
    setTitulo(item.titulo);
    setDescripcion(item.descripcion);
    if (item.tipo === 'Documento PDF') {
      setTipoRecurso('documento');
      setArchivoSeleccionado({ name: item.nombreArchivo || 'Archivo adjunto', uri: item.enlace });
      setEnlaceUrl('');
    } else {
      setTipoRecurso('enlace');
      setEnlaceUrl(item.enlace);
      setArchivoSeleccionado(null);
    }
    setEditId(item.id);
  };

  const confirmarEliminar = (id) => {
    if (Platform.OS === 'web') {
      const seguro = window.confirm("Confirmar Eliminación\n\n¿Estás seguro de eliminar este recurso?");
      if (seguro) ejecutarEliminacion(id);
    } else {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de eliminar este recurso?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sí, eliminar", onPress: () => ejecutarEliminacion(id), style: "destructive" }
        ]
      );
    }
  };

  const ejecutarEliminacion = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      mostrarMensaje("Eliminado", "Eliminado exitosamente.");
      fetchRecursos();
    } catch (error) {
      mostrarMensaje("Error", "No se pudo eliminar el recurso.");
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setArchivoSeleccionado(null);
    setEnlaceUrl('');
    setTipoRecurso('documento');
    setEditId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Portal Docente - ACAAI</Text>
          <Text style={styles.headerSubtitle}>Profesor: {user?.username}</Text>
        </View>
        <TouchableOpacity onPress={confirmarSalida} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{editId ? "✏️ Editar Recurso Académico" : "➕ Publicar Nuevo Recurso"}</Text>
          </View>
          <View style={styles.formBody}>
            <TextInput style={styles.input} placeholder="Título del recurso (Ej: Guía de Redes CCNA)" placeholderTextColor="#94A3B8" value={titulo} onChangeText={setTitulo} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción detallada de la actividad o material..." placeholderTextColor="#94A3B8" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />

            <View style={styles.tipoContainer}>
              <TouchableOpacity 
                style={[styles.tipoBtn, tipoRecurso === 'documento' && styles.tipoBtnActive]}
                onPress={() => setTipoRecurso('documento')}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={20} color={tipoRecurso === 'documento' ? '#FFF' : '#2563EB'} />
                <Text style={[styles.tipoBtnText, tipoRecurso === 'documento' && styles.tipoBtnTextActive]}>Documento PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tipoBtn, tipoRecurso === 'enlace' && styles.tipoBtnActive]}
                onPress={() => setTipoRecurso('enlace')}
              >
                <MaterialCommunityIcons name="link-variant" size={20} color={tipoRecurso === 'enlace' ? '#FFF' : '#2563EB'} />
                <Text style={[styles.tipoBtnText, tipoRecurso === 'enlace' && styles.tipoBtnTextActive]}>Enlace Web</Text>
              </TouchableOpacity>
            </View>

            {tipoRecurso === 'documento' ? (
              <TouchableOpacity style={styles.filePickerBtn} onPress={seleccionarArchivo}>
                <MaterialCommunityIcons name="upload" size={22} color="#10B981" />
                <Text style={styles.filePickerText} numberOfLines={1}>
                  {archivoSeleccionado ? (archivoSeleccionado.name || 'Archivo seleccionado') : '📁 Seleccionar Documento'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TextInput 
                style={styles.input} 
                placeholder="Pega la URL de YouTube o repositorio..." 
                placeholderTextColor="#94A3B8" 
                value={enlaceUrl} 
                onChangeText={setEnlaceUrl} 
              />
            )}
            
            <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
              <MaterialCommunityIcons name={editId ? "update" : "content-save"} size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>{editId ? "Guardar Cambios" : "Publicar en la Plataforma"}</Text>
            </TouchableOpacity>
            
            {editId && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancelar Edición</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Recursos Publicados ({recursos.length})</Text>
        </View>
        
        {recursos.map((item) => (
          <View key={item.id} style={styles.recursoCard}>
            <View style={styles.cardIndicator} />
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.itemTitle}>{item.titulo}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.itemBadge}>{item.tipo}</Text>
                  <Text style={styles.authorBadge}>Prof: {item.docente || 'Docente'}</Text>
                </View>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.descripcion}</Text>
                {item.nombreArchivo && <Text style={styles.fileNameText}>📎 {item.nombreArchivo}</Text>}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditar(item)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmarEliminar(item.id)} style={[styles.iconBtn, { marginTop: 10 }]}>
                  <MaterialCommunityIcons name="delete" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' ? { height: '100vh', overflowY: 'auto' } : {}),
  },
  header: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 45, paddingBottom: 15, paddingHorizontal: 20, elevation: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#E0E7FF' },
  logoutBtn: { padding: 5 },
  scrollContainer: { padding: 15, paddingBottom: 180 },
  formCard: { borderRadius: 16, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, overflow: 'hidden', marginBottom: 20 },
  formHeader: { backgroundColor: '#EFF6FF', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A' },
  formBody: { padding: 15 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 48, marginBottom: 12, fontSize: 14, color: '#0F172A' },
  textArea: { height: 85, textAlignVertical: 'top', paddingTop: 10 },
  tipoContainer: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  tipoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2563EB', backgroundColor: '#EFF6FF', gap: 6 },
  tipoBtnActive: { backgroundColor: '#2563EB' },
  tipoBtnText: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },
  tipoBtnTextActive: { color: '#FFFFFF' },
  filePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#10B981', borderRadius: 10, paddingHorizontal: 12, height: 48, marginBottom: 12, gap: 10 },
  filePickerText: { fontSize: 14, color: '#065F46', fontWeight: '600', flex: 1 },
  saveButton: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 5 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { marginTop: 15, alignItems: 'center' },
  cancelButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  sectionHeaderRow: { marginBottom: 12, marginTop: 5 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  recursoCard: { marginBottom: 12, borderRadius: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardIndicator: { width: 5, backgroundColor: '#2563EB' },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 15 },
  cardTextContainer: { flex: 1, paddingRight: 10 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 6 },
  itemBadge: { backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  authorBadge: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  itemDesc: { fontSize: 13, color: '#64748B' },
  fileNameText: { fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: '600' },
  actionButtons: { justifyContent: 'center', alignItems: 'center' },
  iconBtn: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8 }
});