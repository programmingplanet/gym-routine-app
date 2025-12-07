# Endpoints Requeridos en el Backend (FastAPI)

Este documento lista todos los endpoints que necesitas crear o modificar en tu backend de FastAPI para soportar las nuevas funcionalidades.

## 📋 Resumen de Cambios

1. **Muscle Groups** - Gestión de grupos musculares
2. **Exercise Updates** - Actualizar modelo de ejercicios para soportar múltiples grupos musculares
3. **Share Exercises** - Hacer ejercicios públicos/compartidos

---

## 1. Muscle Groups API

### GET /muscle-groups/
**Descripción:** Obtener todos los grupos musculares disponibles

**Response 200:**
```json
[
  {
    "id": "pecho",
    "name": "Pecho",
    "description": "Músculos pectorales"
  },
  {
    "id": "espalda",
    "name": "Espalda",
    "description": "Músculos dorsales"
  }
]
```

**Modelo Pydantic:**
```python
class MuscleGroup(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
```

---

### POST /muscle-groups/
**Descripción:** Crear un nuevo grupo muscular (Admin)

**Request Body:**
```json
{
  "id": "antebrazos",
  "name": "Antebrazos",
  "description": "Músculos del antebrazo"
}
```

**Response 201:**
```json
{
  "id": "antebrazos",
  "name": "Antebrazos",
  "description": "Músculos del antebrazo"
}
```

---

## 2. Exercise Model Updates

### 🔴 IMPORTANTE: Actualizar el modelo Exercise

**Cambios necesarios:**

1. **Cambiar `muscleGroup` (string) → `muscleGroups` (array)**
2. **Modificar `isShared` para indicar si es público**
3. **Eliminar `sharedWith` array** (ya no es necesario compartir con usuarios específicos)

**Modelo actualizado:**
```python
class Exercise(BaseModel):
    id: str
    name: str
    imageUrl: str
    muscleGroups: List[str]  # CAMBIO: era muscleGroup: str
    description: Optional[str] = None
    createdBy: Optional[str] = None  # None = ejercicio global del sistema
    isShared: Optional[bool] = False  # True = público para todos
    equipment: Optional[List[str]] = None
    createdAt: Optional[str] = None
```

**Lógica de compartir:**
- `isShared = True` → El ejercicio aparece en la lista general de ejercicios para TODOS los usuarios
- `isShared = False` → El ejercicio solo es visible para el creador (`createdBy`)
- `createdBy = None` → Ejercicios predefinidos del sistema (siempre visibles)

---

## 3. Updated Exercise Endpoints

### GET /exercises/
**Descripción:** Obtener todos los ejercicios (incluyendo públicos y del sistema)

**Query Parameters:**
- `muscleGroup` (opcional): Filtrar por grupo muscular

**Ejemplo:** `GET /exercises/?muscleGroup=pecho`

**Lógica:**
```python
# Devolver:
# 1. Ejercicios del sistema (createdBy = None)
# 2. Ejercicios públicos (isShared = True)
# Si hay filtro muscleGroup, filtrar por ese grupo
```

---

### GET /exercises/user/{user_id}
**Descripción:** Obtener ejercicios del usuario

**Lógica:**
```python
# Devolver:
# 1. Ejercicios creados por el usuario (createdBy = user_id)
# 2. NO incluir ejercicios del sistema ni públicos
#    (esos se obtienen con GET /exercises/)
```

---

### GET /exercises/shared/{user_id}
**Descripción:** Obtener ejercicios públicos/compartidos

**Lógica:**
```python
# Devolver:
# 1. Todos los ejercicios con isShared = True
# 2. Ejercicios del sistema (createdBy = None)
# 3. NO incluir ejercicios del propio usuario
```

---

### POST /exercises/
**Descripción:** Crear un nuevo ejercicio

**Request Body:**
```json
{
  "name": "Press de Banca",
  "imageUrl": "https://example.com/image.jpg",
  "muscleGroups": ["pecho", "triceps", "hombros"],
  "description": "Ejercicio compuesto para pecho",
  "equipment": ["Barra", "Banco"],
  "createdBy": "user123",
  "isShared": true
}
```

---

### PUT /exercises/{exercise_id}
**Descripción:** Actualizar un ejercicio

**Request Body:** (mismo que POST)

**Validaciones:**
- Solo el creador puede actualizar su ejercicio
- Admins pueden actualizar cualquier ejercicio

---

### DELETE /exercises/{exercise_id}
**Descripción:** Eliminar un ejercicio

**Validaciones:**
- Solo el creador puede eliminar su ejercicio
- Admins pueden eliminar cualquier ejercicio
- No se pueden eliminar ejercicios del sistema (createdBy = None)

---

## 4. Endpoints Opcionales (Recomendados)

### GET /muscle-groups/{muscle_group_id}
**Descripción:** Obtener un grupo muscular específico

---

### PUT /muscle-groups/{muscle_group_id}
**Descripción:** Actualizar un grupo muscular (Admin)

