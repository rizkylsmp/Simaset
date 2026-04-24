import { EkasmatResponse } from "../models/index.js";

export const getAll = async (req, res) => {
  try {
    const data = await EkasmatResponse.findAll({
      order: [["submitted_at", "ASC"]],
    });

    res.json({
      success: true,
      data: data.map((item) => ({
        id: item.id_ekasmat,
        timestamp: item.submitted_at,
        name: item.nama,
        source: item.sumber,
        scores: item.skor,
      })),
    });
  } catch (error) {
    console.error("EKASMAT getAll error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const submit = async (req, res) => {
  try {
    const { name, source = "Umum", scores } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Nama wajib diisi" });
    }

    if (
      !Array.isArray(scores) ||
      scores.length !== 11 ||
      scores.some((score) => !Number.isInteger(Number(score)) || score < 1 || score > 5)
    ) {
      return res.status(400).json({
        error: "Skor kuisioner tidak valid",
      });
    }

    const response = await EkasmatResponse.create({
      nama: name.trim(),
      sumber: source,
      skor: scores.map(Number),
      submitted_at: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: response.id_ekasmat,
        timestamp: response.submitted_at,
        name: response.nama,
        source: response.sumber,
        scores: response.skor,
      },
    });
  } catch (error) {
    console.error("EKASMAT submit error:", error);
    res.status(500).json({ error: error.message });
  }
};
