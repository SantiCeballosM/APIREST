<<<<<<< HEAD
# API REST de turnos - Servicio técnico de computadores

Proyecto académico para el taller evaluativo final de Arquitectura Cliente-Servidor. La API está desarrollada con Node.js y Express y separa las responsabilidades en `routes`, `controllers` y `services`.

## 1. Caso de negocio

El proyecto representa un servicio técnico de computadores que recibe solicitudes para diagnóstico, mantenimiento preventivo, reparación e instalación de software. Cada solicitud o turno registra el nombre del cliente, el servicio requerido, la fecha y hora de atención, el precio base y si necesita atención prioritaria.

El sistema calcula automáticamente el recargo cuando el turno es prioritario. Los datos se guardan en el archivo local `data/turnos.json`, por lo que no se necesita una base de datos externa.

> Antes de entregar, el equipo debe confirmar que este caso de negocio corresponde a un servicio real que pueda contextualizar y sustentar. Si el equipo eligió otro negocio, puede conservar la estructura técnica y adaptar los nombres y ejemplos.

## 2. Integrantes y parámetro N

Integrantes del equipo (ordenados alfabéticamente por apellido):

| Orden alfabético | Apellidos y nombres | Número de lista |
| 1 | Ceballos Marin, Santiago | 4 |
| 2 | Jaramillo Ceballos, Juan Esteban | 8 |
| 3 | Ramírez Cárdenas, Jhon Harold | 15 |


**N = 8**, porque Juan Esteban Jaramillo Ceballos aparece primero al ordenar los integrantes por apellido y ocupa el número 8 en el listado oficial del Grupo 1 del martes (página 5 del taller).

El valor se configura en `config/parametros.js`:


const N = 8;


El porcentaje de recargo se calcula así: `porcentajeRecargo = N * 2`. Por tanto, el porcentaje de recargo es **16 %**. Se aplica únicamente cuando `prioritario` es `true`.

## 3. Regla de negocio y ejemplo

- Si `prioritario` es `true`: `totalPagar = precioBase + (precioBase * porcentajeRecargo / 100)`.
- Si `prioritario` es `false` o no se envía: `totalPagar = precioBase`.

Ejemplo con `N = 8` y precio base de `$100.000`:

- Porcentaje configurado: `8 * 2 % = 16 %`.
- Turno prioritario: recargo `$16.000`; total a pagar `$116.000`.
- Turno no prioritario: recargo `$0`; total a pagar `$100.000`.

El cálculo se encuentra en `services/turnos.service.js`, no en las rutas ni en el controlador.

## 4. Arquitectura del proyecto


api-turnos-servicio-tecnico/
├── config/
│   └── parametros.js
├── controllers/
│   └── turnos.controller.js
├── data/
│   └── turnos.json
├── routes/
│   └── turnos.routes.js
├── services/
│   └── turnos.service.js
├── .gitignore
├── index.js
├── package.json
└── README.md


**Responsabilidad de cada capa:**

- `index.js`: inicializa Express, configura `express.json()`, conecta las rutas y levanta el servidor.
- `routes/`: declara los endpoints y los relaciona con sus controladores.
- `controllers/`: recibe `req`, valida los datos, llama a los servicios y responde con los códigos HTTP.
- `services/`: contiene la regla de negocio, realiza los cálculos y lee/escribe los turnos en el archivo JSON.
- `config/`: centraliza el parámetro `N` para poder modificarlo sin cambiar la fórmula.
- `data/`: almacena los registros durante y entre ejecuciones locales.

## 5. Instalación y ejecución

Requisitos: Node.js 18 o superior y npm.

1. Descomprimir el proyecto y abrir una terminal dentro de la carpeta.
2. Instalar las dependencias:


   npm install
   

3. Iniciar el servidor:


   npm start


4. El servidor estará disponible en `http://localhost:3000`.

Para desarrollo, también se puede ejecutar `npm run dev`.

## 6. Endpoints requeridos

| Método | Endpoint | Descripción | Respuesta esperada |
|---|---|---|---|
| GET | `/api/turnos` | Lista todos los turnos | 200 OK |
| GET | `/api/turnos/:id` | Consulta un turno por identificador | 200 OK o 404 Not Found |
| POST | `/api/turnos` | Registra un turno nuevo y calcula su tarifa | 201 Created o 400 Bad Request |

