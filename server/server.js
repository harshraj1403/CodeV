import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY, // This is the default and can be omitted
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeV!',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 4096, // The maximum number of tokens to generate in the completion.
      top_p: 1, // Alternative to sampling with temperature, called nucleus sampling.
      frequency_penalty: 0.5, // Positive values penalize new tokens based on their existing frequency in the text so far.
      presence_penalty: 0, // Positive values penalize new tokens based on whether they appear in the text so far.
    });

    res.status(200).send({
      bot: response.choices[0].text,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error || 'Something went wrong');
  }
});

app.listen(5000, () => console.log('AI server started on http://localhost:5000'));
