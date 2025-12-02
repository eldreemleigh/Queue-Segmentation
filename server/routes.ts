import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const agent = await storage.createAgent(req.body);
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.updateAgent(req.params.id, req.body);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      await storage.deleteAgent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  app.post("/api/agents/reorder", async (req, res) => {
    try {
      await storage.updateAgentOrder(req.body.agents);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder agents" });
    }
  });

  app.get("/api/state", async (req, res) => {
    try {
      let state = await storage.getAppState();
      if (!state) {
        state = await storage.updateAppState({
          headcountData: {},
          timeSlots: [],
          lockedSlots: [],
          segmentationResults: [],
          productivityImage: "",
          productivityQuota: 100,
          hasGenerated: "false",
        });
      }
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app state" });
    }
  });

  app.patch("/api/state", async (req, res) => {
    try {
      const state = await storage.updateAppState(req.body);
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to update app state" });
    }
  });

  app.post("/api/state/reset", async (req, res) => {
    try {
      const state = await storage.resetAppState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset app state" });
    }
  });

  return httpServer;
}
