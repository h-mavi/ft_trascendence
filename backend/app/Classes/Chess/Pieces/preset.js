// @ts-check
import {movementJester} from "./movementJester.js";
import {movementValkirya} from "./movementValkirya.js";
import {movementBastards} from "./movementBastards.js";
import {movementChampion} from "./movementChampion.js";
import {movementMinotaurus} from "./movementMinotaurus.js";
import {enumNames, enumValues} from "../../../Macro/enums.js";

const preset = {
	King: {
		type: enumNames.KING,
		price: enumValues.KING,
		multipleMoves: false,
		longRange: false,
		movement: 
		[
			{dx:1, dy:1}, {dx:-1, dy:-1},//obliquo
			{dx:-1, dy:1}, {dx:1, dy:-1},
		 	{dx:0, dy:1}, {dx:0, dy:-1},//verticale
		 	{dx:1, dy:0}, {dx:-1, dy:0},//orizzontale
		],
		booster: () => {}
	},
	Champion: {
		type: enumNames.CHAMPION,
		price: enumValues.CHAMPION,
		multipleMoves: true,
		longRange: true,
		movement:
		[
			{dx:1, dy:1}, {dx:-1, dy:-1}, //obliquo
			{dx:-1, dy:1}, {dx:1, dy:-1},
		 	{dx:0, dy:1}, {dx:0, dy:-1}, //orizzontale
		 	{dx:1, dy:0}, {dx:-1, dy:0}, //verticale
		],
		booster: movementChampion
	},
	Jester: {
		type: enumNames.JESTER,
		price: enumValues.JESTER,
		multipleMoves: false,
		longRange: false,
		movement:
		[
			{dx:2, dy:1}, {dx:2, dy:-1}, // +2 verticale
			{dx:-2, dy:1}, {dx:-2, dy:-1},
			{dx:1, dy:2}, {dx:1, dy:-2}, // +2 orizzontale
			{dx:-1, dy:2}, {dx:-1, dy:-2},
		],
		booster: movementJester
	},
	Valkirya: {
		type: enumNames.VALKIRYA,
		price: enumValues.VALKIRYA,
		multipleMoves: false,
		longRange: true,
		movement:
		[
			{dx:1, dy:1}, {dx:-1, dy:-1},//obliquo
			{dx:-1, dy:1}, {dx:1, dy:-1},
		],
		booster: movementValkirya
	},
	Minotaurus: {
		type: enumNames.MINOTAURUS,
		price: enumValues.MINOTAURUS,
		multipleMoves: true,
		longRange: true,
		movement:
		[
		 	{dx:0, dy:1}, {dx:0, dy:-1},//orizzontale
		 	{dx:1, dy:0}, {dx:-1, dy:0},//verticale
		],
		booster: movementMinotaurus
	},
	Bastards: {
		type: enumNames.BASTARDS,
		price: enumValues.BASTARDS,
		multipleMoves: true,
		longRange: false,
		movement:
		[
			{dx:1, dy:0}, {dx:-1, dy:0},//orizzontale
			{dx:0, dy:1}, {dx:0, dy:-1},//verticale
			{dx:1, dy:1}, {dx:-1, dy:-1},//obliquo
			{dx:-1, dy:1}, {dx:1, dy:-1}
		],
		booster: movementBastards	
	},
	Mage: {
		type: enumNames.MAGE,
		price: 3, // da capire
		multipleMoves: false,
		longRange: false,
		movement: [], // da capire
		booster: null
	},
	Ghoul: {
		type: enumNames.GHOUL,
		price: 3, // da capire
		multipleMoves: false,
		longRange: false,
		movement: [], // da capire
		booster: null
	},
}

class Preset
{
	/**
	 * 
	 * @param {string} type 
	 */
	constructor(type)
	{
		let	info;

		// @ts-ignore
		
		info = preset[type];
		if (!info)
			throw (`Preset: Invalid piece type ${type}`);
		/** @type {string} */							this.type = info.type;
		/** @type {number} */							this.price = info.price;
		/** @type {Array<{dx: number, dy:number}>} */	this.movement;
		/** @type {function} */							this.booster = info.booster;
		/** @type {boolean} */							this.multipleMoves = info.multipleMoves;
		/** @type {boolean} */							this.longRange = info.longRange;

		this.movement = [];
		for (const movement of info.movement)
		{
			this.movement.push({dx: movement.dx, dy: movement.dy});
		}
	}
}

export {Preset, preset};