---

### DELETE /muscle-groups/{muscle_group_id}
**Descripción:** Eliminar un grupo muscular (Admin)

**Validación:** No permitir eliminar si hay ejercicios que lo usan

---

## 5. Migración de Datos

Si ya tienes ejercicios en la base de datos con el campo `muscleGroup` (string), necesitas migrarlos:

**Script de migración:**
```python
# Convertir muscleGroup (string) → muscleGroups (array)
for exercise in exercises:
    if hasattr(exercise, 'muscleGroup'):
        exercise.muscleGroups = [exercise.muscleGroup]
        delattr(exercise, 'muscleGroup')

    # Limpiar sharedWith
    if hasattr(exercise, 'sharedWith'):
        delattr(exercise, 'sharedWith')
```

---

## 6. Datos Iniciales Recomendados

### Muscle Groups por defecto:
```python
DEFAULT_MUSCLE_GROUPS = [
    {"id": "pecho", "name": "Pecho", "description": "Músculos pectorales"},
    {"id": "espalda", "name": "Espalda", "description": "Músculos dorsales y trapecio"},
    {"id": "hombros", "name": "Hombros", "description": "Deltoides"},
    {"id": "biceps", "name": "Bíceps", "description": "Bíceps braquial"},
    {"id": "triceps", "name": "Tríceps", "description": "Tríceps braquial"},
    {"id": "piernas", "name": "Piernas", "description": "Cuádriceps y femorales"},
    {"id": "gluteos", "name": "Glúteos", "description": "Glúteo mayor y medio"},
    {"id": "core", "name": "Core", "description": "Músculos del core"},
    {"id": "abdomen", "name": "Abdomen", "description": "Músculos abdominales"},
    {"id": "cardio", "name": "Cardio", "description": "Ejercicios cardiovasculares"},
]
```

---

## 📝 Checklist de Implementación

### Backend (FastAPI)
- [ ] Crear modelo `MuscleGroup`
- [ ] Actualizar modelo `Exercise`:
  - [ ] Cambiar `muscleGroup` (str) → `muscleGroups` (List[str])
  - [ ] Modificar lógica de `isShared`
  - [ ] Eliminar campo `sharedWith`
- [ ] Implementar endpoint `GET /muscle-groups/`
- [ ] Implementar endpoint `POST /muscle-groups/`
- [ ] Actualizar `GET /exercises/` para soportar filtro por `muscleGroup`
- [ ] Actualizar `GET /exercises/user/{user_id}` con nueva lógica
- [ ] Actualizar `GET /exercises/shared/{user_id}` con nueva lógica
- [ ] Actualizar `POST /exercises/` para aceptar `muscleGroups` array
- [ ] Actualizar `PUT /exercises/{exercise_id}` para aceptar `muscleGroups` array
- [ ] Migrar datos existentes si es necesario
- [ ] Insertar muscle groups por defecto en la BD

### Base de Datos
- [ ] Crear tabla/colección `muscle_groups`
- [ ] Modificar tabla/colección `exercises`:
  - [ ] Agregar campo `muscleGroups` (array)
  - [ ] Eliminar campo `muscleGroup`
  - [ ] Eliminar campo `sharedWith`
- [ ] Ejecutar script de migración

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Usuario crea ejercicio privado
```json
POST /exercises/
{
  "name": "Mi ejercicio personalizado",
  "muscleGroups": ["pecho", "triceps"],
  "createdBy": "user123",
  "isShared": false  ← Solo visible para user123
}
```

### Ejemplo 2: Usuario crea ejercicio público
```json
POST /exercises/
{
  "name": "Variación de press banca",
  "muscleGroups": ["pecho", "triceps", "hombros"],
  "createdBy": "user123",
  "isShared": true  ← Visible para TODOS los usuarios
}
```

### Ejemplo 3: Admin crea ejercicio del sistema
```json
POST /exercises/
{
  "name": "Press de Banca Estándar",
  "muscleGroups": ["pecho", "triceps"],
  "createdBy": null,  ← Ejercicio del sistema
  "isShared": true
}
```

### Ejemplo 4: Filtrar ejercicios de pecho
```
GET /exercises/?muscleGroup=pecho

Devuelve todos los ejercicios que incluyan "pecho" en muscleGroups
```

---

## ⚠️ Consideraciones Importantes

1. **Validación de muscleGroups**: Verificar que los IDs de grupos musculares existan en la tabla `muscle_groups`

2. **Permisos**:
   - Usuarios normales: pueden crear ejercicios (privados o públicos)
   - Solo el creador puede editar/eliminar sus ejercicios
   - Admins pueden gestionar muscle groups y todos los ejercicios

3. **Performance**:
   - Indexar el campo `muscleGroups` para búsquedas eficientes
   - Considerar cachear la lista de muscle groups (cambian poco)

4. **Retrocompatibilidad**:
   - Si hay apps/clientes antiguos que esperan `muscleGroup`, considerar mantenerlo temporalmente o hacer un período de transición
