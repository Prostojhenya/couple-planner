# ✅ Zoom к точке касания исправлен!

## Что изменилось

### Было:
- ❌ Zoom всегда от центра экрана
- ❌ При pinch карта "прыгает"
- ❌ Неудобно масштабировать конкретную область

### Стало:
- ✅ Zoom к точке, где находятся пальцы (focal point)
- ✅ Плавное масштабирование без "прыжков"
- ✅ Точка между пальцами остаётся на месте

## Как это работает

### Pinch-to-Zoom (два пальца):

```
1. Поставьте два пальца на карту
   ↓
2. Вычисляется focal point (центр между пальцами)
   ↓
3. Разведите/сведите пальцы
   ↓
4. Карта масштабируется К ЭТОЙ ТОЧКЕ
   ↓
5. Focal point остаётся неподвижным!
```

### Mouse Wheel (колёсико мыши):

```
1. Наведите курсор на нужную область
   ↓
2. Прокрутите колёсико
   ↓
3. Карта масштабируется К КУРСОРУ
   ↓
4. Точка под курсором остаётся на месте!
```

### Кнопки +/− :

```
1. Нажмите + или −
   ↓
2. Карта масштабируется К ЦЕНТРУ ЭКРАНА
   ↓
3. Центр экрана остаётся на месте
```

## Математика

### Формула zoom к точке:

```typescript
// 1. Вычисляем координаты точки в canvas до zoom
const canvasX = (focalX - offset.x) / scale;
const canvasY = (focalY - offset.y) / scale;

// 2. Применяем новый масштаб
const newScale = scale + delta;

// 3. Вычисляем новый offset, чтобы точка осталась на месте
const newOffsetX = focalX - canvasX * newScale;
const newOffsetY = focalY - canvasY * newScale;
```

### Где:
- `focalX, focalY` - точка на экране (между пальцами или курсор)
- `canvasX, canvasY` - координаты этой точки в canvas
- `offset` - текущее смещение canvas
- `scale` - текущий масштаб
- `newScale` - новый масштаб

## Примеры использования

### Пример 1: Увеличить конкретный кластер

1. Поставьте два пальца на кластер
2. Разведите пальцы
3. ✅ Кластер увеличивается, оставаясь между пальцами

### Пример 2: Уменьшить всю карту

1. Поставьте два пальца в центре
2. Сведите пальцы
3. ✅ Карта уменьшается от центра

### Пример 3: Zoom колёсиком (десктоп)

1. Наведите курсор на HUB
2. Прокрутите колёсико вверх
3. ✅ HUB увеличивается, оставаясь под курсором

## Технические детали

### Вычисление focal point для pinch:

```typescript
const focalX = (touch1.clientX + touch2.clientX) / 2;
const focalY = (touch1.clientY + touch2.clientY) / 2;
```

### Вычисление focal point для wheel:

```typescript
const rect = containerRef.current?.getBoundingClientRect();
const mouseX = e.clientX - rect.left;
const mouseY = e.clientY - rect.top;
```

### Вычисление focal point для кнопок:

```typescript
const centerX = rect.width / 2;
const centerY = rect.height / 2;
```

## Сравнение с другими приложениями

### Google Maps:
- ✅ Zoom к точке касания
- ✅ Плавное масштабирование
- ✅ Точка остаётся на месте

### Наше приложение:
- ✅ Zoom к точке касания (теперь!)
- ✅ Плавное масштабирование
- ✅ Точка остаётся на месте

## Визуальная демонстрация

### До исправления:
```
Пальцы на кластере A
    ↓
Разводим пальцы
    ↓
Карта увеличивается от центра
    ↓
❌ Кластер A "уехал" в сторону
```

### После исправления:
```
Пальцы на кластере A
    ↓
Разводим пальцы
    ↓
Карта увеличивается К КЛАСТЕРУ A
    ↓
✅ Кластер A остался между пальцами
```

## Преимущества

1. **Интуитивность** - работает как в Google Maps
2. **Точность** - можно увеличить именно нужную область
3. **Плавность** - нет "прыжков" карты
4. **Предсказуемость** - точка под пальцами не двигается

## Код изменений

### Pinch zoom:
```typescript
// Вычисляем focal point
const focalX = (touch1.clientX + touch2.clientX) / 2;
const focalY = (touch1.clientY + touch2.clientY) / 2;

// Вычисляем координаты в canvas
const canvasX = (focalX - offset.x) / scale;
const canvasY = (focalY - offset.y) / scale;

// Применяем новый масштаб с сохранением focal point
const newOffsetX = focalX - canvasX * newScale;
const newOffsetY = focalY - canvasY * newScale;

setScale(newScale);
setOffset({ x: newOffsetX, y: newOffsetY });
```

### Mouse wheel zoom:
```typescript
// Получаем позицию курсора
const rect = containerRef.current?.getBoundingClientRect();
const mouseX = e.clientX - rect.left;
const mouseY = e.clientY - rect.top;

// Вычисляем координаты в canvas
const canvasX = (mouseX - offset.x) / scale;
const canvasY = (mouseY - offset.y) / scale;

// Применяем новый масштаб с сохранением точки под курсором
const newOffsetX = mouseX - canvasX * newScale;
const newOffsetY = mouseY - canvasY * newScale;

setScale(newScale);
setOffset({ x: newOffsetX, y: newOffsetY });
```

## Проверка

### Тест 1: Pinch на кластере
1. Откройте `/dashboard`
2. Поставьте два пальца на любой кластер
3. Разведите пальцы
4. ✅ Кластер увеличивается, оставаясь между пальцами

### Тест 2: Wheel на HUB
1. Наведите курсор на центральный HUB
2. Прокрутите колёсико вверх
3. ✅ HUB увеличивается, оставаясь под курсором

### Тест 3: Кнопка + в центре
1. Нажмите кнопку +
2. ✅ Карта увеличивается от центра экрана

## Известные особенности

### 1. Кнопки +/− масштабируют к центру
Это сделано специально, так как нет явной "точки интереса"

### 2. Кнопка ⟲ сбрасывает всё
Возвращает scale=1 и offset=(0,0)

### 3. Границы масштаба
Минимум 0.5x, максимум 3x

## Файлы изменены

- `src/components/MindMapCanvas.tsx`
  - Обновлён `handleTouchMove()` - добавлен focal point для pinch
  - Обновлён `handleWheel()` - добавлен focal point для wheel
  - Обновлены кнопки +/− - zoom к центру экрана

---

**Готово!** Теперь zoom работает правильно - к точке касания! 🎯

Как в Google Maps, Figma, и других профессиональных приложениях.