### Ejemplo exitoso: POST `/api/turnos`

Encabezado: `Content-Type: application/json`

Cuerpo de la solicitud:


{
  "cliente": "Laura Gómez",
  "tipoServicio": "Mantenimiento preventivo",
  "fechaHora": "2026-11-25T09:30:00",
  "precioBase": 100000,
  "prioritario": true
}

Con `N = 8`, la respuesta será HTTP **201 Created**, con una estructura similar a esta (el identificador y la fecha de creación se generan automáticamente):


{
  "mensaje": "Turno registrado correctamente.",
  "turno": {
    "id": "identificador-generado",
    "cliente": "Laura Gómez",
    "tipoServicio": "Mantenimiento preventivo",
    "fechaHora": "2026-11-25T09:30:00",
    "precioBase": 100000,
    "prioritario": true,
    "porcentajeRecargoConfigurado": 16,
    "porcentajeRecargoAplicado": 16,
    "valorRecargo": 16000,
    "totalPagar": 116000,
    "creadoEn": "fecha-generada-por-el-servidor"
  }
}


### Ejemplo de error: POST `/api/turnos`

Cuerpo de la solicitud (precio no válido y falta el tipo de servicio):


{
  "cliente": "Laura Gómez",
  "fechaHora": "2026-11-25T09:30:00",
  "precioBase": 0,
  "prioritario": true
}


La respuesta será HTTP **400 Bad Request**, por ejemplo:

json
{
  "error": "Solicitud inválida",
  "detalles": [
    "El campo \"tipoServicio\" es obligatorio y debe ser texto.",
    "El campo \"precioBase\" es obligatorio y debe ser un número mayor que cero."
  ]
}


## 7. Pruebas rápidas con Postman

1. Iniciar el servidor con `npm start`.
2. Crear un turno con `POST http://localhost:3000/api/turnos`, seleccionar `Body > raw > JSON` y usar el ejemplo exitoso.
3. Comprobar que la respuesta sea `201 Created` y copiar el `id` generado.
4. Consultar todos los registros con `GET http://localhost:3000/api/turnos` (debe responder `200 OK`).
5. Consultar el turno por su ID con `GET http://localhost:3000/api/turnos/ID_COPIADO` (debe responder `200 OK`).
6. Consultar un ID inexistente, por ejemplo `GET http://localhost:3000/api/turnos/no-existe` (debe responder `404 Not Found`).
7. Enviar el ejemplo inválido con POST (debe responder `400 Bad Request`).

## 8. Códigos HTTP demostrados

- **200 OK:** consulta exitosa de la lista o de un turno existente.
- **201 Created:** creación exitosa de un turno.
- **400 Bad Request:** faltan campos, los tipos son incorrectos o el precio base es menor o igual a cero.
- **404 Not Found:** el ID solicitado no corresponde a ningún turno.

## 9. Guion breve para la sustentación

El recorrido de una petición POST es el siguiente:

1. El cliente envía los datos JSON a `/api/turnos`.
2. La ruta identifica el endpoint y dirige la solicitud al controlador.
3. El controlador valida los campos y tipos. Si encuentra errores, responde 400.
4. Si los datos son válidos, el controlador llama al servicio.
5. El servicio obtiene N, calcula el recargo si el turno es prioritario, genera el identificador y guarda el registro en `data/turnos.json`.
6. El controlador devuelve el turno creado con HTTP 201.

La separación por capas permite mantener el código organizado: las rutas reciben el endpoint, los controladores manejan HTTP y los servicios concentran las reglas de negocio y el almacenamiento.

## 10. Publicación en GitHub

Desde la carpeta del proyecto:

git init
git add .
git commit -m "Entrega API REST de turnos por capas"
git branch -M main
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main


El archivo `.gitignore` excluye `node_modules`, por lo que se debe entregar `package.json` y no la carpeta de dependencias.

---

**Pendiente antes de entregar:** confirmar los integrantes, corregir el N provisional en `config/parametros.js` y en este README, y verificar que el caso de negocio elegido corresponda a un servicio real que el equipo pueda explicar.
=======
# APIREST
Proyecto de arquitectura ApiRest
>>>>>>> 896c70357347463778a681e2f18b0ae510db96d2
