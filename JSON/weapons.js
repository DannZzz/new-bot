

var blockedForBuy = [];

var method = {
  findWeapon: function (id) {
    const result = weaponArray.find(weaponObj => weaponObj.id == id);
    return result;
  },
  randomWeapon: function (excludes = []) {
    const randomIndex = Math.floor(Math.random() * weaponArray.length);
    let item = weaponArray[randomIndex];
    if (Array.isArray(excludes) && excludes.length > 0 && excludes.length < weaponArray.length) {
        if (excludes.includes(item.id)) return this.randomWeapon(excludes);
    }
    return item;
  }
}

var weaponArray = [
  {
    id: 1,
    name: "Bow",
    emoji: "<:bow:920988161855852605>",
    bonus: {
      attack: 2
    },
    cost: 450
  },
  {
    id: 2,
    name: "Lyan",
    emoji: "<:Lyan:920988162212392991>",
    bonus: {
      attack: 1,
      intelligence: 2
    },
    cost: 600
  },
  {
    id: 3,
    name: "Soul Killer",
    emoji: "<:soulkiller:920988163596496917>",
    bonus: {
      attack: 3,
      stamina: 2
    },
    cost: 1430
  },
  {
    id: 4,
    name: "Nature Hunter",
    emoji: "<:naturehunter:920988163596496916>",
    bonus: {
      attack: 8,
    },
    cost: 2000
  },
  {
    id: 5,
    name: "Pirate's Hand",
    emoji: "<:pirateshand:922115741057187880>",
    bonus: {
      attack: 2,
      defend: 3
    },
    cost: 900
  },
  {
    id: 6,
    name: "Diasword",
    emoji: "<:diasword:922115741266886676>",
    bonus: {
      attack: 5,
      defend: 2
    },
    cost: 1150
  },
  {
    id: 7,
    name: "Clik",
    emoji: "<:clik:922115740679688233>",
    bonus: {
      attack: 6
    },
    cost: 1260
  },
  {
    id: 8,
    name: "Arabian Dance",
    emoji: "<:arabiandance:922115741526941716>",
    bonus: {
      attack: 15
    },
    cost: 250,
    costType: "coins"
  },
  {
    id: 9,
    name: "Night Soul",
    emoji: "<:nightsoul:922115741266886677>",
    bonus: {
      attack: 12,
      intelligence: 5
    },
    cost: 2500
  },
  {
    id: 10,
    name: "Amulet of Sahara",
    emoji: "<:amuletofsahara:922122344946868284>",
    bonus: {
      defend: 5,
    },
    cost: 1000
  },
  {
    id: 11,
    name: "Amulet of Wings",
    emoji: "<:amuletofwings:922122344892358677>",
    bonus: {
      intelligence: 5,
    },
    cost: 1000
  },
  {
    id: 12,
    name: "Amulet of Attack",
    emoji: "<:amuletofattack:922122344489701376>",
    bonus: {
      attack: 5,
    },
    cost: 1000
  },
  {
    id: 13,
    name: "Wooden Shield",
    emoji: "<:woodenshiel:922122252370214952>",
    bonus: {
      defend: 2,
    },
    cost: 310
  },
  {
    id: 14,
    name: "Barbarian Shield",
    emoji: "<:barbarianshield:922122344422588447>",
    bonus: {
      defend: 3,
      stamina: 1
    },
    cost: 500
  },
  {
    id: 15,
    name: "Viking's Shield",
    emoji: "<:vikingsshield:922122344443576340>",
    bonus: {
      defend: 5,
      stamina: 2
    },
    cost: 650
  },
  {
    id: 16,
    name: "Rock Shield",
    emoji: "<:rockshield:922122344510677022>",
    bonus: {
      defend: 7
    },
    cost: 1100
  },
  {
    id: 17,
    name: "Frozen Shield",
    emoji: "<:frozenshield:922122344586178580>",
    bonus: {
      defend: 3,
      stamina: 11
    },
    cost: 2300
  },
  {
    id: 18,
    name: "Shield of Cobra",
    emoji: "<:shildofcobra:922122344586178583>",
    bonus: {
      defend: 9,
      stamina: 8
    },
    cost: 2450
  }

];

module.exports = {
  weaponArray,
  method,
  blocked: blockedForBuy
};
