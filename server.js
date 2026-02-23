import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ejemplo de endpoint
app.get('/', (req, res) => {
	res.send('Backend Urlaty funcionando');
});

// Aquí puedes agregar tus rutas y lógica de conexión

app.listen(PORT, () => {
	console.log(`Servidor corriendo en puerto ${PORT}`);
});
