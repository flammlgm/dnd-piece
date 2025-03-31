export const useClassesStore = [
  {
    id: 1,
    text: "Артист",
    image: "/image/Classes/Artist.jpg",
    objectPosition: "50%",
    description: "Мастер харизмы и выступлений, вдохновляющий союзников и деморализующий врагов.",
    hitDice: "1d8 за уровень",
    primaryAbility: "Харизма",
    savingThrows: ["Ловкость", "Харизма"],
    skills: ["Акробатика", "Актёрство", "Запугивание", "Убеждение"],
    features: [
      {
        name: "Вдохновляющее выступление",
        level: 1,
        description: "1/день может дать +2 к броскам атаки союзникам на 10 минут"
      },
      {
        name: "Критический выход",
        level: 3,
        description: "При натуральной 20 на атаке - дополнительный эффект (оглушение/испуг)"
      }
    ],
    progression: [
      { level: 1, bonuses: "Вдохновляющее выступление" },
      { level: 3, bonuses: "Критический выход" }
    ]
  },
  {
    id: 2,
    text: "Воин",
    image: "/image/Classes/Warrior.jpg",
    objectPosition: "90% 10%",
    description: "Универсальный боец, мастер всех видов оружия и тактик ближнего боя.",
    hitDice: "1d10 за уровень",
    primaryAbility: "Сила",
    savingThrows: ["Сила", "Выносливость"],
    skills: ["Атлетика", "Запугивание", "Выживание", "Внимание"],
    features: [
      {
        name: "Боевой стиль",
        level: 1,
        description: "Выберите специализацию: Двуручное, Дуэль или Защита"
      },
      {
        name: "Дополнительная атака",
        level: 5,
        description: "Может атаковать 2 раза за ход"
      }
    ],
    progression: [
      { level: 1, bonuses: "Боевой стиль" },
      { level: 5, bonuses: "Дополнительная атака" }
    ]
  },
  {
    id: 3,
    text: "Громила",
    image: "/image/Classes/Bruiser.jpg",
    objectPosition: "90% 10%",
    description: "Живой таран, сокрушающий врагов грубой силой и массой тела.",
    hitDice: "1d12 за уровень",
    primaryAbility: "Сила",
    savingThrows: ["Сила", "Выносливость"],
    skills: ["Атлетика", "Запугивание", "Выносливость", "Выживание"],
    features: [
      {
        name: "Сокрушительный удар",
        level: 1,
        description: "+2 к урону при атаке двумя руками"
      },
      {
        name: "Неудержимый",
        level: 4,
        description: "Игнорирует труднопроходимую местность"
      }
    ],
    progression: [
      { level: 1, bonuses: "Сокрушительный удар" },
      { level: 4, bonuses: "Неудержимый" }
    ]
  },
  {
    id: 4,
    text: "Изобретатель",
    image: "/image/Classes/Tinkerer.jpg",
    objectPosition: "90% 10%",
    description: "Гений инженерии, создающий смертоносные устройства и полезные гаджеты.",
    hitDice: "1d8 за уровень",
    primaryAbility: "Интеллект",
    savingThrows: ["Интеллект", "Ловкость"],
    skills: ["История", "Мастерство", "Проницательность", "Внимание"],
    features: [
      {
        name: "Изобретения",
        level: 1,
        description: "Может создавать 3 простых устройства в день (гранаты, ловушки)"
      },
      {
        name: "Улучшенные устройства",
        level: 5,
        description: "Изобретения получают +2 к эффективности"
      }
    ],
    progression: [
      { level: 1, bonuses: "Изобретения" },
      { level: 5, bonuses: "Улучшенные устройства" }
    ]
  },
  {
    id: 5,
    text: "Мастер Боевых Искусств",
    image: "/image/Classes/Martial_Artist.jpg",
    objectPosition: "90% 10%",
    description: "Боец, использующий энергию тела для сверхчеловеческих подвигов.",
    hitDice: "1d10 за уровень",
    primaryAbility: "Ловкость",
    savingThrows: ["Ловкость", "Мудрость"],
    skills: ["Акробатика", "Атлетика", "Проницательность", "Скрытность"],
    features: [
      {
        name: "Ки",
        level: 1,
        description: "3 очка Ки для спецприёмов (удар сквозь стены, бег по воде)"
      },
      {
        name: "Уклонение",
        level: 6,
        description: "Может избежать урона от областей эффектов"
      }
    ],
    progression: [
      { level: 1, bonuses: "Ки (3 очка)" },
      { level: 6, bonuses: "Уклонение" }
    ]
  },
  {
    id: 6,
    text: "Охотник",
    image: "/image/Classes/Rogue.jpg",
    objectPosition: "90% 10%",
    description: "Следопыт и мастер скрытных атак, специалист по выживанию и охоте.",
    hitDice: "1d8 за уровень",
    primaryAbility: "Ловкость",
    savingThrows: ["Ловкость", "Интеллект"],
    skills: ["Скрытность", "Внимание", "Выживание", "Акробатика"],
    features: [
      {
        name: "Скрытая атака",
        level: 1,
        description: "+2d6 урона при атаке из засады"
      },
      {
        name: "Инстинкты охотника",
        level: 3,
        description: "Преимущество на проверки Внимания"
      }
    ],
    progression: [
      { level: 1, bonuses: "Скрытая атака" },
      { level: 3, bonuses: "Инстинкты охотника" }
    ]
  },
  {
    id: 7,
    text: "Священник",
    image: "/image/Classes/Priest.jpg",
    objectPosition: "top",
    description: "Проводник божественной силы, исцеляющий союзников и карающий нечестивцев.",
    hitDice: "1d8 за уровень",
    primaryAbility: "Мудрость",
    savingThrows: ["Мудрость", "Харизма"],
    skills: ["Проницательность", "Медицина", "Убеждение", "История"],
    features: [
      {
        name: "Божественные заклинания",
        level: 1,
        description: "Доступ к заклинаниям 1-го круга (лечение, благословение)"
      },
      {
        name: "Изгнание нечисти",
        level: 5,
        description: "1/день может попытаться изгнать демонических существ"
      }
    ],
    progression: [
      { level: 1, bonuses: "Божественные заклинания" },
      { level: 5, bonuses: "Изгнание нечисти" }
    ]
  },
  {
    id: 8,
    text: "Стрелок",
    image: "/image/Classes/Marksman.jpg",
    objectPosition: "80% 30%",
    description: "Снайпер, поражающий цели с невероятной точностью на любых дистанциях.",
    hitDice: "1d8 за уровень",
    primaryAbility: "Ловкость",
    savingThrows: ["Ловкость", "Внимание"],
    skills: ["Внимание", "Скрытность", "Выживание", "Акробатика"],
    features: [
      {
        name: "Прицельный выстрел",
        level: 1,
        description: "+5 к атаке при полном действии"
      },
      {
        name: "Смертельный выстрел",
        level: 4,
        description: "Крит на 19-20"
      }
    ],
    progression: [
      { level: 1, bonuses: "Прицельный выстрел" },
      { level: 4, bonuses: "Смертельный выстрел" }
    ]
  },
  {
    id: 9,
    text: "Химик",
    image: "/image/Classes/Chemist.jpg",
    objectPosition: "90% 40%",
    description: "Алхимик, создающий зелья, яды и взрывчатые смеси.",
    hitDice: "1d6 за уровень",
    primaryAbility: "Интеллект",
    savingThrows: ["Интеллект", "Ловкость"],
    skills: ["Мастерство", "Медицина", "Проницательность", "Обман"],
    features: [
      {
        name: "Алхимические препараты",
        level: 1,
        description: "Может создавать 3 зелья/яда в день"
      },
      {
        name: "Нестабильная химия",
        level: 3,
        description: "20% шанс усиленного эффекта"
      }
    ],
    progression: [
      { level: 1, bonuses: "Алхимические препараты" },
      { level: 3, bonuses: "Нестабильная химия" }
    ]
  }
]