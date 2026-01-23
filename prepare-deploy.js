const fs = require('fs');
const { execSync } = require('child_process');

console.log('\n🚀 Подготовка к deploy на Vercel...\n');

// Проверяем Git
try {
  execSync('git --version', { stdio: 'ignore' });
  console.log('✅ Git установлен');
} catch (error) {
  console.log('❌ Git не установлен');
  console.log('   Скачайте: https://git-scm.com/downloads\n');
  process.exit(1);
}

// Проверяем, инициализирован ли Git
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  console.log('✅ Git репозиторий инициализирован');
} catch (error) {
  console.log('⚠️  Git репозиторий не инициализирован');
  console.log('   Инициализирую...');
  execSync('git init', { stdio: 'inherit' });
  console.log('✅ Git репозиторий создан');
}

// Создаём .gitignore если его нет
if (!fs.existsSync('.gitignore')) {
  console.log('⚠️  .gitignore не найден, создаю...');
  const gitignore = `# dependencies
node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# database
*.db
*.db-journal
prisma/dev.db
prisma/dev.db-journal
`;
  fs.writeFileSync('.gitignore', gitignore);
  console.log('✅ .gitignore создан');
} else {
  console.log('✅ .gitignore существует');
}

// Проверяем package.json
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!pkg.scripts || !pkg.scripts.build) {
    console.log('⚠️  Добавляю build скрипт в package.json...');
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.build = 'next build';
    pkg.scripts.start = 'next start';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Build скрипты добавлены');
  } else {
    console.log('✅ Build скрипты настроены');
  }
} else {
  console.log('❌ package.json не найден!');
  process.exit(1);
}

// Создаём vercel.json для настройки
const vercelConfig = {
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
};

if (!fs.existsSync('vercel.json')) {
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ vercel.json создан');
} else {
  console.log('✅ vercel.json существует');
}

// Проверяем, есть ли коммиты
try {
  execSync('git log -1', { stdio: 'ignore' });
  console.log('✅ Есть коммиты в репозитории');
} catch (error) {
  console.log('⚠️  Нет коммитов, создаю первый...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    console.log('✅ Первый коммит создан');
  } catch (err) {
    console.log('⚠️  Не удалось создать коммит');
  }
}

// Выводим инструкции
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║              ✅ ПОДГОТОВКА ЗАВЕРШЕНА!                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📋 Следующие шаги:\n');

console.log('1️⃣  Загрузите код на GitHub:');
console.log('   • Откройте https://github.com/new');
console.log('   • Создайте репозиторий (например: couple-planner)');
console.log('   • Выполните команды:\n');
console.log('     git remote add origin https://github.com/ваш-username/couple-planner.git');
console.log('     git branch -M main');
console.log('     git push -u origin main\n');

console.log('2️⃣  Deploy на Vercel:');
console.log('   • Откройте https://vercel.com/');
console.log('   • Зарегистрируйтесь (можно через GitHub)');
console.log('   • Нажмите "Add New..." → "Project"');
console.log('   • Выберите ваш репозиторий');
console.log('   • Нажмите "Deploy"\n');

console.log('3️⃣  Добавьте переменные окружения в Vercel:');
console.log('   Settings → Environment Variables\n');

// Читаем .env и показываем переменные
if (fs.existsSync('.env')) {
  console.log('   Переменные из вашего .env:\n');
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        const cleanKey = key.trim();
        const cleanValue = value.trim().replace(/^["']|["']$/g, '');
        
        // Не показываем NEXTAUTH_URL - он будет автоматический
        if (cleanKey !== 'NEXTAUTH_URL') {
          console.log(`   ${cleanKey}`);
          console.log(`   ${cleanValue}\n`);
        }
      }
    }
  });
}

console.log('4️⃣  После deploy:');
console.log('   • Получите ваш постоянный URL');
console.log('   • Откройте на iPhone в Safari');
console.log('   • Установите как PWA');
console.log('   • Разрешите уведомления\n');

console.log('📚 Подробная инструкция: ПОСТОЯННЫЙ_URL.md\n');
