const types = {
  tank: "",
  warrior: "",
  mage: ""
}


module.exports = [
  {
    name: "Рыцарь",
    file: "рыцарь",
    forBuy: false,
    intelligence: 21,
    defend: 9,
    attack: 18,
    stamina: 30,
    type: "warrior"
  },
  {
    name: "Кавалер",
    file: "кавалер",
    forBuy: true,
    intelligence: 16,
    defend: 20,
    attack: 8,
    stamina: 37,
    costType: "coins",
    cost: 200,
    type: "tank"
  },
  {
    name: "Голем",
    file: "голем",
    forBuy: true,
    intelligence: 18,
    defend: 35,
    attack: 13,
    stamina: 33,
    costType: "coins",
    cost: 500,
    type: "tank"
  }
];
