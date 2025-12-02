import { 
  type User, 
  type InsertUser, 
  type Agent as DbAgent,
  type InsertAgent,
  type AppState,
  type InsertAppState,
  users,
  agents,
  appState
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllAgents(): Promise<DbAgent[]>;
  getAgent(id: string): Promise<DbAgent | undefined>;
  createAgent(agent: InsertAgent): Promise<DbAgent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<DbAgent | undefined>;
  deleteAgent(id: string): Promise<void>;
  updateAgentOrder(agents: { id: string; sortOrder: number }[]): Promise<void>;
  
  getAppState(): Promise<AppState | undefined>;
  updateAppState(state: Partial<InsertAppState>): Promise<AppState>;
  resetAppState(): Promise<AppState>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agentMap: Map<string, DbAgent>;
  private state: AppState | undefined;

  constructor() {
    this.users = new Map();
    this.agentMap = new Map();
    this.state = undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAgents(): Promise<DbAgent[]> {
    return Array.from(this.agentMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getAgent(id: string): Promise<DbAgent | undefined> {
    return this.agentMap.get(id);
  }

  async createAgent(agent: InsertAgent): Promise<DbAgent> {
    const id = randomUUID();
    const existingAgents = await this.getAllAgents();
    const maxOrder = existingAgents.reduce((max, a) => Math.max(max, a.sortOrder), -1);
    const newAgent: DbAgent = {
      id,
      name: agent.name,
      nickname: agent.nickname,
      restDays: agent.restDays || "Sun-Mon",
      status: agent.status || "N/A",
      assignments: agent.assignments || {},
      total: agent.total || 0,
      avatar: agent.avatar || null,
      sortOrder: maxOrder + 1,
    };
    this.agentMap.set(id, newAgent);
    return newAgent;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<DbAgent | undefined> {
    const existing = this.agentMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...agent };
    this.agentMap.set(id, updated);
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    this.agentMap.delete(id);
  }

  async updateAgentOrder(agentOrders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const { id, sortOrder } of agentOrders) {
      const agent = this.agentMap.get(id);
      if (agent) {
        this.agentMap.set(id, { ...agent, sortOrder });
      }
    }
  }

  async getAppState(): Promise<AppState | undefined> {
    return this.state;
  }

  async updateAppState(state: Partial<InsertAppState>): Promise<AppState> {
    this.state = {
      id: "default",
      headcountData: state.headcountData ?? this.state?.headcountData ?? {},
      timeSlots: state.timeSlots ?? this.state?.timeSlots ?? [],
      lockedSlots: state.lockedSlots ?? this.state?.lockedSlots ?? [],
      segmentationResults: state.segmentationResults ?? this.state?.segmentationResults ?? [],
      queueTimeSlots: state.queueTimeSlots ?? this.state?.queueTimeSlots ?? {},
      productivityImage: state.productivityImage ?? this.state?.productivityImage ?? "",
      productivityQuota: state.productivityQuota ?? this.state?.productivityQuota ?? 100,
      hasGenerated: state.hasGenerated ?? this.state?.hasGenerated ?? "false",
      lastUpdated: new Date(),
    };
    return this.state;
  }

  async resetAppState(): Promise<AppState> {
    return this.updateAppState({
      headcountData: {},
      timeSlots: [],
      lockedSlots: [],
      segmentationResults: [],
      queueTimeSlots: {},
      productivityImage: "",
      productivityQuota: 100,
      hasGenerated: "false",
    });
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllAgents(): Promise<DbAgent[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(agents).orderBy(asc(agents.sortOrder));
  }

  async getAgent(id: string): Promise<DbAgent | undefined> {
    if (!db) throw new Error("Database not available");
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<DbAgent> {
    if (!db) throw new Error("Database not available");
    const existingAgents = await this.getAllAgents();
    const maxOrder = existingAgents.reduce((max, a) => Math.max(max, a.sortOrder), -1);
    const [created] = await db.insert(agents).values({
      ...agent,
      sortOrder: maxOrder + 1,
    }).returning();
    return created;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<DbAgent | undefined> {
    if (!db) throw new Error("Database not available");
    const [updated] = await db.update(agents).set(agent).where(eq(agents.id, id)).returning();
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    if (!db) throw new Error("Database not available");
    await db.delete(agents).where(eq(agents.id, id));
  }

  async updateAgentOrder(agentOrders: { id: string; sortOrder: number }[]): Promise<void> {
    if (!db) throw new Error("Database not available");
    for (const { id, sortOrder } of agentOrders) {
      await db.update(agents).set({ sortOrder }).where(eq(agents.id, id));
    }
  }

  async getAppState(): Promise<AppState | undefined> {
    if (!db) throw new Error("Database not available");
    const [state] = await db.select().from(appState).where(eq(appState.id, "default"));
    return state;
  }

  async updateAppState(state: Partial<InsertAppState>): Promise<AppState> {
    if (!db) throw new Error("Database not available");
    const existing = await this.getAppState();
    if (existing) {
      const [updated] = await db.update(appState)
        .set({ ...state, lastUpdated: new Date() })
        .where(eq(appState.id, "default"))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(appState)
        .values({ id: "default", ...state } as any)
        .returning();
      return created;
    }
  }

  async resetAppState(): Promise<AppState> {
    const defaultState: InsertAppState = {
      headcountData: {},
      timeSlots: [],
      lockedSlots: [],
      segmentationResults: [],
      queueTimeSlots: {},
      productivityImage: "",
      productivityQuota: 100,
      hasGenerated: "false",
    };
    return this.updateAppState(defaultState);
  }
}

export const storage: IStorage = db ? new DatabaseStorage() : new MemStorage();
