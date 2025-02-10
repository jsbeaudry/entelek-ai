// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ollama from "ollama";

export default async function handler(req, res) {
  const list = await ollama.list();

  res.status(200).json(list);
}
