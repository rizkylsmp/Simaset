import sequelize from "../src/config/database.js";

const initialResponses = [
  ["Febri Ardiyanto", "Umum", [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], "2026-04-07T19:45:23+07:00"],
  ["Agus Andrijono", "BPKA", [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], "2026-04-10T10:59:51+07:00"],
  ["Dani M", "BPKA", [5, 4, 5, 5, 5, 5, 5, 4, 5, 4, 5], "2026-04-10T11:00:11+07:00"],
  ["Mohammad Khisanul Masobih, S.Kom", "BPKA", [4, 4, 5, 4, 4, 4, 4, 5, 5, 4, 5], "2026-04-10T11:00:45+07:00"],
  ["Sumarto", "BPKA", [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], "2026-04-10T11:00:53+07:00"],
  ["Yudy", "BPKA", [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], "2026-04-10T11:01:10+07:00"],
  ["Lutfi", "BPKA", [5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 4], "2026-04-10T11:04:11+07:00"],
  ["Sumarto", "BPKA", [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], "2026-04-10T11:05:19+07:00"],
  ["HARIYANTO", "BPKA", [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], "2026-04-10T11:05:42+07:00"],
  ["DWI ANDI OKTAVIANUS", "BPKA", [5, 5, 5, 4, 4, 4, 5, 4, 5, 5, 4], "2026-04-10T11:07:58+07:00"],
];

await sequelize.query(`
  CREATE TABLE IF NOT EXISTS ekasmat_responses (
    id_ekasmat SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    sumber VARCHAR(50) NOT NULL DEFAULT 'Umum',
    skor JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  )
`);

for (const [nama, sumber, skor, submittedAt] of initialResponses) {
  await sequelize.query(
    `
      INSERT INTO ekasmat_responses
        (nama, sumber, skor, submitted_at, created_at, updated_at)
      SELECT $1::varchar, $2::varchar, $3::jsonb, $4::timestamptz, $4::timestamptz, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM ekasmat_responses
        WHERE nama = $1::varchar AND submitted_at = $4::timestamptz
      )
    `,
    {
      bind: [nama, sumber, JSON.stringify(skor), submittedAt],
    },
  );
}

const [result] = await sequelize.query(
  "SELECT COUNT(*)::int AS count FROM ekasmat_responses",
);

console.log(`ekasmat_responses rows: ${result[0].count}`);
await sequelize.close();
