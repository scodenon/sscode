import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra el proceso anterior o cambia PORT.`)
    process.exit(1)
  }
  console.error('Error al iniciar el servidor')
  console.error(err)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('Señal SIGTERM recibida');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Señal SIGINT recibida');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

export default app;
