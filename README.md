# 📚 Sistema de Gestión de Recursos Académicos (ACAAI)

Bienvenido a **ACAAI**, una plataforma web y móvil para la gestión y consulta de recursos educativos institucionales. Este proyecto fue desarrollado con **React Native (Expo)**, **Axios** y **MockAPI**, permitiendo a docentes publicar y administrar materiales didácticos (documentos PDF, guías, enlaces web, videos), y a los estudiantes explorar, filtrar, evaluar y guardar sus propios apuntes de estudio.

---

## 💻 Programas y Requisitos del Sistema

Para clonar, ejecutar o modificar este proyecto en tu computadora, necesitas tener instaladas las siguientes herramientas:

1. **Node.js** (Versión 18.0 o superior recomendada): 
   - Descárgalo desde [nodejs.org](https://nodejs.org/). Incluye el gestor de paquetes `npm`.
2. **Git**: 
   - Necesario para clonar el repositorio. Descárgalo desde [git-scm.com](https://git-scm.com/).
3. **Visual Studio Code** (o tu editor de código preferido):
   - Descárgalo desde [code.visualstudio.com](https://code.visualstudio.com/).
4. **Navegador Web Moderno** (Google Chrome, Brave, Microsoft Edge):
   - Para ejecutar la versión Web de la aplicación.
5. **Aplicación Movil Expo Go** *(Opcional para pruebas físicas)*:
   - Disponible de forma gratuita en la Play Store (Android) o App Store (iOS) para probar la app directamente en un teléfono escaneando el código QR.

---

## 🔌 Configuración de la API (MockAPI)

El sistema utiliza **MockAPI** como servicio backend RESTful persistente para almacenar y consultar los recursos en tiempo real.

### ¿Cómo funciona en el proyecto?
- La aplicación incluye por defecto la URL pública del endpoint:
  ```javascript
  const API_URL = '[https://6ac6bc47bea0e72cf5c9393d.mockapi.io/api/v1/recursos](https://6ac6bc47bea0e72cf5c9393d.mockapi.io/api/v1/recursos)';

Al iniciar la app, los datos se leen automáticamente desde la nube de MockAPI. Cualquier recurso publicado o eliminado se sincroniza al instante con la base de datos remota.

Configurar tu propia API independiente (Opcional):
Si deseas conectar la aplicación a tu propia base de datos de pruebas:

Regístrate gratis en mockapi.io.

Crea un nuevo proyecto y genera un recurso llamado recursos.

Asegúrate de definir el esquema del recurso con las siguientes claves:

id (String / Auto-increment)

titulo (String)

descripcion (String)

tipo (String)

enlace (String)

nombreArchivo (String)

docente (String)

Copia tu URL generada por MockAPI y reemplázala en la variable API_URL dentro de src/screens/DocenteScreen.js y src/screens/EstudianteScreen.js.

⚙️ Pasos de Instalación y Ejecución
Sigue estas instrucciones en tu terminal para correr el proyecto desde cero:

1. Clonar el repositorio
   git clone [https://github.com/cesar715/GestorRecursos.git](https://github.com/cesar715/GestorRecursos.git)
cd GestorRecursos
2. Instalar todas las dependencias
   npm install
3. Iniciar el servidor de desarrollo con limpieza de caché
   npx expo start -c
4. Abrir la aplicación:
Para ejecutar en el Navegador Web: Presiona la tecla w en la terminal o abre directamente http://localhost:8081.

Para ejecutar en Móvil: Abre la aplicación Expo Go en tu celular y escanea el código QR proyectado en la terminal.

🚀 Funcionalidades Principales por Rol
🔐 Autenticación
Selección de perfil entre Estudiante y Docente.

Validación de contraseña segura (longitud mínima, mayúsculas, números y caracteres especiales).

👨‍🏫 Portal Docente
Publicación de Recursos: Selección interactiva entre subida de documentos locales o enlaces web externos.

Edición y Mantenimiento: Modificación de registros existentes con actualización instantánea en MockAPI.

Confirmación de Seguridad: Diálogos de alerta ("¿Estás seguro de eliminar este recurso?") con mensaje de confirmación exitoso.

Confirmación al Salir: Solicitud de verificación antes de cerrar sesión y regresar al inicio.

👨‍🎓 Portal Estudiante
Búsqueda en Tiempo Real: Filtro interactivo por título o materia.

Filtro Rápido: Alternancia instantánea entre todos los recursos y "Mis Favoritos" (❤️).

Calificación con Estrellas: Sistema interactivo de puntuación de 1 a 5 estrellas por recurso.

Apuntes Personales: Cuadro de notas privadas para guardar recordatorios o comentarios individuales por material.

Visor In-App Flotante: Modal de vista previa integrada estilo chat para explorar el contenido sin abandonar la plataforma.
