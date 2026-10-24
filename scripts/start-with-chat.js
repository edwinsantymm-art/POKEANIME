const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const expoArgs = process.argv.slice(2);
if (!expoArgs.some((arg) => ['--lan', '--localhost', '--tunnel'].includes(arg))) {
  expoArgs.unshift('--lan');
}
const chatPort = Number(process.env.PORT) || 4000;
let shuttingDown = false;
const children = [];

function obtenerIpLocal() {
  const interfaces = os.networkInterfaces();
  const candidatos = Object.entries(interfaces).flatMap(([nombre, direcciones]) =>
    (direcciones || [])
      .filter(
        ({ address, family, internal }) =>
          !internal &&
          family === 'IPv4' &&
          !address.startsWith('169.254.') &&
          !address.startsWith('127.'),
      )
      .map(({ address }) => ({
        address,
        prioridad: /wi-?fi|wireless/i.test(nombre)
          ? 0
          : /virtual|vpn|loopback|hyper-v|wsl|docker|radmin|bluetooth|tailscale|zerotier/i.test(nombre)
            ? 2
            : 1,
      })),
  );
  candidatos.sort((a, b) => a.prioridad - b.prioridad);
  return candidatos[0]?.address;
}

function obtenerUrlChatConfigurada() {
  if (process.env.EXPO_PUBLIC_AI_CHAT_API_URL) {
    return process.env.EXPO_PUBLIC_AI_CHAT_API_URL;
  }

  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return '';

  const variable = fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((line) => /^\s*(?:export\s+)?EXPO_PUBLIC_AI_CHAT_API_URL\s*=/.test(line));
  if (!variable) return '';

  const value = variable.slice(variable.indexOf('=') + 1).trim();
  return value.replace(/^(['"])(.*)\1$/, '$2');
}

function configurarUrlChatParaDispositivo() {
  const url = obtenerUrlChatConfigurada();
  if (url && !/localhost|127\.0\.0\.1|\[::1\]/i.test(url)) {
    process.env.EXPO_PUBLIC_AI_CHAT_API_URL = url;
    return;
  }

  const ip = obtenerIpLocal();
  if (!ip) {
    throw new Error(
      'No se encontró una IP de red local. Conecta esta computadora a la misma red Wi-Fi que el dispositivo.',
    );
  }

  process.env.EXPO_PUBLIC_AI_CHAT_API_URL = `http://${ip}:${chatPort}/api`;
  console.log(
    `El chat usará ${process.env.EXPO_PUBLIC_AI_CHAT_API_URL} para dispositivos en la red local.`,
  );
}

function probarPuerto(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(error);
      }
    });
    server.listen(port, () => {
      server.close((error) => (error ? reject(error) : resolve(true)));
    });
  });
}

async function obtenerPuertoExpo(port = 8081) {
  if (port > 65535) throw new Error('No se encontró un puerto disponible para Expo.');
  return (await probarPuerto(port)) ? port : obtenerPuertoExpo(port + 1);
}

function comprobarBackendChat() {
  return new Promise((resolve, reject) => {
    const request = http.get(
      { host: '127.0.0.1', port: chatPort, path: '/health', timeout: 10000 },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          try {
            const estado = JSON.parse(body);
            resolve(
              response.statusCode === 200 &&
                estado.status === 'ok' &&
                estado.database === 'connected' &&
                estado.geminiConfigured === true,
            );
          } catch (error) {
            reject(new Error(`El puerto ${chatPort} no respondió un estado JSON válido: ${error.message}`));
          }
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(new Error(`Tiempo de espera al comprobar el backend en el puerto ${chatPort}.`));
    });
    request.on('error', reject);
  });
}

function detenerProcesos(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  }
}

async function iniciar() {
  configurarUrlChatParaDispositivo();

  const chatDisponible = await probarPuerto(chatPort);
  const reutilizarBackend = !chatDisponible && (await comprobarBackendChat());
  if (!chatDisponible && !reutilizarBackend) {
    throw new Error(`El puerto ${chatPort} ya está en uso por un servicio que no es el backend de chat.`);
  }

  const port = await obtenerPuertoExpo();
  if (shuttingDown) return;
  console.log(`Expo usará el puerto ${port}.`);
  if (reutilizarBackend) {
    console.log(`Se reutilizará el backend de chat existente en el puerto ${chatPort}.`);
  }

  const processes = [
    {
      name: 'Expo',
      args: [
        path.join(root, 'node_modules', 'expo', 'bin', 'cli'),
        'start',
        ...expoArgs,
        '--port',
        String(port),
      ],
      cwd: root,
    },
    ...(reutilizarBackend ? [] : [{
      name: 'Backend de chat',
      args: [path.join(root, 'backend-ai-chat', 'src', 'server.js')],
      cwd: path.join(root, 'backend-ai-chat'),
    }]),
  ];

  for (const processInfo of processes) {
    const child = spawn(process.execPath, processInfo.args, {
      cwd: processInfo.cwd,
      env: process.env,
      stdio: 'inherit',
    });
    children.push(child);

    child.on('error', (error) => {
      console.error(`No se pudo iniciar ${processInfo.name}: ${error.message}`);
      process.exitCode = 1;
      detenerProcesos();
    });

    child.on('exit', (code, signal) => {
      if (!shuttingDown) {
        console.log(
          `${processInfo.name} terminó${signal ? ` por ${signal}` : ` con código ${code ?? 0}`}.`,
        );
        if (code) process.exitCode = code;
        detenerProcesos();
      }
    });
  }
}

iniciar().catch((error) => {
  console.error(`No se pudo iniciar Expo y el backend de chat: ${error.message}`);
  process.exitCode = 1;
  detenerProcesos();
});

process.on('SIGINT', () => detenerProcesos('SIGINT'));
process.on('SIGTERM', () => detenerProcesos('SIGTERM'));
