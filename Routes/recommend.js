import express from "express";
const router = express.Router();
import nlp from "compromise"; // lightweight NLP library

const symptomToSpecialty = {
  cough: "Pediatrician",
  breathing: "Cardiologist",
  fever: "Pediatrician",
  headache: "Neurologist",
  skin: "Dermatologist",
  rash: "Dermatologist",
  joint: "Orthopedic-Surgeon",
  "joint pain": "Orthopedic-Surgeon",
  "leg pain": "Orthopedic-Surgeon",
  "back pain": "Orthopedic-Surgeon",
  "chest pain": "Cardiologist",
  "head pain": "Neurologist",
  "stomach pain": "Pediatrician",
  "throat pain": "Pediatrician",
  "labor pain": "Pediatrician",
  "pregnancy pain": "Pediatrician",
  dizziness: "Neurologist",
  anxiety: "Psychiatrist",
  depression: "Psychiatrist",
  tumor: "Oncologist",
  cancer: "Oncologist",
  seizure: "Neurologist",
  injury: "Surgeon",
  fracture: "Orthopedic-Surgeon",
  trauma: "Surgeon",
  baby: "Pediatrician",
  child: "Pediatrician",
  delivery: "Pediatrician",
  pregnancy: "Pediatrician",
  pregnant: "Pediatrician",
  uterus: "Pediatrician",
  contractions: "Pediatrician",
};

router.post("/", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const normalizedQuery = query.toLowerCase();

  const matchedSpecialties = [];

  // Match both phrases and single words
  Object.keys(symptomToSpecialty).forEach((symptom) => {
    if (normalizedQuery.includes(symptom)) {
      matchedSpecialties.push(symptomToSpecialty[symptom]);
    }
  });

  const unique = [...new Set(matchedSpecialties)];
  res.json(unique.length ? unique.slice(0, 2) : ["Pediatrician"]);
});

export default router;
