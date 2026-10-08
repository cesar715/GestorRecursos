import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Platform, Linking, Alert, TouchableOpacity, Text, TextInput, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'https://6ac6bc47bea0e72cf5c9393d.mockapi.io/api/v1/recursos';

export default function EstudianteScreen() {
  const { logout, user } = useContext(AuthContext);
  const [recursos, setRecursos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritos, setFavoritos] = useState({});
  const [calificaciones, setCalificaciones] = useState({});
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
  const [notas, setNotas] = useState({});
  const [notaTemp, setNotaTemp] = useState('');

  const mostrarMensaje = (tituloMsg, mensaje) => {
    if (Platform.OS === 'web') window.alert(`${tituloMsg}\n\n${mensaje}`);
    else Alert.alert(tituloMsg, mensaje);
  };

  const confirmarSalida = () => {
    if (Platform.OS === 'web') {
      const resp = window.confirm("Cerrar Sesión\n\n¿Estás seguro de que deseas salir de la biblioteca?");
      if (resp) logout();
    } else {
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que deseas salir de la biblioteca?",
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

  const abrirVisualizador = (item) => {
    setRecursoSeleccionado(item);
    setNotaTemp(notas[item.id] || '');
    setModalVisible(true);
  };

  const guardarNota = (id) => {
    setNotas(prev => ({ ...prev, [id]: notaTemp }));
    mostrarMensaje("Nota Guardada", "Tus apuntes personales han sido guardados con éxito.");
  };

  const toggleFavorito = (id) => {
    setFavoritos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calificar = (id, estrellas) => {
    setCalificaciones(prev => ({ ...prev, [id]: estrellas }));
  };

  const recursosFiltrados = recursos.filter(r => {
    const cumpleBusqueda = r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.tipo.toLowerCase().includes(searchQuery.toLowerCase());
    const cumpleFavorito = soloFavoritos ? favoritos[r.id] : true;
    return cumpleBusqueda && cumpleFavorito;
  });

  const renderEstrellas = (id) => {
    const rating = calificaciones[id] || 0;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => calificar(id, star)} style={styles.starTouch}>
            <MaterialCommunityIcons 
              name={star <= rating ? "star" : "star-outline"} 
              color={star <= rating ? "#F59E0B" : "#CBD5E1"} 
              size={22} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Biblioteca ACAAI</Text>
          <Text style={styles.headerSubtitle}>Estudiante: {user?.username}</Text>
        </View>
        <TouchableOpacity onPress={confirmarSalida} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={24} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título o materia..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterChip, !soloFavoritos && styles.filterChipActive]}
            onPress={() => setSoloFavoritos(false)}
          >
            <Text style={[styles.filterChipText, !soloFavoritos && styles.filterChipTextActive]}>📚 Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, soloFavoritos && styles.filterChipActive]}
            onPress={() => setSoloFavoritos(true)}
          >
            <MaterialCommunityIcons name="heart" size={16} color={soloFavoritos ? "#FFF" : "#EF4444"} style={{ marginRight: 4 }} />
            <Text style={[styles.filterChipText, soloFavoritos && styles.filterChipTextActive]}>Mis Favoritos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        {recursosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-page-variant" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No se encontraron recursos disponibles.</Text>
          </View>
        ) : (
          recursosFiltrados.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.tipo}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorito(item.id)} style={styles.heartBtn}>
                  <MaterialCommunityIcons 
                    name={favoritos[item.id] ? "heart" : "heart-outline"} 
                    color={favoritos[item.id] ? "#EF4444" : "#94A3B8"} 
                    size={26} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>{item.descripcion}</Text>
              {item.nombreArchivo && <Text style={styles.filePreviewBadge}>📎 Archivo: {item.nombreArchivo}</Text>}
              {notas[item.id] && <Text style={styles.notePreview}>📝 Nota: {notas[item.id]}</Text>}
              
              <View style={styles.cardFooter}>
                <View>{renderEstrellas(item.id)}</View>
                <TouchableOpacity style={styles.openButton} onPress={() => abrirVisualizador(item)}>
                  <Text style={styles.openButtonText}>Ver Recurso</Text>
                  <MaterialCommunityIcons name="eye-outline" color="#fff" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {recursoSeleccionado?.titulo}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalTypeLabel}>Tipo: {recursoSeleccionado?.tipo}</Text>
              <Text style={styles.modalDescText}>{recursoSeleccionado?.descripcion}</Text>

              {recursoSeleccionado?.nombreArchivo ? (
                <View style={styles.fileInfoBox}>
                  <MaterialCommunityIcons name="file-pdf-box" size={32} color="#EF4444" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{recursoSeleccionado.nombreArchivo}</Text>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Documento oficial cargado por el docente.</Text>
                  </View>
                </View>
              ) : null}

              {Platform.OS === 'web' && recursoSeleccionado?.enlace && !recursoSeleccionado?.enlace.startsWith('blob:') ? (
                <View style={styles.iframeContainer}>
                  <iframe 
                    src={recursoSeleccionado.enlace} 
                    style={{ width: '100%', height: '280px', border: 'none', borderRadius: '12px' }}
                    title="Vista Previa"
                  />
                </View>
              ) : (
                <View style={styles.linkPreviewCard}>
                  <MaterialCommunityIcons name="folder-open" size={32} color="#2563EB" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1E3A8A' }}>Recurso Local o Enlace Externo</Text>
                    <Text style={styles.linkTextUrl} numberOfLines={1}>{recursoSeleccionado?.enlace || 'Sin enlace'}</Text>
                  </View>
                </View>
              )}

              <View style={styles.noteSection}>
                <Text style={styles.noteTitle}>📝 Mis Apuntes Personales</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Escribe una nota rápida sobre este recurso..."
                  placeholderTextColor="#94A3B8"
                  value={notaTemp}
                  onChangeText={setNotaTemp}
                  multiline
                />
                <TouchableOpacity style={styles.saveNoteBtn} onPress={() => guardarNota(recursoSeleccionado?.id)}>
                  <Text style={styles.saveNoteText}>Guardar Apunte</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.modalActionBtn} 
                onPress={() => {
                  if (recursoSeleccionado?.enlace) {
                    Linking.openURL(recursoSeleccionado.enlace).catch(() => mostrarMensaje("Aviso", "No se pudo abrir el enlace externamente."));
                  }
                }}
              >
                <MaterialCommunityIcons name="open-in-new" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.modalActionBtnText}>Abrir Archivo / Enlace Externo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' ? { height: '100vh', overflowY: 'auto' } : {}),
  },
  header: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 45, paddingBottom: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#E0E7FF' },
  logoutBtn: { padding: 5 },
  searchContainer: { backgroundColor: '#2563EB', paddingHorizontal: 15, paddingBottom: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, height: 48, marginBottom: 12 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  filterRow: { flexDirection: 'row', gap: 10 },
  filterChip: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, borderRadius: 10 },
  filterChipActive: { backgroundColor: '#FFFFFF' },
  filterChipText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  filterChipTextActive: { color: '#2563EB' },
  scrollContainer: { padding: 15, paddingBottom: 180 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { color: '#64748B', marginTop: 10, fontSize: 15 },
  card: { marginBottom: 18, borderRadius: 20, backgroundColor: '#FFFFFF', padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#1D4ED8', fontWeight: 'bold', fontSize: 12 },
  heartBtn: { padding: 2 },
  cardTitle: { fontSize: 19, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 10 },
  filePreviewBadge: { fontSize: 12, color: '#10B981', fontWeight: '600', marginBottom: 6 },
  notePreview: { fontSize: 12, color: '#D97706', fontWeight: '600', marginBottom: 10, backgroundColor: '#FEF3C7', padding: 6, borderRadius: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  starsContainer: { flexDirection: 'row' },
  starTouch: { padding: 2 },
  openButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  openButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginRight: 5, fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 600, maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 10 },
  modalCloseBtn: { padding: 5 },
  modalBody: { padding: 20 },
  modalTypeLabel: { fontSize: 12, fontWeight: 'bold', color: '#2563EB', textTransform: 'uppercase', marginBottom: 8 },
  modalDescText: { fontSize: 14, color: '#475569', marginBottom: 15, lineHeight: 20 },
  fileInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', padding: 12, borderRadius: 12, marginBottom: 15 },
  iframeContainer: { marginBottom: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  linkPreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 15, borderRadius: 12, marginBottom: 15, gap: 12 },
  linkTextUrl: { flex: 1, fontSize: 13, color: '#1E3A8A', textDecorationLine: 'underline' },
  
  noteSection: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 12, marginBottom: 15 },
  noteTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  noteInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, height: 65, textAlignVertical: 'top', fontSize: 13, marginBottom: 8 },
  saveNoteBtn: { backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  saveNoteText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  modalActionBtn: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 20 },
  modalActionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});