import { verifyKey } from 'discord-interactions';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  const rawBody = (await getRawBody(req)).toString();

  if (!verifyKey(rawBody, signature, timestamp, publicKey)) {
    return res.status(401).end('Invalid request signature');
  }

  const body = JSON.parse(rawBody);

  if (body.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  if (body.type === 2) {
    return res.status(200).json({
      type: 4,
      data: {
        content: `Comando recebido: ${body.data?.name ?? 'desconhecido'}`,
      },
    });
  }

  return res.status(400).end();
}
