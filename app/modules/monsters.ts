import { Database } from 'sql.js';

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  size: MonsterSize;
  
  // Core Stats
  armorClass: number;
  hitPoints: number;
  speed: number;
  
  // Ability Scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Combat Relevant
  challengeRating: number;
  experiencePoints: number;
  
  // Defensive Capabilities
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  
  // Offensive Capabilities
  attacks: MonsterAttack[];
  
  // Additional Characteristics
  alignment: Alignment;
  environment?: string[];
  
  // Special Abilities
  specialAbilities?: SpecialAbility[];
  
  // Lore and Description
  description?: string;
  lore?: string;
}

export type MonsterType = 
  | 'Aberration'
  | 'Beast'
  | 'Celestial'
  | 'Construct'
  | 'Dragon'
  | 'Elemental'
  | 'Fey'
  | 'Fiend'
  | 'Giant'
  | 'Humanoid'
  | 'Monstrosity'
  | 'Ooze'
  | 'Plant'
  | 'Undead';

export type MonsterSize = 
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan';

export type Alignment = 
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'Lawful Neutral'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';

export interface MonsterAttack {
  name: string;
  type: 'Melee' | 'Ranged';
  damage: string;
  damageType: string;
  toHitBonus: number;
}

export interface SpecialAbility {
  name: string;
  description: string;
}

export class MonsterManager {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
    this.initializeMonstersTable();
  }

  private initializeMonstersTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS monsters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        size TEXT,
        armorClass INTEGER,
        hitPoints INTEGER,
        speed INTEGER,
        strength INTEGER,
        dexterity INTEGER,
        constitution INTEGER,
        intelligence INTEGER,
        wisdom INTEGER,
        charisma INTEGER,
        challengeRating REAL,
        experiencePoints INTEGER,
        damageResistances TEXT,
        damageImmunities TEXT,
        conditionImmunities TEXT,
        attacks TEXT,
        alignment TEXT,
        environment TEXT,
        specialAbilities TEXT,
        description TEXT,
        lore TEXT
      )
    `);
  }

  createMonster(monster: Omit<Monster, 'id'>): Monster {
    const newMonster: Monster = {
      id: crypto.randomUUID(),
      ...monster
    };

    this.db.run(`
      INSERT INTO monsters (
        id, name, type, size, armorClass, hitPoints, speed,
        strength, dexterity, constitution, intelligence, 
        wisdom, charisma, challengeRating, experiencePoints,
        damageResistances, damageImmunities, conditionImmunities,
        attacks, alignment, environment, specialAbilities, 
        description, lore
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newMonster.id,
      newMonster.name,
      newMonster.type,
      newMonster.size,
      newMonster.armorClass,
      newMonster.hitPoints,
      newMonster.speed,
      newMonster.strength,
      newMonster.dexterity,
      newMonster.constitution,
      newMonster.intelligence,
      newMonster.wisdom,
      newMonster.charisma,
      newMonster.challengeRating,
      newMonster.experiencePoints,
      newMonster.damageResistances 
        ? JSON.stringify(newMonster.damageResistances) 
        : null,
      newMonster.damageImmunities 
        ? JSON.stringify(newMonster.damageImmunities) 
        : null,
      newMonster.conditionImmunities 
        ? JSON.stringify(newMonster.conditionImmunities) 
        : null,
      JSON.stringify(newMonster.attacks),
      newMonster.alignment,
      newMonster.environment 
        ? JSON.stringify(newMonster.environment) 
        : null,
      newMonster.specialAbilities 
        ? JSON.stringify(newMonster.specialAbilities) 
        : null,
      newMonster.description || null,
      newMonster.lore || null
    ]);

    return newMonster;
  }

  getMonstersByType(type: MonsterType): Monster[] {
    const results = this.db.exec(`SELECT * FROM monsters WHERE type = ?`, [type]);
    return results[0]?.values.map(row => this.mapRowToMonster(row)) || [];
  }

  getMonstersByChallengRating(minCR: number, maxCR: number): Monster[] {
    const results = this.db.exec(
      `SELECT * FROM monsters WHERE challengeRating BETWEEN ? AND ?`, 
      [minCR, maxCR]
    );
    return results[0]?.values.map(row => this.mapRowToMonster(row)) || [];
  }

  getMonsterById(id: string): Monster | null {
    const results = this.db.exec(`SELECT * FROM monsters WHERE id = ?`, [id]);
    const row = results[0]?.values[0];
    
    return row ? this.mapRowToMonster(row) : null;
  }

  updateMonster(id: string, updates: Partial<Monster>): Monster | null {
    const monster = this.getMonsterById(id);
    if (!monster) return null;

    const updatedMonster = { ...monster, ...updates };

    this.db.run(`
      UPDATE monsters SET 
        name = ?, type = ?, size = ?, armorClass = ?, hitPoints = ?, 
        speed = ?, strength = ?, dexterity = ?, constitution = ?, 
        intelligence = ?, wisdom = ?, charisma = ?, challengeRating = ?, 
        experiencePoints = ?, damageResistances = ?, damageImmunities = ?, 
        conditionImmunities = ?, attacks = ?, alignment = ?, 
        environment = ?, specialAbilities = ?, description = ?, lore = ?
      WHERE id = ?
    `, [
      updatedMonster.name,
      updatedMonster.type,
      updatedMonster.size,
      updatedMonster.armorClass,
      updatedMonster.hitPoints,
      updatedMonster.speed,
      updatedMonster.strength,
      updatedMonster.dexterity,
      updatedMonster.constitution,
      updatedMonster.intelligence,
      updatedMonster.wisdom,
      updatedMonster.charisma,
      updatedMonster.challengeRating,
      updatedMonster.experiencePoints,
      updatedMonster.damageResistances 
        ? JSON.stringify(updatedMonster.damageResistances) 
        : null,
      updatedMonster.damageImmunities 
        ? JSON.stringify(updatedMonster.damageImmunities) 
        : null,
      updatedMonster.conditionImmunities 
        ? JSON.stringify(updatedMonster.conditionImmunities) 
        : null,
      JSON.stringify(updatedMonster.attacks),
      updatedMonster.alignment,
      updatedMonster.environment 
        ? JSON.stringify(updatedMonster.environment) 
        : null,
      updatedMonster.specialAbilities 
        ? JSON.stringify(updatedMonster.specialAbilities) 
        : null,
      updatedMonster.description || null,
      updatedMonster.lore || null,
      id
    ]);

    return updatedMonster;
  }

  deleteMonster(id: string): boolean {
    const result = this.db.run(`DELETE FROM monsters WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  private mapRowToMonster(row: any[]): Monster {
    return {
      id: row[0],
      name: row[1],
      type: row[2],
      size: row[3],
      armorClass: row[4],
      hitPoints: row[5],
      speed: row[6],
      strength: row[7],
      dexterity: row[8],
      constitution: row[9],
      intelligence: row[10],
      wisdom: row[11],
      charisma: row[12],
      challengeRating: row[13],
      experiencePoints: row[14],
      damageResistances: row[15] ? JSON.parse(row[15]) : undefined,
      damageImmunities: row[16] ? JSON.parse(row[16]) : undefined,
      conditionImmunities: row[17] ? JSON.parse(row[17]) : undefined,
      attacks: JSON.parse(row[18]),
      alignment: row[19],
      environment: row[20] ? JSON.parse(row[20]) : undefined,
      specialAbilities: row[21] ? JSON.parse(row[21]) : undefined,
      description: row[22],
      lore: row[23]
    };
  }
}
