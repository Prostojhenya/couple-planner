const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

console.log('\n🚀 Запуск ngrok туннеля...\n');

// Запускаем ngrok
const ngrok = spawn('ngrok', ['http', '3000'], {
  stdio: 'pipe'
});

ngrok.stdout.on('data', (data) => {
  console.log(data.toString());
});

ngrok.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Ждём 3 секунды и получаем URL
setTimeout(() => {
  http.get('http://localhost:4040/api/tunnels', (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const tunnel = json.tunnels.find(t => t.proto === 'https');
        
        if (tunnel) {
          const url = tunnel.public_url;
          console.log('\n✅ ngrok туннель запущен!\n');
          console.log('📱 HTTPS URL:', url);
          console.log('\n📋 Следующие шаги:\n');
          console.log('1. Обновите .env файл:');
          console.log(`   NEXTAUTH_URL="${url}"`);
          console.log('\n2. Перезапустите dev-сервер:');
          console.log('   npm run dev');
          console.log('\n3. На iPhone откройте Safari и перейдите на:');
          console.log(`   ${url}`);
          console.log('\n4. Установите приложение через "На экран «Домой»"');
          console.log('\n5. Разрешите уведомления');
          console.log('\n💡 Нажмите Ctrl+C для остановки туннеля\n');

          // Автоматически обновляем .env
          updateEnvFile(url);
        } else {
          console.error('❌ Не удалось получить HTTPS URL');
          console.log('\n⚠️  Возможно, ngrok требует авторизации.');
          console.log('Выполните: ngrok config add-authtoken YOUR_TOKEN');
          console.log('Получите токен на: https://dashboard.ngrok.com/get-started/your-authtoken\n');
        }
      } catch (error) {
        console.error('❌ Ошибка при получении URL:', error.message);
        console.log('\n⚠️  Возможно, ngrok не запущен или требует авторизации.');
        console.log('Выполните: ngrok config add-authtoken YOUR_TOKEN');
        console.log('Получите токен на: https://dashboard.ngrok.com/get-started/your-authtoken\n');
      }
    });
  }).on('error', (error) => {
    console.error('❌ Не удалось подключиться к ngrok API:', error.message);
    console.log('\n⚠️  Убедитесь, что ngrok запущен.');
    console.log('Если ngrok требует авторизации:');
    console.log('1. Зарегистрируйтесь на https://ngrok.com/');
    console.log('2. Получите authtoken: https://dashboard.ngrok.com/get-started/your-authtoken');
    console.log('3. Выполните: ngrok config add-authtoken YOUR_TOKEN\n');
  });
}, 3000);

function updateEnvFile(url) {
  try {
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Проверяем, есть ли уже NEXTAUTH_URL
    if (envContent.includes('NEXTAUTH_URL=')) {
      // Заменяем существующий
      envContent = envContent.replace(
        /NEXTAUTH_URL=.*/,
        `NEXTAUTH_URL="${url}"`
      );
    } else {
      // Добавляем новый
      envContent += `\nNEXTAUTH_URL="${url}"\n`;
    }
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ Файл .env автоматически обновлён!\n');
  } catch (error) {
    console.log('⚠️  Не удалось автоматически обновить .env');
    console.log('   Обновите вручную:', error.message);
  }
}

process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка ngrok...\n');
  ngrok.kill();
  process.exit();
});
